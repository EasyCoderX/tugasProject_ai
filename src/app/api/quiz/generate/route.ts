import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { withRetry, isOverloadError } from '@/lib/retry';
import { withQueue } from '@/lib/zai-queue';

export async function POST(req: NextRequest) {
  try {
    const { name, category, description, language, recentNames } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Object name is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const langInstructions: Record<string, string> = {
      en: 'Respond in English.',
      id: 'Respond in Bahasa Indonesia (Indonesian). All wrong answers must be in Indonesian.',
      zh: 'Respond in Simplified Chinese (简体中文). All wrong answers must be in Chinese.',
    };
    const langRule = langInstructions[language] || langInstructions.en;

    const recentNamesStr = Array.isArray(recentNames) && recentNames.length > 0
      ? recentNames.slice(0, 10).join(', ')
      : '';

    const prompt = `You are creating a fun quiz for young children (ages 3-8)!

${langRule}

The correct answer is: "${name}"
Category: ${category || 'Other'}
Description: ${description || ''}
${recentNamesStr ? `Recent objects the child has seen: ${recentNamesStr}` : ''}

Generate exactly 8 wrong but plausible answer options that:
- Are incorrect (not the correct answer)
- Are plausible distractors a young child might genuinely confuse with the correct answer
- Mix of: same category, related categories, and visually similar items
${recentNamesStr ? '- Prefer using objects from the "Recent objects" list above when relevant' : ''}
- Are simple words a 4-year-old would know
- Are all different from each other and the correct answer

Respond with ONLY a valid JSON array of 8 strings, nothing else:
["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8"]`;

    const response = await withQueue(() => withRetry(async () => {
      const z = await ZAI.create();
      return await z.chat.completions.create({
        model: 'glm-4.7-flash',
        messages: [{ role: 'user', content: prompt }],
      });
    }));

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Failed to generate options' }, { status: 500 });
    }

    let wrongAnswers: string[];
    try {
      wrongAnswers = JSON.parse(content);
      if (!Array.isArray(wrongAnswers) || wrongAnswers.length < 3) throw new Error('Invalid format');
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try { wrongAnswers = JSON.parse(match[0]); } catch { wrongAnswers = []; }
      } else {
        wrongAnswers = [];
      }
    }

    if (!Array.isArray(wrongAnswers) || wrongAnswers.length === 0) {
      return NextResponse.json({ error: 'Failed to parse generated options' }, { status: 500 });
    }

    return NextResponse.json({ wrongAnswers: wrongAnswers.slice(0, 8) });
  } catch (error) {
    console.error('Quiz Generate API Error:', error);
    let errorMessage = 'Failed to generate quiz options';
    if (error instanceof Error) {
      if (error.message.includes('1211') || error.message.includes('Unknown Model')) {
        errorMessage = 'AI model not found';
      } else if (error.message.includes('1113') || error.message.includes('Insufficient balance')) {
        errorMessage = 'AI service needs more credits';
      } else if (!isOverloadError(error)) {
        errorMessage = error.message;
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

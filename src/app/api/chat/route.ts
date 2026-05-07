import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import ZAI from 'z-ai-web-dev-sdk';
import { withRetry } from '@/lib/retry';
import { withQueue } from '@/lib/zai-queue';

const SYSTEM_PROMPT =
  "You are a friendly, enthusiastic teacher for kids aged 3-8. Keep answers very simple, short (1-3 sentences), and fun. Use emojis sometimes. If asked about something complex, simplify it for a child.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, language } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Limit message length
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message is too long. Keep it under 500 characters.' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Language-specific system prompt
    const langInstructions: Record<string, string> = {
      en: 'Respond in English.',
      id: 'Respond in Bahasa Indonesia (Indonesian).',
      zh: 'Respond in Simplified Chinese (简体中文).',
    };
    const langRule = langInstructions[language] || langInstructions.en;
    const systemPrompt = `${SYSTEM_PROMPT}\n\n${langRule}`;

    // Build messages array with history support
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        if (msg.role && msg.content && typeof msg.content === 'string') {
          messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
        }
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message.trim() });

    const response = await withQueue(() => withRetry(async () => {
      const z = await ZAI.create();
      return await z.chat.completions.create({
        model: 'glm-4.5-flash',
        messages,
      });
    }));

    const reply = response.choices[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: 'I could not think of an answer. Please try again!' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again!',
      },
      { status: 500 }
    );
  }
}

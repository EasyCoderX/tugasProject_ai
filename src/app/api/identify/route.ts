import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { withRetry, isOverloadError } from '@/lib/retry';
import { withQueue } from '@/lib/zai-queue';

interface IdentifyResponse {
  name: string;
  emoji: string;
  description: string;
  funFact: string;
  category: string;
  nameEn?: string;
  nameId?: string;
  nameZh?: string;
  descriptionEn?: string;
  descriptionId?: string;
  descriptionZh?: string;
  funFactEn?: string;
  funFactId?: string;
  funFactZh?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { image, language } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Validate base64 image
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Please provide a base64-encoded JPEG or PNG.' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const langInstructions: Record<string, string> = {
      en: 'Respond in English.',
      id: 'Respond in Bahasa Indonesia (Indonesian). All text fields (name, description, funFact) must be in Indonesian.',
      zh: 'Respond in Simplified Chinese (简体中文). All text fields (name, description, funFact) must be in Chinese.',
    };
    const langRule = langInstructions[language] || langInstructions.en;

    const prompt = `You are a fun, enthusiastic teacher helping young children (ages 3-8) learn about the world!

${langRule}

Look at the image and identify the main object. Respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "name": "simple name of the object in the specified language",
  "nameEn": "simple name in English",
  "nameId": "simple name in Indonesian (Bahasa Indonesia)",
  "nameZh": "simple name in Simplified Chinese (简体中文)",
  "emoji": "one single emoji that best represents this object",
  "description": "1-2 very short, simple sentences explaining what this object is in the specified language. Use words a 4-year-old can understand. Keep under 40 words.",
  "descriptionEn": "description in English",
  "descriptionId": "description in Indonesian (Bahasa Indonesia)",
  "descriptionZh": "description in Simplified Chinese (简体中文)",
  "funFact": "one amazing and easy-to-understand fact in the specified language that will make a child go WOW. Keep under 30 words.",
  "funFactEn": "fun fact in English",
  "funFactId": "fun fact in Indonesian (Bahasa Indonesia)",
  "funFactZh": "fun fact in Simplified Chinese (简体中文)",
  "category": "one of: Animals, Food, Toys, Vehicles, Plants, Electronics, Furniture, Clothing, Tools, Nature, Sports, Household, School, Music, Art, People, Other"
}

Rules:
- ALL text must be EXTREMELY simple — like talking to a 4-year-old
- "name", "description", "funFact" must be in the specified language
- "nameEn", "descriptionEn", "funFactEn" MUST be in English
- "nameId", "descriptionId", "funFactId" MUST be in Bahasa Indonesia
- "nameZh", "descriptionZh", "funFactZh" MUST be in Simplified Chinese (简体中文)
- This will be read aloud by a voice, so write naturally
- Description: under 40 words
- Fun fact: under 30 words, must be genuinely fun/surprising
- Be warm, encouraging, and excited
- If the image is unclear, still try your best
- Return ONLY the JSON, nothing else`;

    const response = await withQueue(() => withRetry(async () => {
      const z = await ZAI.create();
      return await z.chat.completions.create({
        model: process.env.VISION_MODEL || 'glm-4.6v-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: image },
              },
            ],
          },
        ],
      });
    }));

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'Could not understand the image. Please try again!' },
        { status: 500 }
      );
    }

    // Parse the response - try to extract JSON from it
    let result: IdentifyResponse;
    try {
      // Try direct parse first
      result = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks or other formatting
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch {
          result = {
            name: 'Something Interesting',
            emoji: '❓',
            description: `I can see something interesting in the picture! ${content.slice(0, 100)}`,
            funFact: 'Every object has a story to tell!',
            category: 'Other',
          };
        }
      } else {
        result = {
          name: 'Something Cool',
          emoji: '✨',
          description: `I found something cool! ${content.slice(0, 100)}`,
          funFact: 'Everything around us is interesting if we look closely!',
          category: 'Other',
        };
      }
    }

    // Validate required fields
    result = {
      name: result.name || 'Unknown Object',
      emoji: result.emoji || '🔍',
      description: result.description || 'I can see something interesting here!',
      funFact: result.funFact || 'Everything around us is interesting!',
      category: result.category || 'Other',
      nameEn: result.nameEn,
      nameId: result.nameId,
      nameZh: result.nameZh,
      descriptionEn: result.descriptionEn,
      descriptionId: result.descriptionId,
      descriptionZh: result.descriptionZh,
      funFactEn: result.funFactEn,
      funFactId: result.funFactId,
      funFactZh: result.funFactZh,
    };

    // Construct nameOptions from available names
    const nameOptions: Record<string, string> = {};
    if (result.nameEn) nameOptions['en'] = result.nameEn;
    if (result.nameId) nameOptions['id'] = result.nameId;
    if (result.nameZh) nameOptions['zh'] = result.nameZh;
    if (language && !nameOptions[language]) {
      nameOptions[language] = result.name;
    }

    // Construct descriptionOptions
    const descriptionOptions: Record<string, string> = {};
    if (result.descriptionEn) descriptionOptions['en'] = result.descriptionEn;
    if (result.descriptionId) descriptionOptions['id'] = result.descriptionId;
    if (result.descriptionZh) descriptionOptions['zh'] = result.descriptionZh;
    if (language && !descriptionOptions[language]) {
      descriptionOptions[language] = result.description;
    }

    // Construct funFactOptions
    const funFactOptions: Record<string, string> = {};
    if (result.funFactEn) funFactOptions['en'] = result.funFactEn;
    if (result.funFactId) funFactOptions['id'] = result.funFactId;
    if (result.funFactZh) funFactOptions['zh'] = result.funFactZh;
    if (language && !funFactOptions[language]) {
      funFactOptions[language] = result.funFact;
    }

    return NextResponse.json({
      ...result,
      nameOptions,
      descriptionOptions,
      funFactOptions,
    });
  } catch (error) {
    console.error('Identify API Error:', error);
    let errorMessage = 'Something went wrong. Please try again!';
    if (error instanceof Error) {
      if (error.message.includes('1211') || error.message.includes('Unknown Model')) {
        errorMessage = 'AI model not found. Please contact support.';
      } else if (error.message.includes('1113') || error.message.includes('Insufficient balance')) {
        errorMessage = 'AI service needs more credits. Please contact support.';
      } else if (!isOverloadError(error)) {
        errorMessage = error.message;
      }
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

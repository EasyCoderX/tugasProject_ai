import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface IdentifyResponse {
  name: string;
  emoji: string;
  description: string;
  funFact: string;
  category: string;
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

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

    const prompt = `You are a fun, enthusiastic teacher helping young children (ages 3-8) learn about the world!

Look at the image and identify the main object. Respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "name": "simple name of the object (e.g., 'Apple', 'Teddy Bear', 'Red Car')",
  "emoji": "one single emoji that best represents this object",
  "description": "1-2 very short, simple sentences explaining what this object is. Use words a 4-year-old can understand. E.g. 'This is a red apple. Apples are yummy fruits that grow on trees!' Keep under 40 words.",
  "funFact": "one amazing and easy-to-understand fact that will make a child go WOW. E.g. 'Did you know? Honey never spoils! Scientists found 3000 year old honey in Egyptian tombs and it was still good to eat!' Keep under 30 words.",
  "category": "one of: Animals, Food, Toys, Vehicles, Plants, Electronics, Furniture, Clothing, Tools, Nature, Sports, Household, School, Music, Art, People, Other"
}

Rules:
- ALL text must be EXTREMELY simple — like talking to a 4-year-old
- This will be read aloud by a voice, so write naturally
- Description: under 40 words
- Fun fact: under 30 words, must be genuinely fun/surprising
- Be warm, encouraging, and excited
- If the image is unclear, still try your best
- Return ONLY the JSON, nothing else`;

    const response = await zai.chat.completions.create({
      model: process.env.VISION_MODEL || 'glm-4v-plus',
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
          // If still fails, create a fallback response
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
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Identify API Error:', error);
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

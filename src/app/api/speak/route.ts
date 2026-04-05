import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'chuichui', speed = 0.9 } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for speech synthesis' },
        { status: 400 }
      );
    }

    // Validate text length (max 1024 characters)
    const trimmedText = text.trim();
    if (trimmedText.length > 1024) {
      return NextResponse.json(
        { error: 'Text is too long. Please provide text under 1024 characters.' },
        { status: 400 }
      );
    }

    if (trimmedText.length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    // Validate speed range
    const validSpeed = Math.max(0.5, Math.min(2.0, Number(speed) || 0.9));

    const zai = await ZAI.create();

    const response = await zai.audio.tts.create({
      model: process.env.TTS_MODEL || 'tts-1',
      input: trimmedText,
      voice: voice,
      speed: validSpeed,
      response_format: 'wav',
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate voice. Please try again!',
      },
      { status: 500 }
    );
  }
}

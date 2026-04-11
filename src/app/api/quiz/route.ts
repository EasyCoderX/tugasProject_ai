import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { score, total } = body;

    if (score === undefined || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Score is required' },
        { status: 400 }
      );
    }

    if (total === undefined || typeof total !== 'number') {
      return NextResponse.json(
        { error: 'Total is required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(score) || score < 0) {
      return NextResponse.json(
        { error: 'Score must be a non-negative integer' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(total) || total <= 0) {
      return NextResponse.json(
        { error: 'Total must be a positive integer' },
        { status: 400 }
      );
    }

    if (score > total) {
      return NextResponse.json(
        { error: 'Score cannot exceed total' },
        { status: 400 }
      );
    }

    // Create quiz score
    await db.quizScore.create({
      data: {
        userId: user.id,
        score,
        total,
      },
    });

    // Check if perfect score and unlock achievement
    if (score === total && total > 0) {
      await db.achievement.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: 'quiz_perfect',
          },
        },
        update: {},
        create: {
          userId: user.id,
          type: 'quiz_perfect',
          title: 'Perfect Score!',
          emoji: '⭐',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('Quiz API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz score' },
      { status: 500 }
    );
  }
}

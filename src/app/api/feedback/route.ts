import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { rating, comment } = body;

    if (rating === undefined || typeof rating !== 'number') {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment !== undefined && typeof comment !== 'string') {
      return NextResponse.json(
        { error: 'Comment must be a string' },
        { status: 400 }
      );
    }

    // Trim comment if provided
    const trimmedComment = comment?.trim() || null;

    // Create feedback
    await db.feedback.create({
      data: {
        userId: user.id,
        rating,
        comment: trimmedComment,
      },
    });

    // Unlock "feedback_given" achievement
    await db.achievement.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: 'feedback_given',
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: 'feedback_given',
        title: 'Helpful Friend',
        emoji: '💬',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

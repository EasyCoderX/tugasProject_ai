import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

const VALID_TYPES = [
  'first_scan',
  'scan_5',
  'scan_10',
  'scan_20',
  'quiz_perfect',
  'puzzle_complete',
  'spell_master',
  'chat_first',
  'feedback_given',
] as const;

function isValidType(type: string): boolean {
  return VALID_TYPES.includes(type as (typeof VALID_TYPES)[number]);
}

// GET: Return user's achievements
export async function GET() {
  try {
    const user = await requireAuth();

    const achievements = await db.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: 'desc' },
    });

    return NextResponse.json({ achievements });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('Achievements GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to load achievements' },
      { status: 500 }
    );
  }
}

// POST: Unlock a new achievement (idempotent)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { type, title, emoji } = body;

    if (!type || typeof type !== 'string' || !isValidType(type)) {
      return NextResponse.json(
        { error: 'Invalid achievement type' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Achievement title is required' },
        { status: 400 }
      );
    }

    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json(
        { error: 'Achievement emoji is required' },
        { status: 400 }
      );
    }

    // Check if already unlocked (idempotent)
    const existing = await db.achievement.findUnique({
      where: {
        userId_type: {
          userId: user.id,
          type,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ achievement: existing });
    }

    // Create new achievement
    const achievement = await db.achievement.create({
      data: {
        userId: user.id,
        type,
        title,
        emoji,
      },
    });

    // Check scan milestones after saving
    await checkScanMilestones(user.id);

    return NextResponse.json({ achievement }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('Achievements POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}

// Helper: Check scan milestones and unlock if applicable
async function checkScanMilestones(userId: string) {
  const scanCount = await db.historyItem.count({
    where: { userId },
  });

  const milestones: Array<{
    count: number;
    type: string;
    title: string;
    emoji: string;
  }> = [
    { count: 5, type: 'scan_5', title: 'Curious Explorer', emoji: '🔭' },
    { count: 10, type: 'scan_10', title: 'Little Scientist', emoji: '🔬' },
    { count: 20, type: 'scan_20', title: 'Discovery Master', emoji: '🏆' },
  ];

  for (const milestone of milestones) {
    if (scanCount >= milestone.count) {
      const exists = await db.achievement.findUnique({
        where: {
          userId_type: {
            userId,
            type: milestone.type,
          },
        },
      });

      if (!exists) {
        await db.achievement.create({
          data: {
            userId,
            type: milestone.type,
            title: milestone.title,
            emoji: milestone.emoji,
          },
        });
      }
    }
  }
}

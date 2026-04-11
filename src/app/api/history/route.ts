import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: Return user's history items, ordered by createdAt desc, limit 50
export async function GET() {
  try {
    const user = await requireAuth();

    const history = await db.historyItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ history });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('History GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to load history' },
      { status: 500 }
    );
  }
}

// DELETE: Delete all history items for the user
export async function DELETE() {
  try {
    const user = await requireAuth();

    await db.historyItem.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('History DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete history' },
      { status: 500 }
    );
  }
}

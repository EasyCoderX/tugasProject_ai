import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const item = await db.historyItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!item) {
      return NextResponse.json({ error: 'History item not found' }, { status: 404 });
    }

    await db.historyItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('History DELETE (single) Error:', error);
    return NextResponse.json({ error: 'Failed to delete history item' }, { status: 500 });
  }
}

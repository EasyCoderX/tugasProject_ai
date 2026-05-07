import { NextRequest, NextResponse } from 'next/server';
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

// POST: Save a new history item
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { name, emoji, description, funFact, category, imageData, nameOptions } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!imageData || typeof imageData !== 'string') {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Limit imageData size (prevent huge DB entries)
    const trimmedImage = imageData.length > 500000 ? imageData.slice(0, 500000) : imageData;

    const item = await db.historyItem.create({
      data: {
        userId: user.id,
        name: name.slice(0, 200),
        emoji: (emoji || '🔍').slice(0, 10),
        description: (description || '').slice(0, 1000),
        funFact: (funFact || '').slice(0, 500),
        category: (category || 'Other').slice(0, 50),
        imageData: trimmedImage,
        nameOptions: nameOptions || undefined,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('History POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
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

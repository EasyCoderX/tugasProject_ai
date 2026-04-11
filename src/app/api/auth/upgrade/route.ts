import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST() {
  try {
    const user = await requireAuth()

    // Toggle Pro status (simulated upgrade/downgrade)
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { isPro: !user.isPro },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        isPro: true,
        theme: true,
        language: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

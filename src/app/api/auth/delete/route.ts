import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { COOKIE_NAME } from '@/lib/auth'

export async function DELETE() {
  try {
    const user = await requireAuth()

    // Delete user — all related data (history, achievements, feedback, quiz scores)
    // will be deleted automatically via onDelete: Cascade in the Prisma schema
    await db.user.delete({
      where: { id: user.id },
    })

    // Clear the session cookie
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

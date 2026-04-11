import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { displayName, language, theme } = body

    // Build update data with only provided fields
    const updateData: Record<string, string | null> = {}

    if (displayName !== undefined) {
      if (typeof displayName === 'string' && displayName.trim().length > 0) {
        updateData.displayName = displayName.trim()
      }
    }

    if (language !== undefined) {
      const validLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja']
      if (typeof language === 'string' && validLanguages.includes(language)) {
        updateData.language = language
      }
    }

    if (theme !== undefined) {
      const validThemes = ['default', 'ocean', 'forest', 'sunset', 'space']
      if (typeof theme === 'string' && validThemes.includes(theme)) {
        updateData.theme = theme
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
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

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

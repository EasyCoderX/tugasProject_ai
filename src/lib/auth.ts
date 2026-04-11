import { db } from '@/lib/db'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'kidlearn_session'

interface SessionData {
  userId: string
  username: string
  displayName: string | null
}

function encodeSession(data: SessionData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

function decodeSession(token: string): SessionData | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return JSON.parse(decoded) as SessionData
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  const sessionData = decodeSession(token)
  if (!sessionData) return null

  return sessionData
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
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

  if (!user) {
    throw new Response(JSON.stringify({ error: 'User not found' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return user
}

export { COOKIE_NAME, encodeSession, type SessionData }

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET - Fetch current user's role from database
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ role: null }, { status: 200 })
    }

    // Always fetch fresh role from database
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!user) {
      return NextResponse.json({ role: null }, { status: 200 })
    }

    return NextResponse.json({
      role: user.role,
      success: true,
    })

  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ role: null }, { status: 200 })
  }
}
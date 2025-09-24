import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, tracts, downloads } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

// GET - Fetch current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user statistics
    const [tractStats] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(tracts)
      .where(eq(tracts.authorId, user.id))

    const [downloadStats] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(downloads)
      .where(eq(downloads.userId, user.id))

    // Format user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tractsCount: tractStats?.count || 0,
      downloadsCount: downloadStats?.count || 0,
    }

    return NextResponse.json({
      success: true,
      user: userData,
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PATCH - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name } = data

    // Only allow users to update their own name
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) updateData.name = name

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.email, session.user.email))
      .returning()

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get updated statistics
    const [tractStats] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(tracts)
      .where(eq(tracts.authorId, updatedUser.id))

    const [downloadStats] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(downloads)
      .where(eq(downloads.userId, updatedUser.id))

    // Format updated user data
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      image: updatedUser.image,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      tractsCount: tractStats?.count || 0,
      downloadsCount: downloadStats?.count || 0,
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData,
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
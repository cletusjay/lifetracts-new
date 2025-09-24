import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, tracts, downloads } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// GET - Fetch user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Fetch user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
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
      .where(eq(tracts.authorId, params.id))

    const [downloadStats] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(downloads)
      .where(eq(downloads.userId, params.id))

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
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}

// PATCH - Update user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const data = await request.json()
    const { name, role, email, password } = data

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (email !== undefined) updateData.email = email
    
    // Hash password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12)
      updateData.password = hashedPassword
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, params.id))
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
      .where(eq(tracts.authorId, params.id))

    const [downloadStats] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(downloads)
      .where(eq(downloads.userId, params.id))

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
      message: 'User updated successfully',
      user: userData,
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Prevent self-deletion
    if (params.id === adminUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user (cascade will handle related records)
    await db.delete(users).where(eq(users.id, params.id))

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
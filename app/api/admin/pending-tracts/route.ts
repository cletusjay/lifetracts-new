import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tracts, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details to check if admin
    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1)

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'approver')) {
      return NextResponse.json({ error: 'Forbidden - Admin or Approver access required' }, { status: 403 })
    }

    // Fetch pending tracts with author information
    const pendingTractsList = await db
      .select({
        id: tracts.id,
        title: tracts.title,
        description: tracts.description,
        denomination: tracts.denomination,
        language: tracts.language,
        fileUrl: tracts.fileUrl,
        fileName: tracts.fileName,
        fileSize: tracts.fileSize,
        status: tracts.status,
        createdAt: tracts.createdAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(tracts)
      .leftJoin(users, eq(tracts.authorId, users.id))
      .where(eq(tracts.status, 'pending'))
      .orderBy(desc(tracts.createdAt))

    return NextResponse.json({
      success: true,
      tracts: pendingTractsList,
      count: pendingTractsList.length
    })

  } catch (error) {
    console.error('Error fetching pending tracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending tracts' },
      { status: 500 }
    )
  }
}

// Approve or reject a tract
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1)

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'approver')) {
      return NextResponse.json({ error: 'Forbidden - Admin or Approver access required' }, { status: 403 })
    }

    const { tractId, status } = await request.json()

    if (!tractId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Update tract status
    const [updatedTract] = await db
      .update(tracts)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(tracts.id, tractId))
      .returning()

    if (!updatedTract) {
      return NextResponse.json({ error: 'Tract not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Tract ${status} successfully`,
      tract: updatedTract
    })

  } catch (error) {
    console.error('Error updating tract status:', error)
    return NextResponse.json(
      { error: 'Failed to update tract status' },
      { status: 500 }
    )
  }
}
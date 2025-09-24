import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tracts, users, categories, tractCategories } from '@/lib/db/schema'
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm'

// GET - Fetch all approved tracts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'approved'
    const includeAll = searchParams.get('all') === 'true'
    const searchQuery = searchParams.get('search') || ''

    // Check if user is admin for fetching all tracts
    let isAdmin = false
    const session = await auth()
    if (session?.user?.email) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1)
      isAdmin = user?.role === 'admin'
    }

    // Build query with simplified approach
    let tractsList;
    
    if (!isAdmin || !includeAll) {
      // Query with status filter
      tractsList = await db
        .select()
        .from(tracts)
        .leftJoin(users, eq(tracts.authorId, users.id))
        .where(eq(tracts.status, status as 'approved' | 'pending' | 'rejected'))
        .orderBy(desc(tracts.createdAt))
    } else {
      // Query without status filter (admin viewing all)
      tractsList = await db
        .select()
        .from(tracts)
        .leftJoin(users, eq(tracts.authorId, users.id))
        .orderBy(desc(tracts.createdAt))
    }
    
    // Filter by search query in memory if provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      tractsList = tractsList.filter(item => {
        const tract = item.tracts
        const titleMatch = tract.title?.toLowerCase().includes(searchLower)
        const descMatch = tract.description?.toLowerCase().includes(searchLower)
        const denominationMatch = tract.denomination?.toLowerCase().includes(searchLower)

        return titleMatch || descMatch || denominationMatch
      })
    }

    // Format the tracts with author information
    const formattedTracts = tractsList.map(item => ({
      ...item.tracts,
      author: item.users ? {
        id: item.users.id,
        name: item.users.name,
        email: item.users.email,
      } : null
    }))

    // Fetch categories for each tract
    const tractsWithCategories = await Promise.all(
      formattedTracts.map(async (tract) => {
        const tractCats = await db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          })
          .from(tractCategories)
          .innerJoin(categories, eq(tractCategories.categoryId, categories.id))
          .where(eq(tractCategories.tractId, tract.id))

        return {
          ...tract,
          categories: tractCats,
        }
      })
    )

    return NextResponse.json({
      success: true,
      tracts: tractsWithCategories,
      count: tractsWithCategories.length,
    })

  } catch (error) {
    console.error('Error fetching tracts - Full error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to fetch tracts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Delete a tract (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { tractId } = await request.json()
    if (!tractId) {
      return NextResponse.json({ error: 'Tract ID required' }, { status: 400 })
    }

    // Delete the tract (cascade will handle related records)
    await db.delete(tracts).where(eq(tracts.id, tractId))

    // TODO: Also delete the physical file from disk
    // const [tract] = await db.select().from(tracts).where(eq(tracts.id, tractId))
    // if (tract?.fileUrl) {
    //   const filePath = path.join(process.cwd(), 'public', tract.fileUrl)
    //   await unlink(filePath).catch(() => {})
    // }

    return NextResponse.json({
      success: true,
      message: 'Tract deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting tract:', error)
    return NextResponse.json(
      { error: 'Failed to delete tract' },
      { status: 500 }
    )
  }
}

// PATCH - Update tract details (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'Tract ID required' }, { status: 400 })
    }

    // Update the tract
    const [updatedTract] = await db
      .update(tracts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(tracts.id, id))
      .returning()

    if (!updatedTract) {
      return NextResponse.json({ error: 'Tract not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Tract updated successfully',
      tract: updatedTract,
    })

  } catch (error) {
    console.error('Error updating tract:', error)
    return NextResponse.json(
      { error: 'Failed to update tract' },
      { status: 500 }
    )
  }
}
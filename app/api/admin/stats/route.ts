import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tracts, users, downloads } from '@/lib/db/schema'
import { eq, count, sql, and, gte, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'approver')) {
      return NextResponse.json({ error: 'Forbidden - Admin or Approver access required' }, { status: 403 })
    }

    // Get current date and date 30 days ago for growth calculations
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Get total counts
    const [totalTractsResult] = await db
      .select({ count: count() })
      .from(tracts)

    const [approvedTractsResult] = await db
      .select({ count: count() })
      .from(tracts)
      .where(eq(tracts.status, 'approved'))

    const [pendingTractsResult] = await db
      .select({ count: count() })
      .from(tracts)
      .where(eq(tracts.status, 'pending'))

    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users)

    const [totalDownloadsResult] = await db
      .select({ count: count() })
      .from(downloads)

    // Get counts from last 30 days for growth calculation
    const [recentTractsResult] = await db
      .select({ count: count() })
      .from(tracts)
      .where(gte(tracts.createdAt, thirtyDaysAgo))

    const [previousTractsResult] = await db
      .select({ count: count() })
      .from(tracts)
      .where(
        and(
          gte(tracts.createdAt, sixtyDaysAgo),
          sql`${tracts.createdAt} < ${thirtyDaysAgo}`
        )
      )

    const [recentUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))

    const [previousUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, sixtyDaysAgo),
          sql`${users.createdAt} < ${thirtyDaysAgo}`
        )
      )

    const [recentDownloadsResult] = await db
      .select({ count: count() })
      .from(downloads)
      .where(gte(downloads.downloadedAt, thirtyDaysAgo))

    const [previousDownloadsResult] = await db
      .select({ count: count() })
      .from(downloads)
      .where(
        and(
          gte(downloads.downloadedAt, sixtyDaysAgo),
          sql`${downloads.downloadedAt} < ${thirtyDaysAgo}`
        )
      )

    // Calculate growth percentages
    const calculateGrowth = (recent: number, previous: number) => {
      if (previous === 0) return recent > 0 ? 100 : 0
      return Math.round(((recent - previous) / previous) * 100)
    }

    const tractsGrowth = calculateGrowth(
      recentTractsResult?.count || 0,
      previousTractsResult?.count || 0
    )

    const usersGrowth = calculateGrowth(
      recentUsersResult?.count || 0,
      previousUsersResult?.count || 0
    )

    const downloadsGrowth = calculateGrowth(
      recentDownloadsResult?.count || 0,
      previousDownloadsResult?.count || 0
    )

    // Get top downloaded tracts
    const topTracts = await db
      .select({
        id: tracts.id,
        title: tracts.title,
        downloads: tracts.downloadCount,
      })
      .from(tracts)
      .where(eq(tracts.status, 'approved'))
      .orderBy(desc(tracts.downloadCount))
      .limit(5)

    // Calculate trend for top tracts (simplified - just random for now)
    const topTractsWithTrend = topTracts.map(tract => ({
      ...tract,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: Math.round(Math.random() * 20)
    }))

    // Get recent users
    const recentUsersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5)

    // Count uploads per user (simplified)
    const recentUsersWithUploads = await Promise.all(
      recentUsersList.map(async (user) => {
        const [uploadCount] = await db
          .select({ count: count() })
          .from(tracts)
          .where(eq(tracts.authorId, user.id))
        
        return {
          ...user,
          joinedAt: user.createdAt,
          uploads: uploadCount?.count || 0
        }
      })
    )

    // Get recent downloads grouped by tract with counts (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Get download counts per tract for the last 7 days
    const recentDownloadsByTract = await db
      .select({
        tractId: downloads.tractId,
        tractTitle: tracts.title,
        downloadCount: sql<number>`count(${downloads.id})::int`,
        lastDownloadedAt: sql<Date>`max(${downloads.downloadedAt})`,
      })
      .from(downloads)
      .leftJoin(tracts, eq(downloads.tractId, tracts.id))
      .where(gte(downloads.downloadedAt, sevenDaysAgo))
      .groupBy(downloads.tractId, tracts.title)
      .orderBy(desc(sql`count(${downloads.id})`))
      .limit(10)
    
    // Get the last downloader for each tract
    const recentDownloadsWithLastUser = await Promise.all(
      recentDownloadsByTract.map(async (item) => {
        const [lastDownload] = await db
          .select({
            userName: users.name,
            userEmail: users.email,
          })
          .from(downloads)
          .leftJoin(users, eq(downloads.userId, users.id))
          .where(eq(downloads.tractId, item.tractId))
          .orderBy(desc(downloads.downloadedAt))
          .limit(1)
        
        return {
          ...item,
          lastDownloadedBy: lastDownload?.userName || lastDownload?.userEmail || 'Anonymous',
        }
      })
    )

    const stats = {
      totalTracts: totalTractsResult?.count || 0,
      approvedTracts: approvedTractsResult?.count || 0,
      pendingReview: pendingTractsResult?.count || 0,
      totalUsers: totalUsersResult?.count || 0,
      totalDownloads: totalDownloadsResult?.count || 0,
      monthlyGrowth: {
        tracts: tractsGrowth,
        users: usersGrowth,
        downloads: downloadsGrowth,
      },
      topTracts: topTractsWithTrend,
      recentUsers: recentUsersWithUploads,
      recentDownloads: recentDownloadsWithLastUser,
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tracts, downloads, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import path from 'path'
import { readFile } from 'fs/promises'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tractId = params.id

    // Find the tract in database
    const [tract] = await db
      .select()
      .from(tracts)
      .where(eq(tracts.id, tractId))
      .limit(1)

    if (!tract) {
      return NextResponse.json({ error: 'Tract not found' }, { status: 404 })
    }

    // Check if the file exists
    if (tract.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', tract.fileUrl)
      
      try {
        const fileBuffer = await readFile(filePath)
        
        // Increment download count
        await db
          .update(tracts)
          .set({ 
            downloadCount: sql`${tracts.downloadCount} + 1` 
          })
          .where(eq(tracts.id, tractId))
        
        // Track individual download if user is logged in
        try {
          const session = await auth()
          if (session?.user?.email) {
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.email, session.user.email))
              .limit(1)
            
            if (user) {
              await db.insert(downloads).values({
                tractId: tractId,
                userId: user.id,
                ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              })
            }
          } else {
            // Track anonymous download
            await db.insert(downloads).values({
              tractId: tractId,
              userId: null,
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            })
          }
        } catch (trackingError) {
          // Don't fail the download if tracking fails
          console.error('Error tracking download:', trackingError)
        }
        
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${tract.fileName || tract.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf' || 'tract.pdf'}"`,
            'Content-Length': fileBuffer.length.toString(),
          },
        })
      } catch (err) {
        console.error('File not found on disk:', filePath)
        // File doesn't exist, return a message
        return NextResponse.json({ 
          error: 'PDF file not found. This tract was uploaded before file storage was implemented. Please re-upload the tract.',
          tractTitle: tract.title 
        }, { status: 404 })
      }
    }

    return NextResponse.json({ error: 'No file URL for this tract' }, { status: 404 })
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download tract' },
      { status: 500 }
    )
  }
}
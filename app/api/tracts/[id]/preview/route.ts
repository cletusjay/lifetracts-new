import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tracts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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
        
        // Return with inline disposition for preview
        return new NextResponse(new Uint8Array(fileBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${tract.fileName || tract.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf' || 'tract.pdf'}"`,
          },
        })
      } catch (err) {
        console.error('File not found on disk:', filePath)
        return NextResponse.json({ 
          error: 'PDF file not found. This tract was uploaded before file storage was implemented. Please re-upload the tract.',
          tractTitle: tract.title 
        }, { status: 404 })
      }
    }

    return NextResponse.json({ error: 'No file URL for this tract' }, { status: 404 })
    
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Failed to preview tract' },
      { status: 500 }
    )
  }
}
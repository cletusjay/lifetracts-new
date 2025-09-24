import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, tracts, categories, tags, tractCategories, tractTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 })
    }

    // Check if user is admin
    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found in session' }, { status: 400 })
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1)

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'uploader')) {
      return NextResponse.json({ error: 'Forbidden - Only admins and uploaders can upload tracts' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Parse form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categorySlug = formData.get('category') as string
    const denomination = formData.get('denomination') as string
    const language = formData.get('language') as string
    const tagsJson = formData.get('tags') as string
    const scriptureReferencesJson = formData.get('scriptureReferences') as string

    // We already have currentUser from the admin check above
    const user = currentUser

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tracts')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Directory might already exist, that's fine
      console.log('Upload directory already exists or created')
    }

    // Generate unique filename and save file
    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${randomUUID()}${fileExtension}`
    const uploadPath = path.join(uploadDir, uniqueFilename)
    
    try {
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(uploadPath, buffer)
      console.log(`File saved to: ${uploadPath}`)
    } catch (err) {
      console.error('Error saving file:', err)
      return NextResponse.json({ error: 'Failed to save file to disk' }, { status: 500 })
    }
    
    // Insert tract into database
    const [newTract] = await db.insert(tracts).values({
      title,
      description,
      authorId: user.id,
      denomination,
      language: language.toLowerCase().slice(0, 2), // Convert to language code
      fileUrl: `/uploads/tracts/${uniqueFilename}`, // URL path for accessing the file
      fileName: file.name,
      fileSize: file.size,
      status: 'pending', // All new uploads are pending review
      featured: false,
    }).returning()

    // Handle categories
    if (categorySlug) {
      try {
        const [category] = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, categorySlug))
          .limit(1)

        if (category) {
          await db.insert(tractCategories).values({
            tractId: newTract.id,
            categoryId: category.id,
          })
        }
      } catch (e) {
        console.error('Error linking category:', e)
        // Continue even if category linking fails
      }
    }

    // Handle tags
    if (tagsJson) {
      try {
        const tagsList = JSON.parse(tagsJson) as string[]
        for (const tagName of tagsList) {
          if (!tagName || tagName.trim() === '') continue
          
          // Find or create tag
          let [tag] = await db
            .select()
            .from(tags)
            .where(eq(tags.name, tagName.toLowerCase()))
            .limit(1)

          if (!tag) {
            [tag] = await db.insert(tags).values({
              name: tagName.toLowerCase(),
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            }).returning()
          }

          // Link tag to tract
          if (tag) {
            await db.insert(tractTags).values({
              tractId: newTract.id,
              tagId: tag.id,
            })
          }
        }
      } catch (e) {
        console.error('Error parsing/linking tags:', e)
        // Continue even if tag linking fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tract uploaded successfully and is pending review',
      tract: {
        id: newTract.id,
        title: newTract.title,
        status: newTract.status,
        fileUrl: newTract.fileUrl,
      }
    })

  } catch (error) {
    console.error('Upload error details:', error)
    
    // Provide more detailed error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to upload tract. Please check server logs.' },
      { status: 500 }
    )
  }
}
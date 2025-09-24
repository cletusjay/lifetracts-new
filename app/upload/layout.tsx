import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  // Check if user has upload permissions (admin or uploader)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!user || (user.role !== 'admin' && user.role !== 'uploader')) {
    // Redirect users without upload permissions to home page
    redirect('/')
  }

  return <>{children}</>
}
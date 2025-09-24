import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await auth()
  
  if (!session?.user?.email) {
    // Not authenticated, redirect to login
    redirect('/login')
  }

  // Check if user has admin access (admin or approver)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!user || (user.role !== 'admin' && user.role !== 'approver')) {
    // User exists but doesn't have admin access, redirect to home page
    redirect('/')
  }

  // User is authenticated and has admin access (admin or approver), allow access
  return <>{children}</>
}
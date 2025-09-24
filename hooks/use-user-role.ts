'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useUserRole() {
  const { data: session, status } = useSession()
  const [actualRole, setActualRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActualRole = async () => {
      if (status === 'loading') return
      
      if (!session?.user) {
        setActualRole(null)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/auth/role')
        if (response.ok) {
          const data = await response.json()
          setActualRole(data.role)
        } else {
          setActualRole('user')
        }
      } catch (error) {
        console.error('Error fetching role:', error)
        setActualRole('user')
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch role on mount and when session changes
    fetchActualRole()
  }, [session, status])

  // Also refetch when window regains focus
  useEffect(() => {
    const handleFocus = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/auth/role')
          if (response.ok) {
            const data = await response.json()
            setActualRole(data.role)
          }
        } catch (error) {
          console.error('Error fetching role on focus:', error)
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [session])

  return {
    role: actualRole,
    isLoading: isLoading || status === 'loading',
    isAdmin: actualRole === 'admin',
    isApprover: actualRole === 'approver',
    isUploader: actualRole === 'uploader',
    canUpload: actualRole === 'admin' || actualRole === 'uploader',
    canApprove: actualRole === 'admin' || actualRole === 'approver',
    canAccessAdmin: actualRole === 'admin' || actualRole === 'approver',
  }
}
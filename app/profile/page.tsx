'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Save,
  Shield,
  User,
  Mail,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Lock,
  Upload,
  UserCheck,
  Home
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'uploader' | 'approver' | 'user'
  emailVerified: string | null
  image: string | null
  createdAt: string
  updatedAt: string
  tractsCount?: number
  downloadsCount?: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<UserData>>({})
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Fetch user data
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setEditedUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch profile data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedUser.name,
          // Only allow users to update their name, not role
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsEditing(false)
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        })
        setShowPasswordDialog(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to change password')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'uploader':
        return <Upload className="h-4 w-4" />
      case 'approver':
        return <UserCheck className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string): any => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'uploader':
        return 'default'
      case 'approver':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  const isAdmin = (session.user as any).role === 'admin'

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedUser(user)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  {user.image ? (
                    <img src={user.image} alt={user.name || ''} className="h-20 w-20 rounded-full" />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold">
                      {isEditing ? (
                        <Input
                          value={editedUser.name || ''}
                          onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                          placeholder="Your name"
                        />
                      ) : (
                        user.name || 'No name set'
                      )}
                    </h3>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role.toUpperCase()}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role Information */}
              <div>
                <Label className="text-base font-semibold mb-2 block">
                  Account Role
                </Label>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(user.role)}
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'admin' && 'You have full access to all system features and can manage users'}
                    {user.role === 'approver' && 'You can review and approve/reject uploaded tracts'}
                    {user.role === 'uploader' && 'You can upload new tracts to the platform'}
                    {user.role === 'user' && 'You can browse and download approved tracts'}
                  </p>
                  {isAdmin && (
                    <Button
                      variant="link"
                      className="mt-2 p-0 h-auto"
                      onClick={() => router.push('/admin')}
                    >
                      Go to Admin Dashboard →
                    </Button>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Account Created</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Last Updated</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email Verification</Label>
                  <p className="flex items-center gap-2 mt-1">
                    {user.emailVerified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Not Verified</span>
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Account ID</Label>
                  <p className="font-mono text-xs mt-1">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Cards */}
        <div className="space-y-6">
          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Tracts Uploaded</span>
                </div>
                <span className="font-semibold">{user.tractsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Downloads</span>
                </div>
                <span className="font-semibold">{user.downloadsCount || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPasswordDialog(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Save,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Edit,
  Lock,
  Upload,
  UserCheck
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
  lastActive?: string
}

export default function UserDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<UserData>>({})

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }
    
    if ((session.user as any).role !== 'admin') {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Fetch user data
  useEffect(() => {
    if (session && (session.user as any).role === 'admin') {
      fetchUserData()
    }
  }, [session, userId])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setEditedUser(data.user)
      } else if (response.status === 404) {
        toast({
          title: 'User not found',
          description: 'The user you are looking for does not exist.',
          variant: 'destructive',
        })
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch user data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsEditing(false)
        toast({
          title: 'Success',
          description: 'User updated successfully',
        })
      } else {
        throw new Error('Failed to update user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        })
        router.push('/admin')
      } else {
        throw new Error('Failed to delete user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const handlePasswordReset = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Password Reset',
          description: data.message || 'Password reset email sent successfully',
        })
        setShowPasswordResetDialog(false)
      } else {
        throw new Error('Failed to reset password')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password',
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
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || (session.user as any).role !== 'admin' || !user) {
    return null
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">User Details</h1>
            <p className="text-muted-foreground mt-2">
              Manage user profile and permissions
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
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
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Basic information and account details
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
                          placeholder="User name"
                        />
                      ) : (
                        user.name || 'No name set'
                      )}
                    </h3>
                    <Badge variant={getRoleBadgeVariant(isEditing ? editedUser.role! : user.role)}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(isEditing ? editedUser.role! : user.role)}
                        {(isEditing ? editedUser.role : user.role)?.toUpperCase()}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role Management */}
              <div>
                <Label htmlFor="role" className="text-base font-semibold mb-2 block">
                  User Role & Permissions
                </Label>
                {isEditing ? (
                  <Select
                    value={editedUser.role}
                    onValueChange={(value) => setEditedUser({ ...editedUser, role: value as any })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Admin</div>
                            <div className="text-xs text-muted-foreground">Full system access</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="approver">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Approver</div>
                            <div className="text-xs text-muted-foreground">Can approve/reject tracts</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="uploader">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Uploader</div>
                            <div className="text-xs text-muted-foreground">Can upload tracts</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <div className="font-medium">User</div>
                            <div className="text-xs text-muted-foreground">Basic access only</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      {getRoleIcon(user.role)}
                      <span className="font-medium capitalize">{user.role}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.role === 'admin' && 'Has full access to all system features and can manage users'}
                      {user.role === 'approver' && 'Can review and approve/reject uploaded tracts'}
                      {user.role === 'uploader' && 'Can upload new tracts to the platform'}
                      {user.role === 'user' && 'Can browse and download approved tracts'}
                    </p>
                  </div>
                )}
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
                  <Label className="text-sm text-muted-foreground">User ID</Label>
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
              <CardTitle>Activity Statistics</CardTitle>
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
              {user.lastActive && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">{formatDate(user.lastActive)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPasswordResetDialog(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              All associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Send a password reset link to {user.email}? The user will receive an email
              with instructions to create a new password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordResetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordReset}>
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
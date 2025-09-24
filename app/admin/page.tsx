'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TractManagement } from '@/components/admin/tract-management'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  FileText, 
  Download, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Shield,
  Activity,
  Eye,
  Trash2,
  Edit,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { formatDate, formatBytes } from '@/lib/utils'


export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('tracts')
  const [timeRange, setTimeRange] = useState('7d')
  const [pendingTracts, setPendingTracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [tractRefreshTrigger, setTractRefreshTrigger] = useState(0)
  const [stats, setStats] = useState({
    totalTracts: 0,
    approvedTracts: 0,
    pendingReview: 0,
    totalUsers: 0,
    totalDownloads: 0,
    monthlyGrowth: {
      tracts: 0,
      users: 0,
      downloads: 0,
    }
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentDownloads, setRecentDownloads] = useState<any[]>([])
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Check authentication and redirect if not authorized
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }
    
    // Check actual role from database
    const checkAdminRole = async () => {
      try {
        const response = await fetch('/api/auth/role')
        if (response.ok) {
          const data = await response.json()
          if (data.role !== 'admin' && data.role !== 'approver') {
            setIsAuthorized(false)
            router.push('/')
          } else {
            setIsAuthorized(true)
            setUserRole(data.role)
          }
        } else {
          setIsAuthorized(false)
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking role:', error)
        setIsAuthorized(false)
        router.push('/')
      }
    }
    
    checkAdminRole()
  }, [session, status, router])

  // Fetch data on component mount
  useEffect(() => {
    if (session && isAuthorized) {
      fetchPendingTracts()
      fetchAdminStats()
    }
  }, [session, isAuthorized])

  const fetchPendingTracts = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      const response = await fetch('/api/admin/pending-tracts')
      if (response.ok) {
        const data = await response.json()
        setPendingTracts(data.tracts || [])
        setLastUpdated(new Date())
      } else {
        console.error('Failed to fetch pending tracts')
      }
    } catch (error) {
      console.error('Error fetching pending tracts:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.stats) {
          setStats(data.stats)
          setRecentUsers(data.stats.recentUsers || [])
          setRecentDownloads(data.stats.recentDownloads || [])
        }
      } else {
        console.error('Failed to fetch admin stats')
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  const handleApprove = async (tractId: string) => {
    try {
      const response = await fetch('/api/admin/pending-tracts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tractId, status: 'approved' })
      })
      
      if (response.ok) {
        setPendingTracts(prev => prev.filter(t => t.id !== tractId))
        fetchAdminStats()
        setTractRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error approving tract:', error)
    }
  }

  const handleReject = async (tractId: string) => {
    try {
      const response = await fetch('/api/admin/pending-tracts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tractId, status: 'rejected' })
      })
      
      if (response.ok) {
        setPendingTracts(prev => prev.filter(t => t.id !== tractId))
        fetchAdminStats()
        setTractRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error rejecting tract:', error)
    }
  }

  const handleUserAction = (userId: string, action: string) => {
    console.log(`${action} user:`, userId)
    // In production, this would make an API call
  }

  // Show loading state while checking authentication
  if (status === 'loading' || isAuthorized === null) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render admin content if not authenticated or not authorized
  if (!session || !isAuthorized) {
    return null
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            {userRole === 'approver' ? 'Approver Dashboard' : 'Admin Dashboard'}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isRefreshing && (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
              <span>Last updated: {formatDate(lastUpdated)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchPendingTracts(true)
                fetchAdminStats()
              }}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-muted-foreground">
          {userRole === 'admin' 
            ? 'Manage tracts, users, and monitor platform activity'
            : 'Review and approve pending tracts'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTracts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.monthlyGrowth.tracts}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.monthlyGrowth.users}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.monthlyGrowth.downloads}%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Section - Always Visible */}
      <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>
                Tracts awaiting approval or rejection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading pending tracts...</div>
                </div>
              ) : pendingTracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-2 opacity-50" />
                  <p>No tracts pending review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTracts.map((tract) => (
                    <div key={tract.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{tract.title}</h4>
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <Badge variant="secondary" className="text-xs">
                            Pending
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>By {tract.author?.name || tract.author?.email || 'Unknown'}</span>
                          <span>{tract.denomination}</span>
                          <span>{formatBytes(tract.fileSize)}</span>
                          <span>{formatDate(tract.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {tract.id && (
                          <a href={`/api/tracts/${tract.id}/preview`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          </a>
                        )}
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApprove(tract.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(tract.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

      {/* Recent Downloads Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Popular Downloads</CardTitle>
          <CardDescription>
            Most downloaded tracts in the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentDownloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Download className="h-12 w-12 mb-2 opacity-50" />
              <p>No downloads in the last 7 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDownloads.map((download, index) => (
                <div key={download.tractId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{download.tractTitle || 'Unknown Tract'}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Last by: {download.lastDownloadedBy}</span>
                        <span>{formatDate(download.lastDownloadedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={download.downloadCount > 5 ? 'default' : 'secondary'}>
                      <Download className="h-3 w-3 mr-1" />
                      {download.downloadCount} {download.downloadCount === 1 ? 'download' : 'downloads'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs - Only show for admin users */}
      {userRole === 'admin' && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-[400px] grid-cols-3">
            <TabsTrigger value="tracts">Tracts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tracts" className="space-y-6">
            <TractManagement onStatsUpdate={fetchAdminStats} refreshTrigger={tractRefreshTrigger} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Newly registered users and their activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{user.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{user.email}</span>
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'uploader' ? 'default' : user.role === 'approver' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                        <span>Joined {formatDate(user.joinedAt)}</span>
                        <span>{user.uploads} uploads</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUserAction(user.id, 'edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUserAction(user.id, 'more')}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>
                Detailed insights and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Analytics Dashboard</p>
                <p>Detailed charts and graphs would be displayed here</p>
                <p className="text-sm mt-2">Including download trends, user growth, and engagement metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  )
}
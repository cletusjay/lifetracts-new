'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { formatBytes, formatDate } from '@/lib/utils'
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Upload
} from 'lucide-react'

interface TractManagementProps {
  onStatsUpdate?: () => void
  refreshTrigger?: number
}

export function TractManagement({ onStatsUpdate, refreshTrigger }: TractManagementProps) {
  const [tracts, setTracts] = useState<any[]>([])
  const [filteredTracts, setFilteredTracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingTract, setEditingTract] = useState<any>(null)
  const [deletingTract, setDeletingTract] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchAllTracts()
  }, [refreshTrigger])

  useEffect(() => {
    filterTracts()
  }, [searchQuery, statusFilter, tracts])

  const fetchAllTracts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tracts?all=true')
      if (response.ok) {
        const data = await response.json()
        setTracts(data.tracts || [])
      }
    } catch (error) {
      console.error('Error fetching tracts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tracts',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterTracts = () => {
    let filtered = [...tracts]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tract =>
        tract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tract.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tract.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tract => tract.status === statusFilter)
    }

    setFilteredTracts(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const handleStatusChange = async (tractId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/tracts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tractId, status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Tract status updated to ${newStatus}`,
        })
        fetchAllTracts()
        // Refresh admin statistics after status change
        if (onStatsUpdate) {
          onStatsUpdate()
        }
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tract status',
        variant: 'destructive',
      })
    }
  }

  const handleToggleFeatured = async (tractId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch('/api/tracts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tractId, featured: !currentFeatured }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: currentFeatured ? 'Removed from featured' : 'Added to featured',
        })
        fetchAllTracts()
        // Refresh admin statistics after featured toggle
        if (onStatsUpdate) {
          onStatsUpdate()
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingTract) return

    try {
      const response = await fetch('/api/tracts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tractId: deletingTract.id }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tract deleted successfully',
        })
        setDeletingTract(null)
        fetchAllTracts()
        // Refresh admin statistics after deletion
        if (onStatsUpdate) {
          onStatsUpdate()
        }
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tract',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = async () => {
    if (!editingTract) return

    try {
      const response = await fetch('/api/tracts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTract),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tract updated successfully',
        })
        setEditingTract(null)
        fetchAllTracts()
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tract',
        variant: 'destructive',
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      approved: 'default',
      rejected: 'destructive',
      pending: 'secondary',
    }
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    )
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredTracts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTracts = filteredTracts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Manage Tracts</CardTitle>
              <CardDescription className="mt-1">
                View and manage all tracts in the system
              </CardDescription>
            </div>
            <Link href="/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Tract
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tracts..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={searchQuery === '' && statusFilter === 'all'}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredTracts.length)} of {filteredTracts.length} tracts
                {tracts.length !== filteredTracts.length && ` (filtered from ${tracts.length} total)`}
              </span>
              {totalPages > 1 && (
                <span>Page {currentPage} of {totalPages}</span>
              )}
            </div>
          </div>

          {filteredTracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No tracts found</p>
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-4"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {paginatedTracts.map((tract) => (
                <div key={tract.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{tract.title}</h4>
                      {getStatusIcon(tract.status)}
                      {getStatusBadge(tract.status)}
                      {tract.featured && (
                        <Badge variant="default" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>By {tract.author?.name || 'Unknown'}</span>
                      <span>{tract.denomination}</span>
                      <span>{formatBytes(tract.fileSize)}</span>
                      <span>{tract.downloadCount} downloads</span>
                      <span>{formatDate(tract.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`/api/tracts/${tract.id}/preview`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" title="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Download"
                      onClick={() => {
                        // Optimistically update the download count
                        setFilteredTracts(prev => prev.map(t => 
                          t.id === tract.id 
                            ? { ...t, downloadCount: t.downloadCount + 1 }
                            : t
                        ))
                        
                        setTracts(prev => prev.map(t => 
                          t.id === tract.id 
                            ? { ...t, downloadCount: t.downloadCount + 1 }
                            : t
                        ))
                        
                        // Trigger download
                        const link = document.createElement('a')
                        link.href = `/api/tracts/${tract.id}/download`
                        link.download = tract.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf'
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        
                        // Also refresh stats if callback is provided
                        if (onStatsUpdate) {
                          setTimeout(onStatsUpdate, 1000) // Delay to ensure download is tracked
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {/* Status Actions */}
                    {tract.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusChange(tract.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(tract.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {tract.status === 'approved' && (
                      <Button
                        size="sm"
                        variant={tract.featured ? 'secondary' : 'outline'}
                        onClick={() => handleToggleFeatured(tract.id, tract.featured)}
                      >
                        {tract.featured ? 'Unfeature' : 'Feature'}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTract(tract)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingTract(tract)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={currentPage === 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          className="w-8 h-8 p-0"
                        >
                          1
                        </Button>
                        {currentPage > 4 && <span className="px-1">...</span>}
                      </>
                    )}
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const distance = Math.abs(currentPage - page)
                        return distance < 3 || page === 1 || page === totalPages
                      })
                      .map((page) => {
                        if (page === 1 && currentPage > 3) return null
                        if (page === totalPages && currentPage < totalPages - 2) return null
                        
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      })}
                    
                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-1">...</span>}
                        <Button
                          variant={currentPage === totalPages ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTract} onOpenChange={() => setEditingTract(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tract</DialogTitle>
            <DialogDescription>
              Update tract details
            </DialogDescription>
          </DialogHeader>
          {editingTract && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingTract.title}
                  onChange={(e) => setEditingTract({ ...editingTract, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingTract.description}
                  onChange={(e) => setEditingTract({ ...editingTract, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingTract.status}
                  onValueChange={(value) => setEditingTract({ ...editingTract, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTract(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTract} onOpenChange={() => setDeletingTract(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingTract?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTract(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
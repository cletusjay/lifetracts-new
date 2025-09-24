'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { formatBytes, formatDate } from '@/lib/utils'
import { 
  Download, 
  FileText, 
  Filter, 
  Grid3x3, 
  List, 
  Search,
  Calendar,
  Globe,
  BookOpen,
  Heart,
  Users,
  Church,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RotateCcw
} from 'lucide-react'

const categories = [
  { value: 'all', label: 'All Categories', icon: BookOpen },
  { value: 'evangelism', label: 'Evangelism', icon: Heart },
  { value: 'discipleship', label: 'Discipleship', icon: BookOpen },
  { value: 'youth', label: 'Youth', icon: Users },
  { value: 'family', label: 'Family', icon: Users },
  { value: 'seasonal', label: 'Seasonal', icon: Calendar },
  { value: 'apologetics', label: 'Apologetics', icon: BookOpen },
]

const denominations = [
  'All Denominations',
  'Baptist',
  'Methodist',
  'Presbyterian',
  'Lutheran',
  'Catholic',
  'Pentecostal',
  'Non-denominational',
  'Other',
]

const languages = [
  'All Languages',
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Chinese',
  'Arabic',
  'Other',
]

export default function TractsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDenomination, setSelectedDenomination] = useState('All Denominations')
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages')
  const [sortBy, setSortBy] = useState('newest')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [tracts, setTracts] = useState<any[]>([])
  const [filteredTracts, setFilteredTracts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 6

  // Fetch approved tracts from API
  useEffect(() => {
    fetchTracts()
  }, [])

  const fetchTracts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tracts?status=approved')
      if (response.ok) {
        const data = await response.json()
        setTracts(data.tracts || [])
        setFilteredTracts(data.tracts || [])
      } else {
        console.error('Failed to fetch tracts')
      }
    } catch (error) {
      console.error('Error fetching tracts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort tracts
  useEffect(() => {
    let filtered = [...tracts]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tract =>
        tract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tract.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tract =>
        tract.categories?.some((cat: any) => cat.slug === selectedCategory)
      )
    }

    // Denomination filter
    if (selectedDenomination !== 'All Denominations') {
      filtered = filtered.filter(tract =>
        tract.denomination === selectedDenomination
      )
    }

    // Language filter
    if (selectedLanguage !== 'All Languages') {
      const langCode = selectedLanguage.toLowerCase().slice(0, 2)
      filtered = filtered.filter(tract =>
        tract.language === langCode
      )
    }

    // Featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(tract => tract.featured)
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount)
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredTracts(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedDenomination, selectedLanguage, sortBy, showFeaturedOnly, tracts])

  // Pagination
  const totalPages = Math.ceil(filteredTracts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTracts = filteredTracts.slice(startIndex, startIndex + itemsPerPage)

  const handleDownload = async (tractId: string, title: string) => {
    try {
      // Optimistically update the download count
      setFilteredTracts(prev => prev.map(tract => 
        tract.id === tractId 
          ? { ...tract, downloadCount: tract.downloadCount + 1 }
          : tract
      ))
      
      setTracts(prev => prev.map(tract => 
        tract.id === tractId 
          ? { ...tract, downloadCount: tract.downloadCount + 1 }
          : tract
      ))
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = `/api/tracts/${tractId}/download`
      link.download = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show success toast
      toast({
        title: "Download started",
        description: `${title} is being downloaded`,
      })
    } catch (error) {
      console.error('Download failed:', error)
      // Revert the optimistic update on error
      setFilteredTracts(prev => prev.map(tract => 
        tract.id === tractId 
          ? { ...tract, downloadCount: tract.downloadCount - 1 }
          : tract
      ))
      
      setTracts(prev => prev.map(tract => 
        tract.id === tractId 
          ? { ...tract, downloadCount: tract.downloadCount - 1 }
          : tract
      ))
      
      // Show error toast
      toast({
        title: "Download failed",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedDenomination('All Denominations')
    setSelectedLanguage('All Languages')
    setSortBy('newest')
    setShowFeaturedOnly(false)
    toast({
      title: "Filters reset",
      description: "All filters have been cleared",
    })
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' || 
    selectedCategory !== 'all' || 
    selectedDenomination !== 'All Denominations' || 
    selectedLanguage !== 'All Languages' || 
    sortBy !== 'newest' || 
    showFeaturedOnly

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Browse Tracts</h1>
        <p className="text-muted-foreground">
          Explore our collection of {tracts.length} approved gospel tracts
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-8 px-2 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search tracts..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Categories */}
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Denomination */}
              <div className="space-y-2">
                <Label htmlFor="denomination">Denomination</Label>
                <Select value={selectedDenomination} onValueChange={setSelectedDenomination}>
                  <SelectTrigger id="denomination">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {denominations.map((denom) => (
                      <SelectItem key={denom} value={denom}>
                        {denom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Featured Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={showFeaturedOnly}
                  onCheckedChange={(checked) => setShowFeaturedOnly(checked as boolean)}
                />
                <Label htmlFor="featured" className="text-sm cursor-pointer">
                  Featured tracts only
                </Label>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredTracts.length} {filteredTracts.length === 1 ? 'tract' : 'tracts'} found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tracts Grid/List */}
          {paginatedTracts.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tracts found</h3>
              <p className="text-muted-foreground mb-4">
                {tracts.length === 0 
                  ? 'No approved tracts available yet.'
                  : 'Try adjusting your filters or search query'}
              </p>
              {filteredTracts.length === 0 && tracts.length > 0 && (
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedDenomination('All Denominations')
                  setSelectedLanguage('All Languages')
                  setShowFeaturedOnly(false)
                }}>
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
                : 'space-y-4'
              }>
                {paginatedTracts.map((tract) => (
                  <Card key={tract.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {tract.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            {tract.featured && (
                              <Badge variant="default" className="text-xs">
                                Featured
                              </Badge>
                            )}
                            {tract.categories?.map((cat: any) => (
                              <Badge key={cat.id} variant="outline" className="text-xs">
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3 mb-4">
                        {tract.description}
                      </CardDescription>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Church className="h-4 w-4" />
                          <span>{tract.denomination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{tract.language?.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{formatBytes(tract.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>{tract.downloadCount} downloads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>By {tract.author?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleDownload(tract.id, tract.title)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                        className={Math.abs(currentPage - page) > 2 && page !== 1 && page !== totalPages ? 'hidden sm:flex' : ''}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  BookOpen,
  Download,
  Globe,
  Heart,
  Search,
  Shield,
  Upload,
  Users,
  Zap,
  Church,
  Book
} from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Easy Upload',
    description: 'Share your tracts with a simple drag-and-drop interface'
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find the perfect tract using our advanced search and filters'
  },
  {
    icon: Shield,
    title: 'Quality Control',
    description: 'All content is reviewed to ensure doctrinal accuracy'
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Access tracts in multiple languages for global ministry'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Built by believers, for believers worldwide'
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    description: 'Lightning-fast downloads and always available'
  }
]

const categories = [
  {
    name: 'Evangelism',
    icon: Heart,
    description: 'Share the Gospel message',
    color: 'text-red-500'
  },
  {
    name: 'Discipleship',
    icon: BookOpen,
    description: 'Grow in faith and knowledge',
    color: 'text-blue-500'
  },
  {
    name: 'Youth',
    icon: Users,
    description: 'Engage the next generation',
    color: 'text-green-500'
  },
  {
    name: 'Family',
    icon: Church,
    description: 'Strengthen family bonds',
    color: 'text-purple-500'
  }
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="container relative py-24 lg:py-32">
          <div className="mx-auto max-w-[980px] text-center">
            <div className="mb-4 inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
              <Book className="mr-2 h-4 w-4" />
              Spreading the Gospel Digitally
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your Digital Library of{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Church Tracts
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl max-w-[700px] mx-auto">
              Access, share, and distribute thousands of gospel tracts from churches worldwide. 
              Join our mission to make the Word of God freely available to everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tracts">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Tracts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Start Contributing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-sm text-muted-foreground">Tracts Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Churches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1M+</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-[980px] text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Everything You Need to Share the Gospel
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to make tract distribution simple and effective
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-muted/50">
        <div className="container py-24">
          <div className="mx-auto max-w-[980px] text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground">
              Find the perfect tract for every ministry need
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link key={category.name} href={`/tracts?category=${category.name.toLowerCase()}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-background">
                        <Icon className={cn("h-8 w-8", category.color)} />
                      </div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-0">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Church className="h-12 w-12 mb-4 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Start Your Ministry Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-[600px]">
              Join thousands of churches and ministries sharing the Gospel through digital tracts. 
              Upload your first tract in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
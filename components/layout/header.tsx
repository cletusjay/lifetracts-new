'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Book,
  Home,
  Upload,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Heart
} from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUserRole } from '@/hooks/use-user-role'

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { role, canUpload, canAccessAdmin } = useUserRole()

  const mainNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tracts', label: 'Browse', icon: BookOpen },
  ]

  // Build admin nav items based on actual role from database
  const adminNavItems = []
  if (session?.user && role) {
    if (canAccessAdmin) {
      adminNavItems.push({ href: '/admin', label: 'Dashboard', icon: LayoutDashboard })
    }
    if (canUpload) {
      adminNavItems.push({ href: '/upload', label: 'Upload', icon: Upload })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Book className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              LifeTracts
            </span>
          </Link>
        </div>

        {/* Main navigation items on the left */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side items */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Admin navigation items */}
          {adminNavItems.length > 0 && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium mr-4">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 transition-colors hover:text-foreground/80",
                      pathname === item.href
                        ? "text-foreground"
                        : "text-foreground/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          )}
          
          <nav className="flex items-center space-x-2">
            {status === 'loading' ? (
              <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
            ) : session ? (
              <>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="View profile"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-2 p-4">
            {/* Main nav items */}
            {mainNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-accent",
                    pathname === item.href
                      ? "bg-accent text-foreground"
                      : "text-foreground/60"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {/* Admin nav items (if applicable) */}
            {adminNavItems.length > 0 && (
              <>
                <div className="my-2 border-t" />
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-accent",
                        pathname === item.href
                          ? "bg-accent text-foreground"
                          : "text-foreground/60"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </>
            )}
            
            {/* User profile link for mobile */}
            {session && (
              <>
                <div className="my-2 border-t" />
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-accent",
                    pathname === '/profile'
                      ? "bg-accent text-foreground"
                      : "text-foreground/60"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
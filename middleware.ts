import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For now, we'll use a simple middleware without database checks
  // The actual auth checks will happen in the server components
  
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/register")
  
  // You can add basic checks here if needed
  // For production, use NextAuth's built-in middleware or server-side checks
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
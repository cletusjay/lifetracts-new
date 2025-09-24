# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run dev         # Start development server on localhost:3000
npm run build       # Build for production
npm run start       # Start production server
```

### Database Management
```bash
npm run db:push     # Push schema changes to database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Drizzle Studio for database GUI
npm run db:seed     # Seed database with sample data
```

### Code Quality
```bash
npm run lint        # Run Next.js linting
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Beta)
- **UI Components**: Shadcn/UI with Radix UI primitives
- **Styling**: Tailwind CSS with class-variance-authority
- **File Uploads**: Uploadthing
- **Form Handling**: React Hook Form with Zod validation

### Project Structure

**App Router Structure** (`/app`):
- `(auth)/` - Authentication pages (login, register) with grouped layout
- `api/` - API routes including NextAuth configuration
- `admin/`, `tracts/`, `search/`, `upload/` - Feature pages
- `layout.tsx` - Root layout with providers
- `page.tsx` - Homepage

**Core Libraries** (`/lib`):
- `db/` - Database schema and connection
- `auth.ts` - NextAuth configuration with Drizzle adapter
- `utils.ts` - Utility functions including `cn()` for className merging

**Components** (`/components`):
- `ui/` - Shadcn/UI components (Button, Card, Dialog, etc.)
- Feature-specific components organized by domain

### Database Schema

The application uses Drizzle ORM with SQLite. Key tables:
- `users` - User accounts with roles (admin, contributor, user)
- `tracts` - Digital tract documents with metadata
- `categories` - Hierarchical categorization
- `tags` - Flexible tagging system
- `downloads` - Track download metrics
- Junction tables for many-to-many relationships

Schema location: `/lib/db/schema.ts`

### Authentication Flow

NextAuth.js v5 (Beta) handles authentication:
- Credential-based login with bcrypt password hashing
- Optional Google OAuth integration
- Session management with JWT
- Role-based access control (RBAC)

Configuration: `/lib/auth.ts`
API Route: `/app/api/auth/[...nextauth]/route.ts`

### Key Development Patterns

1. **Form Validation**: Use React Hook Form with Zod schemas
2. **Data Fetching**: Server Components for initial data, React Query for client-side
3. **File Uploads**: Uploadthing integration for PDF tract uploads
4. **Styling**: Tailwind utilities with `cn()` helper for conditional classes
5. **Database Queries**: Drizzle ORM with type-safe schema

### Environment Setup

Required environment variables (see `.env.example`):
- `DATABASE_URL` - SQLite database path
- `NEXTAUTH_SECRET` - Secret for JWT signing
- `NEXTAUTH_URL` - Application URL
- Optional: Google OAuth, Uploadthing credentials

### Default Admin Access

After running `npm run db:seed`, the admin credentials will be created based on your `.env` file:
- Email: Set via `DEFAULT_ADMIN_EMAIL` environment variable
- Password: Set via `DEFAULT_ADMIN_PASSWORD` environment variable
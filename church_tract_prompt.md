# Church Tract Repository Website - AI Generation Prompt (Next.js Stack)

## Overview
Generate a complete, functional website using Next.js and modern web technologies that serves as a digital repository for collecting, organizing, and managing church tracts from various sources.

## Required Tech Stack

### Core Framework
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **React 18+** with modern hooks and patterns

### Database & ORM
- **Drizzle ORM** with TypeScript-first approach
- **PostgreSQL** or **SQLite** (configurable for development/production)
- **Drizzle Kit** for migrations and schema management
- **Connection pooling** with PgPool or similar

### Authentication & Security
- **NextAuth.js v5** (Auth.js) for authentication
- **Role-based access control** (Admin, Contributor, User)
- **JWT tokens** for session management
- **bcryptjs** for password hashing
- **Rate limiting** with middleware

### File Storage & Management
- **Uploadthing** or **AWS S3** for file storage
- **Sharp** for image processing and PDF thumbnails
- **PDF-lib** for PDF manipulation and metadata extraction
- **File validation** and virus scanning

### Styling & UI Components
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** components library
- **Radix UI** primitives for accessibility
- **Lucide React** for consistent iconography
- **Framer Motion** for smooth animations

### Search & Performance
- **Algolia** or **ElasticSearch** for advanced search capabilities
- **Tanstack Query (React Query)** for data fetching and caching
- **Next.js Image Component** for optimized images
- **Dynamic imports** for code splitting

### Development & Deployment
- **ESLint** and **Prettier** for code quality
- **Husky** for git hooks
- **Vercel** or **Railway** for deployment
- **Docker** for containerization (optional)
- **GitHub Actions** for CI/CD

## Database Schema Design

### Tables Structure (Drizzle Schema)
```typescript
// Users table
users: {
  id: string (primary key)
  email: string (unique)
  name: string
  role: enum('admin', 'contributor', 'user')
  emailVerified: timestamp
  image: string (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}

// Tracts table
tracts: {
  id: string (primary key)
  title: string
  description: text
  authorId: string (foreign key to users)
  denomination: string (nullable)
  language: string (default 'en')
  fileUrl: string
  fileName: string
  fileSize: number
  thumbnailUrl: string (nullable)
  downloadCount: number (default 0)
  status: enum('pending', 'approved', 'rejected')
  createdAt: timestamp
  updatedAt: timestamp
}

// Categories table
categories: {
  id: string (primary key)
  name: string
  slug: string (unique)
  description: text (nullable)
  parentId: string (nullable, foreign key to categories)
  order: number (default 0)
  createdAt: timestamp
}

// Tags table
tags: {
  id: string (primary key)
  name: string (unique)
  slug: string (unique)
  createdAt: timestamp
}

// Scripture References table
scriptureReferences: {
  id: string (primary key)
  book: string
  chapter: number
  verseStart: number (nullable)
  verseEnd: number (nullable)
  version: string (default 'NIV')
  createdAt: timestamp
}

// Junction tables
tractCategories: {
  tractId: string
  categoryId: string
}

tractTags: {
  tractId: string
  tagId: string
}

tractScriptures: {
  tractId: string
  scriptureId: string
}

// Downloads tracking
downloads: {
  id: string (primary key)
  tractId: string (foreign key)
  userId: string (nullable, foreign key)
  ipAddress: string
  userAgent: string (nullable)
  downloadedAt: timestamp
}
```

## Core Features & Implementation

### API Routes Structure (Next.js App Router)
```
app/
├── api/
│   ├── auth/
│   │   └── [...nextauth]/route.ts
│   ├── tracts/
│   │   ├── route.ts (GET, POST)
│   │   ├── [id]/route.ts (GET, PUT, DELETE)
│   │   ├── search/route.ts
│   │   └── download/[id]/route.ts
│   ├── categories/
│   │   └── route.ts
│   ├── tags/
│   │   └── route.ts
│   ├── upload/
│   │   └── route.ts
│   └── admin/
│       ├── approve/route.ts
│       └── analytics/route.ts
```
### Upload & Management System
- **Next.js Server Actions** for form submissions
- **Uploadthing** integration for secure file uploads
- PDF validation and metadata extraction using **PDF-parse**
- Automatic thumbnail generation with **Sharp**
- Upload progress tracking with real-time updates
- Drag-and-drop interface with **react-dropzone**
- Bulk upload capabilities for administrators
- File compression and optimization

### Advanced Search Implementation
- **Server-side rendering** for SEO-optimized search results
- **Debounced search** with Tanstack Query
- **Full-text search** using PostgreSQL or dedicated search service
- **Faceted search** with dynamic filters
- **Search suggestions** and autocomplete
- **Search analytics** and popular queries tracking
- **Saved searches** for registered users

### Authentication & User Management
- **NextAuth.js v5** with multiple providers (Google, GitHub, Email)
- **Role-based middleware** for route protection
- **Server-side session validation** in layouts and components
- **Email verification** system with Resend or similar
- **Password reset** functionality
- **User profile management** with avatar uploads
- **Admin dashboard** with user management tools
- **Activity logging** for audit trails

## Component Architecture

### Page Components (App Router)
```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── tracts/page.tsx
│   │   ├── users/page.tsx
│   │   └── analytics/page.tsx
│   ├── profile/page.tsx
│   └── layout.tsx (protected layout)
├── tracts/
│   ├── page.tsx (browse all)
│   ├── [id]/page.tsx (tract detail)
│   ├── category/[slug]/page.tsx
│   └── upload/page.tsx
├── search/page.tsx
├── page.tsx (homepage)
└── layout.tsx (root layout)
```

### Reusable Components
```
components/
├── ui/ (shadcn/ui components)
├── forms/
│   ├── TractUploadForm.tsx
│   ├── SearchForm.tsx
│   └── UserProfileForm.tsx
├── tract/
│   ├── TractCard.tsx
│   ├── TractGrid.tsx
│   ├── TractFilters.tsx
│   └── TractViewer.tsx
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── Navigation.tsx
└── providers/
    ├── QueryProvider.tsx
    ├── ThemeProvider.tsx
    └── AuthProvider.tsx
```

## Performance & SEO Optimizations

### Next.js Specific Features
- **App Router** with nested layouts and loading states
- **Server Components** for optimal performance
- **Streaming** with Suspense boundaries
- **Metadata API** for dynamic SEO
- **Static generation** for category pages
- **Incremental Static Regeneration** for tract pages
- **Edge Runtime** for geographic optimization
- **Image optimization** with Next.js Image component

### Caching Strategy
- **React Query** for client-side data caching
- **Next.js cache** for API routes
- **CDN caching** for static assets
- **Database query optimization** with Drizzle
- **Redis caching** for session data (optional)

## Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=
DIRECT_URL= (for Drizzle migrations)

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# File Storage
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
# OR for AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=

# Email (optional)
RESEND_API_KEY=

# Search (optional)
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=
```

## Content Organization Structure
### Categorization System (Hierarchical)
- **Evangelism** - Salvation, witnessing, outreach
  - Personal Evangelism
  - Street Evangelism  
  - Online Evangelism
- **Discipleship** - Christian growth, spiritual disciplines
  - Bible Study
  - Prayer
  - Spiritual Disciplines
- **Apologetics** - Defending the faith, addressing doubts
  - Christianity vs. Other Religions
  - Science and Faith
  - Philosophy and Theology
- **Seasonal** - Christmas, Easter, special occasions
  - Christmas
  - Easter
  - Thanksgiving
  - Church Calendar Events
- **Youth** - Children and teen-focused materials
  - Children (Ages 5-12)
  - Teens (Ages 13-18)
  - Young Adults (Ages 19-25)
- **Family** - Marriage, parenting, relationships
  - Marriage
  - Parenting
  - Dating and Relationships
- **Social Issues** - Contemporary Christian responses
  - Poverty and Justice
  - Mental Health
  - Addiction Recovery
- **Denominational** - Specific church tradition materials
  - Baptist
  - Methodist
  - Presbyterian
  - Catholic
  - Pentecostal
  - Non-denominational

### Metadata Management
- Flexible tagging system for topics and themes
- Scripture reference indexing and cross-referencing
- Denomination/source attribution with logos
- Quality ratings or approval status indicators
- Usage statistics and popularity metrics

## Deployment & DevOps

### Recommended Deployment Stack
- **Vercel** (primary) or **Railway** for hosting
- **Neon** or **Supabase** for PostgreSQL database
- **Uploadthing** or **Cloudinary** for file storage
- **Sentry** for error monitoring
- **PostHog** or **Google Analytics** for usage analytics

### Development Workflow
```json
// package.json scripts
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:push": "drizzle-kit push:pg",
  "db:migrate": "drizzle-kit migrate:pg",
  "db:studio": "drizzle-kit studio",
  "db:seed": "tsx scripts/seed.ts",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

### Docker Configuration (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
## Testing Strategy

### Testing Framework
- **Jest** for unit tests
- **React Testing Library** for component tests
- **Playwright** for end-to-end tests
- **MSW** (Mock Service Worker) for API mocking
- **Drizzle Studio** for database testing

### Key Test Coverage
- Authentication flows
- File upload functionality
- Search and filtering
- Database operations
- API endpoints
- Form validations
- Accessibility compliance

## Technical Requirements & Accessibility

### Performance Standards
- **Core Web Vitals** compliance (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Lighthouse scores** 90+ across all metrics
- **Mobile-first** responsive design
- **Progressive Web App** features (optional)
- **Offline functionality** for downloaded tracts
- **Bundle size optimization** with code splitting
- **Database query optimization** with proper indexing

### Accessibility Requirements (WCAG 2.1 AA)
- **Semantic HTML** structure
- **ARIA labels** and descriptions
- **Color contrast ratio** 4.5:1 minimum
- **Keyboard navigation** for all interactive elements
- **Screen reader compatibility** 
- **Focus management** and visible focus indicators
- **Alternative text** for all images and icons
- **Skip links** and landmark navigation

## Security Implementation

### Authentication Security
- **JWT token validation** with proper expiration
- **CSRF protection** with Next.js built-in features
- **Rate limiting** on authentication endpoints
- **Password strength requirements**
- **Account lockout** after failed attempts
- **Email verification** for new accounts
- **Session management** with secure cookies

### File Upload Security
- **File type validation** (PDF only)
- **File size limits** and validation
- **Virus scanning** integration
- **Malicious content detection**
- **Secure file storage** with access controls
- **Content-Type validation**
- **File name sanitization**

### API Security
- **Input validation** with Zod schemas
- **SQL injection prevention** with parameterized queries
- **XSS protection** with content sanitization
- **CORS configuration** for API endpoints
- **Request size limits**
- **API key management** for external services

## Sample Data Requirements

### Seed Data Structure
Create realistic sample data including:
- **50+ sample tracts** across all categories
- **Multiple denominations** represented
- **Various file sizes** and formats
- **Scripture references** from different books
- **User accounts** with different roles
- **Categories and tags** properly linked
- **Download history** and analytics data
- **Reviews and ratings** (if implemented)

### Content Examples
```typescript
// Sample tract data
const sampleTracts = [
  {
    title: "The Roman Road to Salvation",
    description: "A clear explanation of salvation using verses from Romans",
    category: "Evangelism",
    denomination: "Baptist",
    scriptureReferences: ["Romans 3:23", "Romans 6:23", "Romans 5:8"],
    tags: ["salvation", "evangelism", "romans"],
    language: "en",
    fileSize: "245KB"
  },
  // ... more samples
]
```

## Project Structure & File Organization

### Complete Project Structure
```
church-tract-repository/
├── README.md
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── drizzle.config.ts
├── .env.local
├── .env.example
├── .gitignore
├── .eslintrc.json
├── prettier.config.js
├── middleware.ts
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── tracts/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tract/
│   ├── layout/
│   └── providers/
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── queries.ts
│   │   └── migrations/
│   ├── auth.ts
│   ├── utils.ts
│   ├── validations.ts
│   └── constants.ts
├── hooks/
│   ├── use-tracts.ts
│   ├── use-auth.ts
│   └── use-search.ts
├── types/
│   ├── auth.ts
│   ├── tract.ts
│   └── api.ts
├── scripts/
│   ├── seed.ts
│   └── migrate.ts
├── public/
│   ├── icons/
│   ├── images/
│   └── sample-tracts/
└── tests/
    ├── __mocks__/
    ├── components/
    ├── api/
    └── e2e/
```

## Getting Started Commands

### Initial Setup Script
```bash
# Create Next.js project
npx create-next-app@latest church-tract-repository --typescript --tailwind --eslint --app

# Install dependencies
npm install drizzle-orm drizzle-kit @auth/drizzle-adapter next-auth@beta
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
npm install @tanstack/react-query @uploadthing/react uploadthing
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react framer-motion sharp pdf-parse

# Install dev dependencies  
npm install -D @types/node @types/react @types/react-dom
npm install -D prettier eslint-config-prettier
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test

# Initialize database
npx drizzle-kit generate:pg
npx drizzle-kit push:pg

# Run development server
npm run dev
```

## Success Criteria
## Success Criteria & Implementation Standards

### Functional Requirements
1. **Authentication System** - Complete user registration, login, and role management
2. **File Management** - Secure PDF upload, storage, and download functionality  
3. **Search & Discovery** - Fast, accurate search with filtering and categorization
4. **Content Management** - Admin approval workflow and bulk operations
5. **Performance** - Sub-2-second page loads and mobile responsiveness
6. **Security** - Proper input validation, file scanning, and access controls
7. **Analytics** - Download tracking and usage statistics

### Code Quality Standards
- **TypeScript** strict mode enabled
- **ESLint** and **Prettier** configuration enforced
- **Test coverage** minimum 70% for critical paths
- **Error boundaries** and proper error handling
- **Loading states** and optimistic updates
- **Accessibility** WCAG 2.1 AA compliance
- **SEO optimization** with proper metadata

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run successfully
- [ ] File upload service connected
- [ ] Authentication providers configured
- [ ] Error monitoring (Sentry) setup
- [ ] Analytics tracking implemented
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] SSL certificate installed
- [ ] Backup strategy implemented

## Documentation Requirements

### Technical Documentation
- **README.md** with setup instructions
- **API documentation** with endpoint descriptions
- **Database schema** documentation
- **Environment variables** guide
- **Deployment guide** with step-by-step instructions
- **Testing guide** for running and writing tests
- **Contributing guidelines** for open source

### User Documentation
- **User manual** for uploading and managing tracts
- **Admin guide** for content moderation
- **FAQ section** for common questions
- **Troubleshooting guide** for common issues
- **Contact information** for support

Focus on creating a production-ready, scalable solution that demonstrates modern Next.js development patterns and best practices while serving the specific needs of Christian organizations for sharing tract materials effectively.
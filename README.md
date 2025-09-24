# LifeTracts - Digital Church Tract Repository

A modern, beautifully designed web application for collecting, organizing, and sharing church tracts from various sources. Built with Next.js 14, TypeScript, and featuring a stunning UI with Tailwind CSS and Shadcn/UI components.

## ✨ Features

- **🎨 Beautiful Modern UI** - Clean, responsive design with light/dark mode support
- **🔐 Secure Authentication** - Email/password and Google OAuth via NextAuth.js
- **📚 Comprehensive Tract Library** - Browse, search, and filter thousands of tracts
- **📤 Easy Upload System** - Drag-and-drop interface for contributing new tracts
- **🔍 Smart Search** - Advanced search with filters by category, denomination, and language
- **👥 Role-Based Access** - Admin, Contributor, and User roles with appropriate permissions
- **📊 Analytics Dashboard** - Track downloads and engagement metrics
- **🌍 Multi-Language Support** - Tracts available in multiple languages
- **⚡ Lightning Fast** - Optimized performance with Next.js App Router

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- SQLite (included) or PostgreSQL (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lifetracts.git
cd lifetracts
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Initialize the database:
```bash
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔑 Default Admin Credentials

The default admin credentials are configured in your `.env` file:
- Set `DEFAULT_ADMIN_EMAIL`
- Set `DEFAULT_ADMIN_PASSWORD`

**Important:** Always change these credentials in production by setting different values in your `.env` file!

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Framer Motion** - Animation library
- **Lucide Icons** - Beautiful icon set

### Backend
- **Drizzle ORM** - TypeScript-first ORM
- **SQLite/PostgreSQL** - Database options
- **NextAuth.js v5** - Authentication solution
- **Uploadthing** - File upload service
- **Zod** - Schema validation

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
lifetracts/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   └── tract/            # Tract-specific components
├── lib/                   # Utility functions and configurations
│   ├── db/               # Database schema and connections
│   ├── auth.ts           # Authentication configuration
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── scripts/              # Utility scripts
│   └── seed.ts          # Database seeding script
└── public/               # Static assets
```

## 🎨 UI Features

### Homepage
- Hero section with gradient background
- Feature cards with hover effects
- Statistics display
- Category browsing cards
- Call-to-action sections

### Authentication
- Beautiful login/register forms
- Social login with Google
- Password strength indicators
- Form validation with helpful error messages

### Browse & Search
- Grid/list view toggle
- Advanced filtering sidebar
- Real-time search
- Pagination
- Download tracking

### Upload System
- Drag-and-drop file upload
- Progress indicators
- File validation
- Metadata extraction
- Automatic thumbnail generation

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Zod
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Secure file upload with validation

## 📊 Database Schema

The application uses a comprehensive database schema including:
- Users with roles (admin, contributor, user)
- Tracts with metadata and status
- Categories (hierarchical)
- Tags for flexible organization
- Scripture references
- Download tracking
- Session management

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t lifetracts .
docker run -p 3000:3000 lifetracts
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database with sample data
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

```env
# Database
DATABASE_URL="file:./data.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# File Storage (optional)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline support with PWA
- [ ] AI-powered tract recommendations
- [ ] Bulk upload functionality
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] API for third-party integrations
- [ ] Multi-tenant support for churches

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with faith and technology
- Thanks to all contributors and the open-source community
- Special thanks to churches worldwide sharing the Gospel

## 📧 Contact

For questions or support, please contact:
- Email: support@lifetracts.com
- Website: https://lifetracts.com

---

**Built with ❤️ for spreading the Gospel digitally**
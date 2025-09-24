# LifeTracts - Production Deployment Guide

## 🚀 Production Deployment with Docker PostgreSQL

This guide covers deploying LifeTracts to production with a Dockerized PostgreSQL database and the Next.js application.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local builds)
- Domain name configured (for production)
- SSL certificate (Let's Encrypt recommended)

## 🐳 Docker Compose Setup

### 1. Create `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: lifetracts-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - lifetracts-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: lifetracts-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      DEFAULT_ADMIN_EMAIL: ${DEFAULT_ADMIN_EMAIL}
      DEFAULT_ADMIN_PASSWORD: ${DEFAULT_ADMIN_PASSWORD}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      UPLOADTHING_SECRET: ${UPLOADTHING_SECRET}
      UPLOADTHING_APP_ID: ${UPLOADTHING_APP_ID}
      RESEND_API_KEY: ${RESEND_API_KEY}
    ports:
      - "3000:3000"
    networks:
      - lifetracts-network
    volumes:
      - ./uploads:/app/uploads

  nginx:
    image: nginx:alpine
    container_name: lifetracts-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./uploads:/var/www/uploads
    depends_on:
      - app
    networks:
      - lifetracts-network

volumes:
  postgres_data:

networks:
  lifetracts-network:
    driver: bridge
```

### 2. Create `Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production

CMD ["node", "server.js"]
```

### 3. Create `.env.production`

```env
# Database Configuration
POSTGRES_USER=lifetracts_user
POSTGRES_PASSWORD=your-secure-postgres-password
POSTGRES_DB=lifetracts_production

# Application Database URL
DATABASE_URL=postgresql://lifetracts_user:your-secure-postgres-password@postgres:5432/lifetracts_production

# Authentication
NEXTAUTH_SECRET=your-generated-secret-key-here
NEXTAUTH_URL=https://yourdomain.com

# Default Admin (will be created on first seed)
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=change-this-strong-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Storage - Uploadthing
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Email Service - Resend (optional)
RESEND_API_KEY=your-resend-api-key
```

### 4. Create `nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server app:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        client_max_body_size 100M;

        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /uploads {
            alias /var/www/uploads;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        location /_next/static {
            proxy_pass http://nextjs;
            expires 365d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 5. Update `next.config.js` for Standalone Output

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['uploadthing.com', 'yourdomain.com'],
  },
}

module.exports = nextConfig
```

## 🚀 Deployment Steps

### Step 1: Prepare Environment

```bash
# Clone repository to production server
git clone https://github.com/yourusername/lifetracts.git
cd lifetracts

# Copy production environment file
cp .env.production .env

# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 24  # For database passwords
```

### Step 2: Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 3: Initialize Database

```bash
# Run database migrations
docker-compose exec app npm run db:push

# Seed initial data (including admin user)
docker-compose exec app npm run db:seed
```

### Step 4: SSL Certificate Setup (Let's Encrypt)

```bash
# Install certbot
sudo apt update
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to project
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
sudo chown -R $USER:$USER ./ssl

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Production Configuration

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_tracts_status ON tracts(status);
CREATE INDEX idx_tracts_featured ON tracts(featured);
CREATE INDEX idx_tracts_created_at ON tracts(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_downloads_tract_id ON downloads(tract_id);
CREATE INDEX idx_downloads_created_at ON downloads(created_at);

-- Full-text search index
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tracts_title_trgm ON tracts USING gin(title gin_trgm_ops);
CREATE INDEX idx_tracts_description_trgm ON tracts USING gin(description gin_trgm_ops);
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Add to cron for daily backups

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="lifetracts_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
docker-compose exec -T postgres pg_dump -U lifetracts_user $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-backup-bucket/
```

### Monitoring Setup

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - lifetracts-network

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - lifetracts-network

volumes:
  prometheus_data:
  grafana_data:
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords (minimum 16 characters)
- Rotate secrets regularly
- Use different credentials for each environment

### 2. Database Security
```bash
# Restrict PostgreSQL connections
# In postgresql.conf
listen_addresses = 'localhost,postgres'

# Use SSL for database connections
ssl = on
ssl_cert_file = '/var/lib/postgresql/server.crt'
ssl_key_file = '/var/lib/postgresql/server.key'
```

### 3. Application Security
- Enable rate limiting
- Implement CORS properly
- Use Content Security Policy headers
- Regular dependency updates
- Enable audit logging

### 4. Network Security
```bash
# UFW firewall configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 Performance Optimization

### 1. Enable CDN (Cloudflare)
- Configure Cloudflare for your domain
- Enable caching for static assets
- Use Cloudflare's SSL certificates

### 2. Database Connection Pooling
```javascript
// In your database configuration
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Image Optimization
- Use Next.js Image component
- Enable WebP format
- Implement lazy loading

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection string
docker-compose exec app env | grep DATABASE_URL

# Test connection manually
docker-compose exec postgres psql -U lifetracts_user -d lifetracts_production
```

2. **Application Not Starting**
```bash
# Check application logs
docker-compose logs app

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

3. **Permission Issues**
```bash
# Fix upload directory permissions
docker-compose exec app chown -R nextjs:nodejs /app/uploads
```

## 📈 Scaling Considerations

### Horizontal Scaling with Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml lifetracts

# Scale application
docker service scale lifetracts_app=3
```

### Using Kubernetes

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lifetracts-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lifetracts
  template:
    metadata:
      labels:
        app: lifetracts
    spec:
      containers:
      - name: app
        image: your-registry/lifetracts:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: lifetracts-secrets
              key: database-url
```

## 🎯 Health Checks

```javascript
// app/api/health/route.ts
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check database connection
    await db.query.users.findFirst()

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        application: 'running'
      }
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 })
  }
}
```

## 📝 Maintenance Mode

```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  if (isMaintenanceMode && !request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }
}
```

## 🚨 Emergency Procedures

### Database Restore
```bash
# Stop application
docker-compose stop app

# Restore from backup
gunzip < backup_20240101_120000.sql.gz | docker-compose exec -T postgres psql -U lifetracts_user lifetracts_production

# Restart application
docker-compose start app
```

### Rollback Deployment
```bash
# Tag current version before deployment
docker tag lifetracts:latest lifetracts:rollback

# If issues occur, revert
docker-compose down
docker tag lifetracts:rollback lifetracts:latest
docker-compose up -d
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

## 💡 Support

For deployment issues or questions:
- Check logs: `docker-compose logs -f`
- Database issues: `docker-compose exec postgres psql`
- Application shell: `docker-compose exec app sh`

Remember to always test deployments in a staging environment first!
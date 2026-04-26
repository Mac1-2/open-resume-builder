#!/bin/bash

# Open Resume Builder - Create Production Archive Script
# Removes all unnecessary files and creates a production-ready archive

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_NAME="open-resume-builder"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="${PROJECT_NAME}-${TIMESTAMP}.tar.gz"
TEMP_DIR="/tmp/${PROJECT_NAME}-build"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Clean up function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Create production archive
create_archive() {
    log_info "Creating production deployment archive..."

    # Create temporary directory
    mkdir -p "$TEMP_DIR"

    # Copy project files (excluding development files)
    log_info "Copying project files..."

    # Use rsync to copy with exclusions
    rsync -av \
        --exclude='.git' \
        --exclude='.next' \
        --exclude='node_modules' \
        --exclude='.env.local' \
        --exclude='.env' \
        --exclude='*.log' \
        --exclude='*.tar.gz' \
        --exclude='*.zip' \
        --exclude='.DS_Store' \
        --exclude='Thumbs.db' \
        --exclude='*.tmp' \
        --exclude='*.temp' \
        --exclude='*~' \
        --exclude='.vscode' \
        --exclude='.idea' \
        --exclude='*.swp' \
        --exclude='*.swo' \
        ./ "$TEMP_DIR/"

    # Create production-specific files
    log_info "Creating production configuration..."

    # Create .env.production
    cat > "$TEMP_DIR/.env.production" << 'EOF'
# Production Environment Configuration
# Copy this to .env.local and update with your production values

# Database Configuration (REQUIRED)
DATABASE_URL="mysql://user:password@db-host:3306/database_name"

# OpenAI API Key (OPTIONAL - for AI features)
OPENAI_API_KEY=""

# Application Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# Security (generate strong random values)
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="https://your-domain.com"

# Optional: Redis for session storage
# REDIS_URL="redis://localhost:6379"

# Optional: Email configuration
# SMTP_HOST=""
# SMTP_PORT=""
# SMTP_USER=""
# SMTP_PASS=""
EOF

    # Create production deployment script
    cat > "$TEMP_DIR/deploy-production.sh" << 'EOF'
#!/bin/bash

# Production Deployment Script
# Run this script on your production server after extracting the archive

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🚀 Open Resume Builder - Production Server Deployment"
echo "======================================================"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    log_error "Do not run as root. Use a regular user with sudo access."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    log_warn ".env.local not found. Copying from .env.production..."
    cp .env.production .env.local
    log_warn "Please edit .env.local with your production settings before continuing."
    read -p "Press Enter after configuring .env.local..."
fi

log_info "Installing Node.js dependencies..."
npm ci --only=production

log_info "Building application..."
npm run build

log_info "Setting up database..."
npx prisma db push

log_info "Seeding database..."
npm run db:seed

log_info "Starting application..."
npm start

log_success "Deployment complete!"
log_info "Application should be running on the configured port"
EOF

    chmod +x "$TEMP_DIR/deploy-production.sh"

    # Create production README
    cat > "$TEMP_DIR/PRODUCTION_README.md" << 'EOF'
# Open Resume Builder - Production Deployment

## 🚀 Quick Start

1. **Extract the archive**:
   ```bash
   tar -xzf open-resume-builder-*.tar.gz
   cd open-resume-builder/
   ```

2. **Configure environment**:
   ```bash
   cp .env.production .env.local
   nano .env.local  # Edit with your production settings
   ```

3. **Deploy**:
   ```bash
   ./deploy-production.sh
   ```

## 📋 Production Checklist

### Before Deployment
- [ ] Set up MariaDB/MySQL database
- [ ] Configure firewall (open necessary ports)
- [ ] Set up domain/SSL certificates
- [ ] Configure reverse proxy (nginx recommended)
- [ ] Set up monitoring/logging

### Environment Variables
Edit `.env.local` with:

```bash
# Database (REQUIRED)
DATABASE_URL="mysql://user:pass@db-host:3306/db_name"

# OpenAI (OPTIONAL)
OPENAI_API_KEY="sk-your-key"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

### Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE open_resume CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON open_resume.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 🔧 Production Configuration

### Using systemd (recommended)
```bash
sudo cp open-resume.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable open-resume
sudo systemctl start open-resume
```

### Using PM2
```bash
npm install -g pm2
pm2 start npm --name "open-resume" -- start
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
RUN npm run build
EXPOSE 3033
CMD ["npm", "start"]
```

## 🔒 Security Considerations

- Use strong database passwords
- Enable SSL/TLS
- Configure firewall properly
- Keep dependencies updated
- Use environment variables for secrets
- Enable logging and monitoring
- Regular backups

## 📊 Monitoring

### Application Logs
```bash
# systemd
sudo journalctl -u open-resume -f

# PM2
pm2 logs open-resume
```

### Health Checks
```bash
curl http://localhost:3033/api/health
```

## 🚀 Scaling

### Load Balancing
- Use nginx as reverse proxy
- Set up multiple application instances
- Use Redis for session storage
- Implement database connection pooling

### Performance Optimization
- Enable gzip compression
- Set up CDN for static assets
- Configure database indexes
- Use caching strategies
- Monitor resource usage

## 🔄 Updates

To update the application:
```bash
# Stop the service
sudo systemctl stop open-resume

# Backup database
./backup-db.sh

# Extract new version
tar -xzf open-resume-builder-new-version.tar.gz

# Update dependencies
npm ci --only=production
npm run build
npx prisma db push

# Start service
sudo systemctl start open-resume
```

## 🆘 Troubleshooting

### Common Issues

**Application won't start**:
```bash
# Check logs
sudo journalctl -u open-resume -n 50

# Check database connection
mysql -u app_user -p open_resume -e "SELECT 1"

# Check environment variables
cat .env.local
```

**Database connection errors**:
```bash
# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check user permissions
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='app_user';"
```

**Port already in use**:
```bash
# Find what's using the port
sudo netstat -tlnp | grep :3033

# Change port in .env.local
echo "PORT=3034" >> .env.local
```

**Memory issues**:
```bash
# Check system resources
free -h
df -h

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 📞 Support

For production issues:
1. Check application logs
2. Verify database connectivity
3. Confirm environment configuration
4. Check system resources
5. Review firewall settings

---

**🎉 Happy Production Deploying!**
EOF

    # Create systemd service file
    cat > "$TEMP_DIR/open-resume.service" << 'EOF'
[Unit]
Description=Open Resume Builder
After=network.target
Wants=network.target

[Service]
Type=simple
User=%USER%
WorkingDirectory=%WORKING_DIR%
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3033

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectHome=yes
ReadWritePaths=%WORKING_DIR%

[Install]
WantedBy=multi-user.target
EOF

    # Create nginx configuration example
    cat > "$TEMP_DIR/nginx.conf.example" << 'EOF'
# Nginx configuration for Open Resume Builder
# Place this in /etc/nginx/sites-available/open-resume
# Then: sudo ln -s /etc/nginx/sites-available/open-resume /etc/nginx/sites-enabled/

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Application
    location / {
        proxy_pass http://localhost:3033;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3033;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logs
    access_log /var/log/nginx/open-resume.access.log;
    error_log /var/log/nginx/open-resume.error.log;
}
EOF

    # Create a simple health check script
    cat > "$TEMP_DIR/health-check.sh" << 'EOF'
#!/bin/bash

# Health check script for Open Resume Builder

APP_URL="${APP_URL:-http://localhost:3033}"
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-openresume}"
DB_PASS="${DB_PASS:-openresume_db_pass}"
DB_NAME="${DB_NAME:-open_resume}"

echo "🔍 Open Resume Builder - Health Check"
echo "====================================="

# Check if application is responding
echo "Checking application..."
if curl -s --max-time 10 "$APP_URL" > /dev/null; then
    echo "✅ Application is responding"
else
    echo "❌ Application is not responding"
    exit 1
fi

# Check database connection
echo "Checking database..."
if mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT 1" &>/dev/null; then
    echo "✅ Database connection OK"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Check if key tables exist
echo "Checking database tables..."
TABLES=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | wc -l)
if [ "$TABLES" -gt 5 ]; then
    echo "✅ Database tables exist ($TABLES tables)"
else
    echo "❌ Database tables missing or incomplete"
    exit 1
fi

echo ""
echo "🎉 All health checks passed!"
EOF

    chmod +x "$TEMP_DIR/health-check.sh"

    # Create file manifest
    log_info "Creating file manifest..."
    find "$TEMP_DIR" -type f -not -path "*/.*" | sort > "$TEMP_DIR/MANIFEST.txt"

    # Create the archive
    log_info "Creating archive: $ARCHIVE_NAME"
    cd /tmp
    tar -czf "$ARCHIVE_NAME" "${PROJECT_NAME}-build"

    # Move archive to current directory
    mv "/tmp/$ARCHIVE_NAME" "/home/mike/open-resume/"

    log_success "Archive created successfully!"
}

# Show archive info
show_archive_info() {
    local archive_path="/home/mike/open-resume/$ARCHIVE_NAME"

    if [ -f "$archive_path" ]; then
        local size=$(du -h "$archive_path" | cut -f1)
        local checksum=$(sha256sum "$archive_path" | cut -d' ' -f1)

        echo ""
        echo "📦 Archive Information:"
        echo "======================="
        echo "File: $ARCHIVE_NAME"
        echo "Size: $size"
        echo "SHA256: $checksum"
        echo ""
        echo "📋 Archive Contents:"
        echo "===================="
        echo "• Application source code"
        echo "• Configuration templates"
        echo "• Deployment scripts"
        echo "• Production documentation"
        echo "• Systemd service file"
        echo "• Nginx configuration example"
        echo "• Health check script"
        echo ""
        echo "🚀 Deployment Instructions:"
        echo "==========================="
        echo "1. Transfer archive to production server:"
        echo "   scp $ARCHIVE_NAME user@server:/tmp/"
        echo ""
        echo "2. On production server:"
        echo "   cd /opt/"
        echo "   sudo mkdir open-resume"
        echo "   sudo chown \$USER:\$USER open-resume"
        echo "   cd open-resume"
        echo "   tar -xzf /tmp/$ARCHIVE_NAME"
        echo "   ./deploy-production.sh"
        echo ""
        echo "3. Configure your production settings in .env.local"
        echo "4. Set up SSL certificates and reverse proxy"
        echo "5. Enable monitoring and backups"
    fi
}

# Main function
main() {
    echo "📦 Open Resume Builder - Production Archive Creator"
    echo "=================================================="
    echo ""

    log_info "Starting archive creation process..."

    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "deploy.sh" ]; then
        log_error "Please run this script from the Open Resume Builder root directory"
        log_error "Missing required files. Make sure deploy.sh exists."
        exit 1
    fi

    # Create the archive
    create_archive

    # Show archive information
    show_archive_info

    echo ""
    log_success "Production archive ready for deployment!"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Test the archive locally (optional)"
    echo "   2. Transfer to production server"
    echo "   3. Follow PRODUCTION_README.md for deployment"
    echo ""
}

# Run main function
main "$@"
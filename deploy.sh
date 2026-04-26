#!/usr/bin/env bash
#===============================================================================
# open-resume-deploy.sh
# Universal Production Deployment Script
# Supports: Debian 12, Ubuntu 22.04/24.04, AlmaLinux 9, Rocky Linux 9
#
# Prerequisites:
#   - Fresh server with minimum 2GB RAM
#   - Root access or a user with sudo privileges
#   - Port 80 and 443 open in your firewall/security group.
#
# Usage:
#   chmod +x open-resume-deploy.sh
#   ./open-resume-deploy.sh
#===============================================================================

set -euo pipefail

# --- Configuration (Edit these before running) ---
APP_NAME="open-resume"
APP_DIR="/var/www/${APP_NAME}"
APP_PORT=3033
DB_NAME="open_resume"
DB_USER="resume_user"
DB_PASS="ChangeMe123!" 
DOMAIN="_placeholder_"
TIMEZONE="Etc/UTC"
NODE_VERSION="20"
MARIADB_ROOT_PASS="RootPassword123!" 
OPENAI_API_KEY="" # Set your key here
# ----------------------------------------------------

# --- Colors for output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# --- Detect OS Family ---
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        log_error "Cannot detect OS. /etc/os-release not found."
        exit 1
    fi

    log_info "Detected OS: $OS $VER"

    case "$OS" in
        ubuntu|debian)
            PKG_MGR="apt"
            OS_FAMILY="debian"
            ;;
        almalinux|rocky)
            PKG_MGR="dnf"
            if [ "$OS" == "almalinux" ] || [ "$OS" == "rocky" ]; then
                if [ "$VER" != "9" ]; then
                    log_warn "This script is optimized for $OS 9. Proceeding anyway."
                fi
            fi
            OS_FAMILY="rhel"
            ;;
        *)
            log_error "Unsupported OS: $OS. Aborting."
            exit 1
            ;;
    esac
}

# --- Step 1: System Updates & Base Packages ---
install_base() {
    log_info "Updating system and installing base packages..."
    case $OS_FAMILY in
        debian)
            apt update
            apt install -y curl wget gnupg ca-certificates git software-properties-common
            ;;
        rhel)
            dnf update -y
            dnf install -y curl wget gnupg2 ca-certificates git dnf-utils
            ;;
    esac
}

# --- Step 2: Install Node.js (v20) ---
install_node() {
    log_info "Installing Node.js 20..."
    case $OS_FAMILY in
        debian)
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
            apt install -y nodejs
            ;;
        rhel)
            curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
            dnf install -y nodejs
            ;;
    esac
    node -v && npm -v
}

# --- Step 3: Install & Secure MariaDB ---
install_mariadb() {
    log_info "Installing MariaDB..."
    case $OS_FAMILY in
        debian)
            apt install -y mariadb-server
            ;;
        rhel)
            dnf install -y mariadb-server
            ;;
    esac

    log_info "Starting MariaDB..."
    systemctl enable mariadb
    systemctl start mariadb

    log_info "Securing MariaDB installation (setting root password and defaults)..."
    # mysql_secure_installation non-interactive
    mysql -u root <<-EOSQL
        SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${MARIADB_ROOT_PASS}');
        DELETE FROM mysql.user WHERE User='';
        DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
        DROP DATABASE IF EXISTS test;
        DELETE FROM mysql.db WHERE Db='test' OR Db='test\_%';
        FLUSH PRIVILEGES;
EOSQL

    log_info "Creating application database and user..."
    mysql -u root -p${MARIADB_ROOT_PASS} <<-EOSQL
        CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
        GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
        FLUSH PRIVILEGES;
EOSQL
    log_info "Database setup complete."
}

# --- Step 4: Clone / Prepare Application ---
setup_app() {
    log_info "Preparing application directory at ${APP_DIR}..."
    mkdir -p ${APP_DIR}
    chown -R $USER:$USER ${APP_DIR}

    # If running again, maybe skip clone, but for fresh setup:
    # We assume repo is in parent. For script portability, we copy local code or git clone.
    if [ -d ".git" ] && [ -f "package.json" ]; then
        log_info "Local project detected. Copying project files..."
        cp -r * ${APP_DIR}/
        cp -r .* ${APP_DIR}/ 2>/dev/null || true
    else
        log_error "No local project found. Please run this script from the project root."
        exit 1
    fi

    cd ${APP_DIR}
    
    log_info "Installing npm dependencies (this may take a few minutes)..."
    npm ci || npm install
    
    log_info "Setting up Environment Variables..."
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
    fi
    
    # Update .env.local with our DB credentials
    sed -i "s|mysql://root:password@localhost:3306/open_resume|mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}|g" .env.local
    sed -i "s|NEXT_PUBLIC_APP_URL=\"http://localhost\"|NEXT_PUBLIC_APP_URL=\"http://${DOMAIN}\"|g" .env.local
    if [ -n "$OPENAI_API_KEY" ]; then
        sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=\"${OPENAI_API_KEY}\"|g" .env.local
    fi

    log_info "Running Prisma Migrations / Seed..."
    npx prisma generate
    npx prisma db push
    npx prisma db seed

    log_info "Building Next.js application (Production)..."
    npm run build
}

# --- Step 5: Install & Configure PM2 ---
setup_pm2() {
    log_info "Installing PM2 process manager..."
    npm install -g pm2

    log_info "Starting application with PM2..."
    cd ${APP_DIR}
    pm2 start npm --name "${APP_NAME}" -- start -p ${APP_PORT}
    pm2 save
    pm2 startup | bash -
    
    log_info "PM2 setup complete. App should be running on port ${APP_PORT}."
}

# --- Step 6: Install & Configure Nginx ---
setup_nginx() {
    log_info "Installing Nginx..."
    case $OS_FAMILY in
        debian) apt install -y nginx ;;
        rhel)   dnf install -y nginx ;;
    esac

    log_info "Configuring Nginx reverse proxy..."
    cat > /etc/nginx/conf.d/${APP_NAME}.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Remove default config if it exists
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

    log_info "Testing Nginx configuration..."
    nginx -t

    log_info "Restarting Nginx..."
    systemctl restart nginx
    systemctl enable nginx

    log_info "Configuring Firewall..."
    case $OS_FAMILY in
        debian)
            apt install -y ufw
            ufw allow 'Nginx Full'
            ufw allow ssh
            echo "y" | ufw enable
            ;;
        rhel)
            dnf install -y firewalld
            systemctl enable firewalld
            systemctl start firewalld
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --reload
            ;;
    esac
}

# --- Step 7: SSL (Let's Encrypt) ---
setup_ssl() {
    if [ "$DOMAIN" == "_placeholder_" ]; then
        log_warn "DOMAIN is not set. Skipping Let's Encrypt SSL setup."
        log_warn "You can install it later manually using 'certbot'."
        return 0
    fi

    log_info "Installing Certbot (Let's Encrypt)..."
    case $OS_FAMILY in
        debian) apt install -y certbot python3-certbot-nginx ;;
        rhel)   dnf install -y certbot python3-certbot-nginx ;;
    esac

    log_info "Requesting SSL Certificate for ${DOMAIN}..."
    certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --register-unsafely-without-email
    
    # Auto-renewal service is usually installed by certbot package
    # but let's enable the timer for rhel explicitly
    if [ "$OS_FAMILY" == "rhel" ]; then
        systemctl enable certbot-nginx.timer
        systemctl start certbot-nginx.timer
    fi

    # Update Nginx to redirect HTTP -> HTTPS and proxy to Node.js
    # Certbot usually does this, but we ensure proxy headers are set
    sed -i '/ssl_certificate/ a\    proxy_set_header X-Forwarded-Proto \$scheme;' /etc/nginx/conf.d/${APP_NAME}.conf

    systemctl reload nginx
    log_info "SSL Setup Complete!"
}

# --- Execution Flow ---
main() {
    echo "============================================"
    echo " Open Resume Builder - Auto Deploy Script"
    echo "============================================"

    if [ "$EUID" -ne 0 ]; then 
        log_error "Please run as root (sudo)."
        exit 1
    fi

    # Optional: Accept domain as arg
    if [ ! -z "$1" ]; then
        DOMAIN="$1"
        log_info "Using domain: $DOMAIN"
    fi

    detect_os
    install_base
    install_node
    install_mariadb
    setup_app
    setup_pm2
    setup_nginx
    # Uncomment the line below if you want to auto-setup SSL and have a real domain
    # If you ran without a domain, it will skip
    setup_ssl

    log_info "============================================"
    log_info " DEPLOYMENT COMPLETE! "
    log_info "============================================"
    log_info "App URL: http://${DOMAIN:-<your-server-ip>}"
    log_info "App Dir: ${APP_DIR}"
    log_info "DB User: ${DB_USER}"
    log_info "PM2 Logs: pm2 logs ${APP_NAME}"
    log_info "============================================"
}

main "$@"
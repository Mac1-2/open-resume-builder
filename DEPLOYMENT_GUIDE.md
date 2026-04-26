# Open Resume Builder – Deployment Guide (A to Z)
**Date:** 2026-04-25

This guide explains how to deploy Open Resume Builder on a fresh Linux server (Ubuntu/Debian) using Apache, MariaDB, Node.js, and PM2.

---

## 🇬🇧 English Instructions

### 1. Update system and install required packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg software-properties-common git
sudo apt install -y nodejs npm
sudo apt install -y mariadb-server mariadb-client
sudo apt install -y apache2
```

### 2. Configure MariaDB
Start and secure MariaDB:
```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation
```
(Follow prompts — set root password, remove anonymous users, etc.)

Create database and user:
```bash
sudo mysql -u root -p
```
SQL commands:
```sql
CREATE DATABASE open_resume CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'resume_user'@'localhost' IDENTIFIED BY 'StrongPassword123';
GRANT ALL PRIVILEGES ON open_resume.* TO 'resume_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone project and install dependencies
```bash
cd /var/www
sudo git clone https://github.com/your-repo/open-resume.git
cd open-resume
sudo chown -R $USER:$USER /var/www/open-resume
npm ci
```

### 4. Environment configuration
Copy `.env.example` to `.env.local` and edit:
```bash
cp .env.example .env.local
nano .env.local
```
Set values:
```dotenv
DATABASE_URL="mysql://resume_user:StrongPassword123@localhost:3306/open_resume"
NEXT_PUBLIC_APP_URL="http://localhost"
OPENAI_API_KEY=""  # optional
```

### 5. Database setup (Prisma)
Generate client and push schema:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 6. Build production bundle
```bash
npm run build
```

### 7. Serve the app with PM2
Install PM2 globally:
```bash
sudo npm install -g pm2
```
Start the app (port 3033):
```bash
pm2 start npm --name "open-resume" -- start -p 3033
pm2 save
pm2 startup  # follow printed command to enable on boot
```

### 8. Apache reverse proxy configuration
Enable required modules:
```bash
sudo a2enmod proxy proxy_http rewrite headers
```
Create virtual host file:
```bash
sudo nano /etc/apache2/sites-available/open-resume.conf
```
Content:
```apache
<VirtualHost *:80>
    ServerName your-domain.com

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3033/
    ProxyPassReverse / http://127.0.0.1:3033/

    ErrorLog ${APACHE_LOG_DIR}/open-resume-error.log
    CustomLog ${APACHE_LOG_DIR}/open-resume-access.log combined
</VirtualHost>
```
Enable site and reload:
```bash
sudo a2ensite open-resume.conf
sudo systemctl reload apache2
```

### 9. Set up HTTPS (Let’s Encrypt) – optional
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com
```

### 10. Final checks and access
- Open browser: `http://your-domain.com` or `http://server-ip`
- Visit `/editor` to use the resume builder.
- Verify app status: `pm2 status`

---

## 🇵🇱 Instrukcje po polsku

### 1. Aktualizacja systemu i instalacja pakietów
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg software-properties-common git
sudo apt install -y nodejs npm
sudo apt install -y mariadb-server mariadb-client
sudo apt install -y apache2
```

### 2. Konfiguracja MariaDB
Uruchom i zabezpiecz MariaDB:
```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation
```
(Podaj hasło roota i odpowiedz Y na pytania o bezpieczeństwo.)

Utwórz bazę i użytkownika:
```bash
sudo mysql -u root -p
```
Polecenia SQL:
```sql
CREATE DATABASE open_resume CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'resume_user'@'localhost' IDENTIFIED BY 'SilneHaslo123';
GRANT ALL PRIVILEGES ON open_resume.* TO 'resume_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Klonowanie projektu i instalacja zależności
```bash
cd /var/www
sudo git clone https://github.com/your-repo/open-resume.git
cd open-resume
sudo chown -R $USER:$USER /var/www/open-resume
npm ci
```

### 4. Konfiguracja środowiska
Skopiuj plik `.env.example` do `.env.local` i edytuj:
```bash
cp .env.example .env.local
nano .env.local
```
Ustaw:
```dotenv
DATABASE_URL="mysql://resume_user:SilneHaslo123@localhost:3306/open_resume"
NEXT_PUBLIC_APP_URL="http://localhost"
OPENAI_API_KEY=""  # opcjonalnie
```

### 5. Uruchomienie bazy danych (Prisma)
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 6. Budowa wersji produkcyjnej
```bash
npm run build
```

### 7. Uruchomienie przez PM2
Zainstaluj PM2 globalnie:
```bash
sudo npm install -g pm2
```
Uruchom aplikację na porcie 3033:
```bash
pm2 start npm --name "open-resume" -- start -p 3033
pm2 save
pm2 startup  # wykonaj wydrukowane polecenie, aby włączyć autostart
```

### 8. Konfiguracja Apache jako proxy
Włącz moduły:
```bash
sudo a2enmod proxy proxy_http rewrite headers
```
Stwórz plik vhost:
```bash
sudo nano /etc/apache2/sites-available/open-resume.conf
```
Zawartość:
```apache
<VirtualHost *:80>
    ServerName twoja-domena.pl

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3033/
    ProxyPassReverse / http://127.0.0.1:3033/

    ErrorLog ${APACHE_LOG_DIR}/open-resume-error.log
    CustomLog ${APACHE_LOG_DIR}/open-resume-access.log combined
</VirtualHost>
```
Włącz stronę i przeładuj Apache:
```bash
sudo a2ensite open-resume.conf
sudo systemctl reload apache2
```

### 9. Certyfikat SSL (Let’s Encrypt) – opcjonalnie
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d twoja-domena.pl
```

### 10. Ostateczne sprawdzenie i dostęp
- Otwórz w przeglądarce: `http://twoja-domina.pl` lub `http://adres-ip-serwera`
- Wejdź w `/editor`, aby użyć edytora CV.
- Sprawdź status aplikacji: `pm2 status`

---

**Tip:** Jeśli używasz własnej domeny, zaktualizuj rekordy DNS, aby wskazywały na adres IP tego serwera przed wykonaniem kroków powiązanych z SSL/Let's Encrypt.
# Open Resume Builder

A modern resume builder built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and MariaDB.

## Features

- AI-powered resume content generation
- 5 professionally designed templates
- Real-time preview with interactive editor
- PDF export
- Multi-format import/export
- Dark/light mode

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MariaDB / MySQL
- **AI**: OpenAI GPT integration
- **Editor**: TipTap (rich text), react-colorful (color picker)
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MariaDB 10.5+ or MySQL 8.0+

### Production Deployment (Universal Script) Not tested 

For a quick production deployment on supported Linux servers (Debian, Ubuntu, AlmaLinux, Rocky), use the provided deployment script:

1. **Clone the repository** and navigate to the project directory.
2. **Configure deployment**: Open `deploy.sh` and edit the `Configuration` section at the top to set your database credentials, domain, OpenAI API key, and desired versions.
3. **Run the script**:
   ```bash
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

### Manual Installation

```bash
# Clone repository
git clone https://github.com/Mac1-2/open-resume-builder.git
cd open-resume

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your database credentials
```

### Database Setup

1. **Install MariaDB** (Ubuntu/Debian):
   ```bash
   sudo apt-get update
   sudo apt-get install mariadb-server
   ```
   **Install MariaDB** (Ubuntu/Debian):
   ```bash
   sudo dnf update -y
   sudo dnf install mariadb-server -y
   ```

   **macOS** (with Homebrew):
   ```bash
   brew install mariadb
   brew services start mariadb
   ```

   **Windows / Other**: See [MariaDB Download page](https://mariadb.org/download/)

2. **Start the database service**:
   ```bash
   sudo systemctl start mariadb
   sudo systemctl enable mariadb  # start on boot (optional)
   ```

3. **Create the database**:
   ```sql
   mysql -u root -p
   CREATE DATABASE open_resume;
   CREATE USER 'open_resume_user'@'localhost' IDENTIFIED BY 'your_strong_password';
   GRANT ALL PRIVILEGES ON open_resume.* TO 'open_resume_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Update `.env`** with your connection string:
   ```env
   DATABASE_URL="mysql://open_resume_user:your_strong_password@localhost:3306/open_resume"
   ```

   *(Development convenience: use `root:password` for local environments only)*

5. **Push the database schema**:
   ```bash
   npx prisma db push
   ```

6. **Seed initial data** (templates, admin user, sample resume):
   ```bash
   npm run db:seed
   ```

7. **(Optional) Open Prisma Studio** to inspect data:
   ```bash
   npm run db:studio
   ```

## Development

```bash
# Start development server
npm run dev
# Open http://localhost:3033
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync Prisma schema with database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with initial data |
| `npx prisma generate` | Regenerate Prisma Client |

## Project Structure

```
/home/mike/open-resume/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities & helpers
│   └── store/            # Zustand state stores
├── public/               # Static assets
├── .env                  # Environment variables
├── .env.local            # Local overrides (gitignored)
└── README.md            # This file
```

## Configuration

Key environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MariaDB/MySQL connection string |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app |

## Database Schema

Main entities:

- **User** – registered users
- **Resume** – resume data (JSON) linked to a user and template
- **Template** – CV template configuration (JSON store)
- **AIChat** – conversation history for AI resume generation
- **Settings** – application-wide key-value settings

## Adding New Templates

1. Add template configuration to `prisma/seed.ts` or create via Prisma Studio
2. Template `config` field supports:
   - `layout`: `single-column`, `two-column`, `grid`, `executive`, `technical`
   - `primaryColor` / `secondaryColor`: hex color codes
   - `fontFamily`: CSS font stack
   - `spacing`: `compact` \| `normal` \| `relaxed`
   - `show*`: boolean visibility toggles per section
   - `customSections`: optional additional section names

3. Resume builder pages will auto-detect new active templates.

## Troubleshooting

### "Too many connections" error
Increase MariaDB `max_connections`:
```sql
SET GLOBAL max_connections = 200;
```

### Prisma Client generation errors
```bash
npx prisma generate
```

### Seed fails with "Template already exists"
The seed uses `upsert` and is idempotent — re-running is safe.

## License

MIT

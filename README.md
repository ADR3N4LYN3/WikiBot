# WikiBot - Discord Knowledge Base Bot

WikiBot is a Discord bot with a web dashboard for managing collaborative knowledge bases with AI-powered semantic search.

## Features

- 📚 **Knowledge Base Management** - Create, edit, and organize wiki articles
- 🔍 **Smart Search** - Full-text search (free) and AI semantic search (premium)
- 🤖 **AI Answers** - RAG-powered responses using GPT-4
- 👥 **Collaborative Editing** - Version history and multi-user collaboration
- 📊 **Analytics** - Track article views, searches, and engagement
- 💎 **Freemium Model** - Free tier + Premium/Pro subscriptions
- 🎨 **Custom Branding** - Customize colors, logos, and embeds (premium)

## Tech Stack

### Backend
- **Bot**: Node.js + discord.js v14
- **API**: Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Vector DB**: Pinecone (for AI embeddings)
- **AI**: OpenAI (text-embedding-3-small + GPT-4)
- **Cache**: Redis

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js v5 (Discord OAuth2)
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: Tiptap v2 (WYSIWYG Markdown)

### Infrastructure
- **Monorepo**: pnpm workspaces + Turborepo
- **Hosting**: Railway (bot + API), Vercel (dashboard)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry

## Project Structure

```
wikibot/
├── apps/
│   ├── bot/           # Discord bot application
│   ├── api/           # REST API server
│   └── dashboard/     # Web dashboard (Next.js)
├── packages/
│   ├── database/      # Prisma schema + migrations
│   ├── shared/        # Shared types, constants, validators
│   └── config/        # Shared ESLint, TypeScript, Tailwind configs
└── docker/            # Docker configurations
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 15
- Redis >= 7 (optional, for caching)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/wikibot.git
cd wikibot
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup environment variables**

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_BOT_TOKEN` - Discord application credentials
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`

Optional (for AI features):
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key

4. **Setup the database**

```bash
# Run migrations
pnpm db:migrate

# Seed with test data
pnpm db:seed

# (Optional) Open Prisma Studio to view data
pnpm db:studio
```

5. **Start development servers**

```bash
# Start all services (bot + API + dashboard)
pnpm dev
```

This will start:
- Bot: Running and connected to Discord
- API: http://localhost:4000
- Dashboard: http://localhost:3000

### Development Workflow

#### Database changes

```bash
# Create a new migration
pnpm db:migrate

# Push schema changes without migration (dev only)
pnpm db:push

# Open Prisma Studio
pnpm db:studio
```

#### Building for production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @wikibot/bot build
```

#### Linting and formatting

```bash
# Run ESLint on all packages
pnpm lint

# Format code with Prettier
pnpm format
```

## Discord Bot Setup

1. **Create a Discord Application**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Navigate to "Bot" section and create a bot
   - Copy the bot token to `DISCORD_BOT_TOKEN` in `.env`

2. **Enable Required Intents**
   - In the Bot section, enable:
     - Server Members Intent
     - Message Content Intent (if reading messages)

3. **Setup OAuth2**
   - Navigate to OAuth2 → General
   - Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
   - Copy Client ID and Client Secret to `.env`

4. **Invite Bot to Server**
   - OAuth2 → URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
   - Copy the generated URL and invite the bot

5. **Register Slash Commands**

```bash
cd apps/bot
pnpm register-commands
```

## Available Commands

### Bot Commands (Discord)

- `/wiki search [query]` - Search for articles
- `/wiki create` - Create a new article (opens modal)
- `/wiki view [slug]` - View an article
- `/wiki edit [slug]` - Edit an article
- `/wiki delete [slug]` - Delete an article
- `/wiki random` - Get a random article

### Package Scripts

```bash
# Development
pnpm dev                    # Start all services
pnpm dev --filter @wikibot/bot  # Start only bot

# Database
pnpm db:migrate            # Run Prisma migrations
pnpm db:push               # Push schema changes
pnpm db:studio             # Open Prisma Studio
pnpm db:seed               # Seed database

# Build
pnpm build                 # Build all packages
pnpm build --filter @wikibot/api  # Build specific package

# Testing
pnpm test                  # Run all tests
pnpm test --filter @wikibot/dashboard  # Test specific package

# Code Quality
pnpm lint                  # Lint all packages
pnpm format                # Format with Prettier
pnpm clean                 # Clean build artifacts
```

## Deployment

### Bot + API (Railway)

1. Create a new Railway project
2. Add PostgreSQL and Redis services
3. Deploy `apps/bot` and `apps/api` as separate services
4. Add environment variables from `.env.example`

### Dashboard (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `apps/dashboard`
3. Add environment variables
4. Deploy

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## Architecture

### Data Flow

```
Discord User → Bot (discord.js)
                ↓
           API (Express)
                ↓
    ┌───────────┴───────────┐
    ↓           ↓           ↓
PostgreSQL  Pinecone    OpenAI
```

### Authentication Flow

```
User → Dashboard → Discord OAuth2 → NextAuth → JWT Session → API
```

### Search Flow

**Free Tier (Full-text)**:
```
Query → PostgreSQL tsvector → Results
```

**Premium Tier (Semantic)**:
```
Query → OpenAI Embedding → Pinecone → Top Results
                                    ↓
                            (If no good match)
                                    ↓
                            GPT-4 RAG Answer
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- 📖 Documentation: [docs/](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/wikibot/issues)
- 💬 Discord: [Join our Discord](https://discord.gg/your-invite)

---

Built with ❤️ using Next.js, Discord.js, and OpenAI

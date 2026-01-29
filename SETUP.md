# Guide de Configuration WikiBot

## Prérequis

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker Desktop (optionnel, pour la DB locale)

---

## ÉTAPE 1 : Créer la Base de Données

### Option A : Supabase (Gratuit, Recommandé)

1. Va sur https://supabase.com et crée un compte
2. Clique **"New Project"**
3. Choisis un nom (ex: `wikibot`) et un mot de passe
4. Attends que le projet soit créé (~2 min)
5. Va dans **Settings → Database**
6. Copie la **Connection string** (URI)
   - Elle ressemble à : `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - Remplace `[PASSWORD]` par ton mot de passe

### Option B : Neon (Gratuit)

1. Va sur https://neon.tech et crée un compte
2. Crée un nouveau projet
3. Copie la **Connection string** depuis le dashboard

### Option C : Docker Local

```bash
# Lance PostgreSQL et Redis localement
docker-compose up -d postgres redis

# Ta DATABASE_URL sera :
# postgresql://wikibot:wikibot_password@localhost:5432/wikibot
```

---

## ÉTAPE 2 : Créer l'Application Discord

1. Va sur https://discord.com/developers/applications
2. Clique **"New Application"** → Nomme-la `WikiBot`
3. Note le **Application ID** (= Client ID)

### Configurer le Bot

4. Va dans **Bot** (menu gauche)
5. Clique **"Reset Token"** → Copie le **Token** (garde-le secret !)
6. Active les **Privileged Gateway Intents** :
   - ✅ Message Content Intent
   - ✅ Server Members Intent

### Configurer OAuth2

7. Va dans **OAuth2 → General**
8. Copie le **Client Secret**
9. Dans **Redirects**, ajoute :
   ```
   http://localhost:3000/api/auth/callback/discord
   ```
   (Ajoute aussi ton domaine de prod plus tard)

### Inviter le Bot sur ton serveur

10. Va dans **OAuth2 → URL Generator**
11. Coche les scopes : `bot`, `applications.commands`
12. Coche les permissions : `Send Messages`, `Embed Links`, `Use Slash Commands`
13. Copie l'URL générée et ouvre-la pour inviter le bot

---

## ÉTAPE 3 : Configurer les Variables d'Environnement

Crée un fichier `.env` à la racine du projet :

```bash
# Copie le template
cp .env.example .env
```

Remplis les valeurs :

```env
# === DATABASE ===
# Colle ta connection string de Supabase/Neon ici
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres"

# === DISCORD ===
# Depuis Discord Developer Portal
DISCORD_CLIENT_ID="ton_application_id"
DISCORD_CLIENT_SECRET="ton_client_secret"
DISCORD_BOT_TOKEN="ton_bot_token"

# === NEXTAUTH ===
NEXTAUTH_URL="http://localhost:3000"
# Génère un secret avec : openssl rand -base64 32
NEXTAUTH_SECRET="genere_une_chaine_aleatoire_ici"

# === API ===
API_PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000"

# === OPTIONNEL (pour AI Search) ===
OPENAI_API_KEY="sk-..."
PINECONE_API_KEY="..."
PINECONE_INDEX_NAME="wikibot-articles"

# === OPTIONNEL (pour Stripe) ===
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## ÉTAPE 4 : Installer et Lancer

```bash
# 1. Installe les dépendances
pnpm install

# 2. Génère le client Prisma
pnpm db:generate

# 3. Crée les tables dans la DB
pnpm db:push

# 4. Lance tous les services en dev
pnpm dev
```

### URLs disponibles :

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API | http://localhost:4000 |
| Health Check | http://localhost:4000/health |

---

## ÉTAPE 5 : Tester

1. Ouvre http://localhost:3000
2. Clique **"Login with Discord"**
3. Autorise l'application
4. Tu es connecté au dashboard !

### Tester le bot Discord

Dans ton serveur Discord :
```
/wiki-create
/wiki-search query:test
/wiki-view slug:mon-article
/wiki-help
```

---

## Déploiement Production (Docker + VPS)

### Option A : Docker sur VPS (Recommandé)

**Prérequis** : Un VPS avec Docker installé (Hetzner, OVH, DigitalOcean...)

#### 1. Configurer Cloudflare DNS

Dans Cloudflare, ajoute ces records DNS pointant vers l'IP de ton VPS :

| Type | Nom | Contenu | Proxy |
|------|-----|---------|-------|
| A | @ | `IP_DE_TON_VPS` | DNS only (gris) |
| A | api | `IP_DE_TON_VPS` | DNS only (gris) |
| A | www | `IP_DE_TON_VPS` | DNS only (gris) |

**Important** : Laisse le proxy Cloudflare **désactivé** (icône grise) pour que Let's Encrypt puisse valider les certificats.

#### 2. Configurer nginx

Copie les configs nginx fournies :

```bash
sudo cp nginx/wikibot.conf /etc/nginx/sites-available/
sudo cp nginx/wikibot-api.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/wikibot.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/wikibot-api.conf /etc/nginx/sites-enabled/
```

Génère les certificats SSL avec Let's Encrypt :

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d wikibot-app.xyz -d api.wikibot-app.xyz -d www.wikibot-app.xyz
sudo nginx -t && sudo systemctl reload nginx
```

#### 3. Déployer sur le VPS

```bash
# Connecte-toi au VPS
ssh user@ton-vps

# Clone le repo
git clone https://github.com/tonusername/WikiBot.git
cd WikiBot

# Installe pnpm et génère le lockfile
npm install -g pnpm
pnpm install

# Crée le fichier .env avec tes variables
nano .env

# Lance tout
docker compose up -d --build

# Vérifie les logs
docker compose logs -f
```

#### 3. Variables .env pour production

```env
# DATABASE (Supabase)
DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"

# DISCORD
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."
DISCORD_BOT_TOKEN="..."

# NEXTAUTH (URLs de prod)
NEXTAUTH_URL="https://wikibot-app.xyz"
NEXTAUTH_SECRET="..." # openssl rand -base64 32

# API
NEXT_PUBLIC_API_URL="https://api.wikibot-app.xyz"
```

#### 4. Discord OAuth Redirect

Dans Discord Developer Portal, ajoute le redirect URI de prod :
```
https://wikibot-app.xyz/api/auth/callback/discord
```

### Option B : Vercel + Railway (Serverless)

#### Dashboard → Vercel

1. Push ton code sur GitHub
2. Va sur https://vercel.com
3. Importe ton repo
4. Configure les variables d'environnement
5. Deploy !

#### API + Bot → Railway

1. Va sur https://railway.app
2. Crée un nouveau projet
3. Ajoute un service depuis GitHub
4. Configure :
   - Root Directory : `apps/api`
   - Build Command : `pnpm build`
   - Start Command : `pnpm start`
5. Ajoute les variables d'environnement
6. Répète pour le bot (`apps/bot`)

---

## Dépannage

### "Cannot connect to database"
- Vérifie que DATABASE_URL est correct
- Si Supabase : vérifie que le mot de passe est bon
- Si Docker : vérifie que le container tourne (`docker ps`)

### "Discord login failed"
- Vérifie DISCORD_CLIENT_ID et DISCORD_CLIENT_SECRET
- Vérifie que le redirect URI correspond à ton environnement :
  - Dev : `http://localhost:3000/api/auth/callback/discord`
  - Prod : `https://wikibot-app.xyz/api/auth/callback/discord`

### "Bot not responding"
- Vérifie DISCORD_BOT_TOKEN
- Vérifie que le bot est invité sur ton serveur
- Regarde les logs : `pnpm --filter @wikibot/bot dev`

### "Servers not showing in dashboard"
- Le bot doit être **démarré** pour synchroniser les serveurs
- Au démarrage, le bot enregistre automatiquement tous les serveurs où il est présent
- L'API doit être accessible (`http://localhost:4000`)
- Tu dois avoir la permission **MANAGE_GUILD** sur les serveurs pour les voir

---

## Structure des Services

```
WikiBot/
├── apps/
│   ├── api/        → API Express (port 4000)
│   ├── bot/        → Discord Bot
│   └── dashboard/  → Next.js (port 3000)
├── packages/
│   ├── database/   → Prisma schema
│   └── shared/     → Types partagés
└── docker-compose.yml
```

---

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/public/stats` | Statistiques publiques (landing page) |

### Servers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/servers` | Créer/mettre à jour un serveur |
| POST | `/api/v1/servers/check` | Vérifier quels serveurs ont le bot installé |
| GET | `/api/v1/servers/:id` | Récupérer un serveur |
| DELETE | `/api/v1/servers/:id` | Supprimer un serveur |

### Articles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/articles` | Liste des articles |
| POST | `/api/v1/articles` | Créer un article |
| GET | `/api/v1/articles/:slug` | Récupérer un article |
| PUT | `/api/v1/articles/:slug` | Mettre à jour un article |
| DELETE | `/api/v1/articles/:slug` | Supprimer un article |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | Liste des catégories |
| POST | `/api/v1/categories` | Créer une catégorie |
| PUT | `/api/v1/categories/:id` | Mettre à jour une catégorie |
| DELETE | `/api/v1/categories/:id` | Supprimer une catégorie |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Recherche d'articles |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics` | Statistiques du serveur |

---

## Flow de Synchronisation des Serveurs

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Bot       │────▶│   API       │────▶│  Database   │
│  (startup)  │     │  /servers   │     │  (servers)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       └── Pour chaque serveur où le bot est présent
           → POST /api/v1/servers { id, name }

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │────▶│  Discord    │────▶│  Dashboard  │
│  (login)    │     │  API        │     │  /api/srv   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   └── Cross-ref avec DB
       │                   └── Guilds de l'user    (bot installé?)
       └── Access token
```

# API Backend - Documentation

Documentation technique de l'API Express WikiBot.

## Table des matières

- [Architecture](#architecture)
- [Authentification](#authentification)
- [Roles et Permissions](#roles-et-permissions)
- [Audit Logs](#audit-logs)
- [Endpoints](#endpoints)
- [Services](#services)
- [Configuration](#configuration)

---

## Architecture

### Structure des fichiers

```
apps/api/src/
├── index.ts              # Point d'entrée Express
├── middleware/
│   ├── auth.ts           # JWT validation + bot auth
│   └── errorHandler.ts   # Error handling centralisé
├── routes/
│   ├── articles.ts       # CRUD articles
│   ├── categories.ts     # CRUD catégories + reorder
│   ├── settings.ts       # Configuration serveur
│   ├── members.ts        # Gestion des membres
│   ├── auditLogs.ts      # Consultation audit logs
│   ├── contact.ts        # Formulaire de contact
│   ├── analytics.ts      # Statistiques
│   ├── search.ts         # Recherche fulltext
│   └── stripe.ts         # Webhooks Stripe
├── services/
│   ├── articleService.ts    # Logique articles
│   ├── categoryService.ts   # Logique catégories
│   ├── memberService.ts     # Gestion rôles/membres
│   ├── auditLogService.ts   # Logging des actions
│   └── uploadService.ts     # S3/R2 uploads
└── utils/
    └── helpers.ts
```

### Flux d'authentification

```
Request → CORS → Rate Limit → Auth Middleware → Route Handler → Response
                                    ↓
                         JWT Verify (jose)
                         ou Bot Token Check
```

---

## Authentification

### JWT NextAuth (Utilisateurs)

L'API valide les tokens JWT émis par NextAuth.

```typescript
// middleware/auth.ts
import { jwtVerify, decodeJwt } from 'jose';

async function verifyNextAuthToken(token: string): Promise<JWTUser | null> {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'],
  });

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    image: payload.picture,
  };
}
```

### Bot Token (Discord Bot)

Le bot s'authentifie via un header dédié:

```typescript
// Vérification du bot token
if (botToken && botToken === process.env.BOT_API_SECRET) {
  req.isBot = true;
  return next();
}
```

### Headers requis

| Header | Description | Exemple |
|--------|-------------|---------|
| `Authorization` | Token JWT Bearer | `Bearer eyJhbG...` |
| `X-Server-Id` | ID du serveur Discord | `123456789012345678` |
| `X-Bot-Token` | Token pour auth bot | `secret-bot-token` |

---

## Roles et Permissions

### Modèle ServerMember

```prisma
model ServerMember {
  id        String   @id @default(cuid())
  serverId  String
  userId    String
  role      String   @default("viewer")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  server Server @relation(fields: [serverId], references: [id])
  user   User   @relation(fields: [userId], references: [id])

  @@unique([serverId, userId])
}
```

### Hiérarchie des rôles

| Rôle | Niveau | Permissions |
|------|--------|-------------|
| `owner` | 4 | Toutes les actions + transfert propriété |
| `admin` | 3 | Gérer membres, paramètres, catégories |
| `editor` | 2 | Créer/modifier articles, réordonner catégories |
| `viewer` | 1 | Lecture seule |

### Service de vérification

```typescript
// services/memberService.ts

// Vérifier si l'utilisateur a au moins un certain rôle
export async function hasRole(
  serverId: string,
  userId: string,
  requiredRole: 'viewer' | 'editor' | 'admin' | 'owner'
): Promise<boolean> {
  const member = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId } },
  });

  if (!member) return false;

  const roleHierarchy = { viewer: 1, editor: 2, admin: 3, owner: 4 };
  return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
}
```

---

## Audit Logs

### Modèle AuditLog

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  serverId   String
  actorId    String
  action     String   // article_create, category_update, etc.
  entityType String   // article, category, settings, member
  entityId   String?
  details    String?  @db.Text
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  server Server @relation(fields: [serverId], references: [id])
  actor  User   @relation(fields: [actorId], references: [id])
}
```

### Actions trackées

| Action | EntityType | Description |
|--------|------------|-------------|
| `article_create` | article | Création d'article |
| `article_update` | article | Modification d'article |
| `article_delete` | article | Suppression d'article |
| `category_create` | category | Création de catégorie |
| `category_update` | category | Modification de catégorie |
| `category_delete` | category | Suppression de catégorie |
| `category_reorder` | category | Réorganisation des catégories |
| `settings_update` | settings | Modification paramètres |
| `member_add` | member | Ajout d'un membre |
| `member_update` | member | Changement de rôle |
| `member_remove` | member | Retrait d'un membre |
| `ownership_transfer` | member | Transfert de propriété |

### Utilisation

```typescript
import * as auditLogService from '../services/auditLogService';

// Logger une action
await auditLogService.logArticleAction(
  serverId,
  userId,
  'article_create',
  article.id,
  { title: article.title, slug: article.slug },
  { ip: req.ip, userAgent: req.headers['user-agent'] }
);
```

---

## Endpoints

### Articles

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/articles` | Liste des articles | Oui |
| GET | `/api/v1/articles/:slug` | Détail d'un article | Oui |
| POST | `/api/v1/articles` | Créer un article | User |
| PUT | `/api/v1/articles/:slug` | Modifier un article | User |
| DELETE | `/api/v1/articles/:slug` | Supprimer un article | Oui |
| POST | `/api/v1/articles/:slug/view` | Incrémenter les vues | Oui |
| POST | `/api/v1/articles/:slug/vote` | Voter helpful/not | Oui |

### Categories

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/categories` | Liste des catégories | Oui |
| POST | `/api/v1/categories` | Créer une catégorie | Oui |
| PUT | `/api/v1/categories/:slug` | Modifier une catégorie | Oui |
| DELETE | `/api/v1/categories/:slug` | Supprimer une catégorie | Oui |
| PUT | `/api/v1/categories/reorder` | Réordonner les catégories | Editor+ |

### Members

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/members` | Liste des membres | Viewer+ |
| GET | `/api/v1/members/me` | Rôle de l'utilisateur actuel | User |
| GET | `/api/v1/members/:userId` | Détail d'un membre | Viewer+ |
| POST | `/api/v1/members` | Ajouter un membre | Admin+ |
| PUT | `/api/v1/members/:userId/role` | Modifier le rôle | Admin+ |
| DELETE | `/api/v1/members/:userId` | Retirer un membre | Admin+ |
| POST | `/api/v1/members/transfer-ownership` | Transférer la propriété | Owner |

**Dashboard**: Page `/dashboard/members` disponible pour gérer les membres visuellement.

### Audit Logs

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/audit-logs` | Liste des logs | Admin+ |
| GET | `/api/v1/audit-logs/:logId` | Détail d'un log | Admin+ |

**Query params**:
- `limit` (défaut: 50)
- `offset` (défaut: 0)
- `entityType`: article, category, settings, member
- `action`: nom de l'action
- `actorId`: ID de l'utilisateur
- `startDate`, `endDate`: filtres de date

**Dashboard**: Page `/dashboard/audit-logs` disponible pour consulter les logs visuellement avec filtres et pagination.

### Contact

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/v1/contact` | Soumettre formulaire | Optionnel |
| GET | `/api/v1/contact/categories` | Liste des catégories | Non |

**Rate limiting**: 3 soumissions/heure par IP ou userId.

### Settings

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/settings` | Paramètres du serveur | Oui |
| PUT | `/api/v1/settings` | Modifier paramètres | Admin+ |
| POST | `/api/v1/settings/logo-upload` | URL presignée upload | Admin+ |

---

## Services

### uploadService

Service de gestion des uploads vers S3/Cloudflare R2.

```typescript
// services/uploadService.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Générer une URL presignée pour upload direct
export async function generateUploadUrl(
  key: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl };
}
```

### memberService

Gestion des membres et vérification des permissions.

```typescript
// services/memberService.ts

// Fonctions disponibles
export async function getServerMembers(serverId: string);
export async function getUserRole(serverId: string, userId: string);
export async function hasRole(serverId: string, userId: string, role: string);
export async function addServerMember(serverId: string, userId: string, role: string);
export async function updateMemberRole(serverId: string, userId: string, newRole: string);
export async function removeServerMember(serverId: string, userId: string);
export async function transferOwnership(serverId: string, currentOwnerId: string, newOwnerId: string);
```

### auditLogService

Logging centralisé des actions.

```typescript
// services/auditLogService.ts

// Helpers spécialisés
export async function logArticleAction(serverId, actorId, action, articleId, details, request);
export async function logCategoryAction(serverId, actorId, action, categoryId, details, request);
export async function logMemberAction(serverId, actorId, action, memberId, details, request);
export async function logSettingsChange(serverId, actorId, changes, request);
```

---

## Configuration

### Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `PORT` | Non | Port du serveur (défaut: 4000) |
| `DATABASE_URL` | Oui | URL PostgreSQL |
| `NEXTAUTH_SECRET` | Oui | Secret pour vérification JWT |
| `BOT_API_SECRET` | Non | Token auth bot |
| `S3_ENDPOINT` | Non | Endpoint S3/R2 |
| `S3_REGION` | Non | Région S3 |
| `S3_BUCKET` | Non | Nom du bucket |
| `S3_ACCESS_KEY_ID` | Non | Access key S3 |
| `S3_SECRET_ACCESS_KEY` | Non | Secret key S3 |
| `S3_PUBLIC_URL` | Non | URL publique des fichiers |
| `STRIPE_SECRET_KEY` | Non | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Non | Secret webhook Stripe |

### Exemple .env

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/wikibot"

# Auth
NEXTAUTH_SECRET="your-nextauth-secret"
BOT_API_SECRET="your-bot-secret"

# S3/R2 Storage
S3_ENDPOINT="https://xxx.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="wikibot-uploads"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_PUBLIC_URL="https://cdn.wikibot.app"

# Stripe
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

---

## Changelog

### v0.5.0 (2026-01-30)

- **Dashboard Integration**:
  - Page Members frontend connectée aux endpoints `/api/v1/members`
  - Page Audit Logs frontend connectée aux endpoints `/api/v1/audit-logs`
  - Documentation des endpoints mise à jour avec références au dashboard

- **Members API**:
  - Nouvel endpoint `GET /api/v1/members/me` pour récupérer le rôle de l'utilisateur actuel
  - Clarification des permissions par endpoint

### v0.4.0 (2025-01-30)

- **Authentification JWT**:
  - Implémentation validation JWT avec `jose`
  - Extraction sécurisée des claims utilisateur
  - Support mode dev sans vérification signature

- **Système de rôles**:
  - Nouveau modèle `ServerMember` avec hiérarchie de rôles
  - Service `memberService` pour gestion des permissions
  - Endpoints CRUD `/api/v1/members`

- **Audit Logs**:
  - Nouveau modèle `AuditLog`
  - Service `auditLogService` avec helpers spécialisés
  - Endpoint admin `/api/v1/audit-logs`

- **Upload S3/R2**:
  - Service `uploadService` avec presigned URLs
  - Endpoint `/api/v1/settings/logo-upload`

- **Contact Form**:
  - Endpoint `/api/v1/contact` avec rate limiting
  - Validation Zod complète

- **Category Reordering**:
  - Endpoint `PUT /api/v1/categories/reorder`
  - Mise à jour transactionnelle des positions

### v0.3.0 (2025-01-29)

- CRUD articles et catégories
- Analytics et statistiques
- Recherche fulltext
- Intégration Stripe

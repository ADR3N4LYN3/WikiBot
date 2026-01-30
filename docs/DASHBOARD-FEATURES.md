# Dashboard Features

Documentation des fonctionnalités du dashboard WikiBot.

## Table des matières

- [Quick Actions Bar](#quick-actions-bar)
- [Page Modules](#page-modules)
- [Page Members](#page-members)
- [Page Audit Logs](#page-audit-logs)
- [Command Palette](#command-palette)
- [Onboarding Wizard](#onboarding-wizard)
- [Category Drag & Drop](#category-drag--drop)
- [Article Import](#article-import)
- [Contact Form](#contact-form)
- [Composants UI](#composants-ui)
- [API Publique](#api-publique)
- [API Client](#api-client)
- [Design System](#design-system)

---

## Quick Actions Bar

**Localisation**: `/dashboard` (Overview)

La barre d'actions rapides permet un accès instantané aux tâches courantes.

### Boutons disponibles

| Action | Description | Navigation |
|--------|-------------|------------|
| **New Article** | Créer un nouvel article | `/dashboard/articles/new` |
| **New Category** | Créer une nouvelle catégorie | Modal |
| **Quick Search** | Rechercher des articles | Command Palette |
| **Settings** | Configurer le wiki | `/dashboard/settings` |

### Composant

```tsx
import { QuickActions } from '@/components/QuickActions';

<QuickActions
  onNewCategory={() => setShowModal(true)}
  onSearch={() => openCommandPalette()}
/>
```

---

## Page Modules

**Localisation**: `/dashboard/modules`

Page de configuration des modules du bot.

### Modules disponibles

| Module | Description | Type |
|--------|-------------|------|
| **Wiki Articles** | Gestion des articles | Core (toujours ON) |
| **AI-Powered Search** | Recherche sémantique + RAG | Premium |
| **Analytics** | Statistiques d'utilisation | Free |
| **Public Web View** | Wiki accessible publiquement | Free |
| **Search Logging** | Logs des recherches | Free |
| **Content Moderation** | Filtrage automatique | Premium |
| **Fast Indexing** | Indexation prioritaire | Premium |

### Composant ModuleCard

```tsx
import { ModuleCard } from '@/components/ModuleCard';

<ModuleCard
  id="ai-search"
  name="AI-Powered Search"
  description="Semantic search with RAG"
  icon={Sparkles}
  enabled={true}
  isPremium={true}
  status="Active"
  onToggle={(id, enabled) => updateModule(id, enabled)}
/>
```

---

## Page Members

**Localisation**: `/dashboard/members`

Page de gestion des membres du serveur avec contrôle des rôles et permissions.

### Fonctionnalités

| Fonctionnalité | Description | Permission requise |
|----------------|-------------|-------------------|
| **Liste des membres** | Affichage avec avatars Discord et rôles | Viewer+ |
| **Ajouter un membre** | Ajout par Discord User ID | Admin+ |
| **Modifier le rôle** | Changer le rôle d'un membre | Admin+ (Owner pour admin) |
| **Supprimer un membre** | Retirer un membre du serveur | Admin+ |
| **Transfert de propriété** | Transférer ownership à un admin | Owner uniquement |

### Hiérarchie des rôles

| Rôle | Icône | Couleur | Permissions |
|------|-------|---------|-------------|
| **Owner** | Crown | Jaune | Toutes les actions + transfert |
| **Admin** | Shield | Rouge | Gérer membres, paramètres, catégories |
| **Editor** | UserCog | Bleu | Créer/modifier articles |
| **Viewer** | Eye | Gris | Lecture seule |

### Composant

```tsx
// Page principale
import { membersApi } from '@/lib/api';
import useSWR from 'swr';

const { data: members, mutate } = useSWR('members', () =>
  membersApi.getAll().then((res) => res.data)
);

// Ajouter un membre
await membersApi.add({
  userId: '123456789012345678',
  role: 'editor',
});

// Changer le rôle
await membersApi.updateRole(userId, 'admin');

// Transférer la propriété
await membersApi.transferOwnership(newOwnerId);
```

### API Endpoints utilisés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/members` | Liste des membres |
| GET | `/api/v1/members/me` | Rôle de l'utilisateur actuel |
| POST | `/api/v1/members` | Ajouter un membre |
| PUT | `/api/v1/members/:userId/role` | Modifier le rôle |
| DELETE | `/api/v1/members/:userId` | Supprimer un membre |
| POST | `/api/v1/members/transfer-ownership` | Transférer ownership |

---

## Page Audit Logs

**Localisation**: `/dashboard/audit-logs`

Page de consultation des logs d'audit pour tracer toutes les actions effectuées sur le serveur.

### Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Liste paginée** | Affichage des 50 derniers logs avec pagination |
| **Filtrage par type** | Articles, Catégories, Settings, Members |
| **Détails expandables** | JSON des changements (old/new values) |
| **Refresh manuel** | Bouton pour rafraîchir les données |

### Types d'entités

| Type | Icône | Couleur | Exemple d'actions |
|------|-------|---------|-------------------|
| **Article** | FileText | Bleu | create, update, delete |
| **Category** | FolderOpen | Vert | create, update, delete, reorder |
| **Settings** | Settings | Violet | settings_change |
| **Member** | Users | Orange | member_add, member_remove, role_change |

### Composant

```tsx
import { auditLogsApi } from '@/lib/api';
import useSWR from 'swr';

// Récupérer les logs avec filtres
const { data } = useSWR(['audit-logs', entityType, limit, offset], () =>
  auditLogsApi.getAll({
    limit: 50,
    offset: 0,
    entityType: 'article', // optionnel
  }).then((res) => res.data)
);

// Structure de la réponse
interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}
```

### Structure d'un log

```typescript
interface AuditLog {
  id: string;
  serverId: string;
  actorId: string;
  action: string;         // create, update, delete, etc.
  entityType: string;     // article, category, settings, member
  entityId?: string;
  details?: string;       // JSON avec old/new values
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
}
```

### API Endpoints utilisés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/audit-logs` | Liste paginée avec filtres |
| GET | `/api/v1/audit-logs/:logId` | Détail d'un log |

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `limit` | number | Nombre de résultats (défaut: 50) |
| `offset` | number | Décalage pour pagination |
| `entityType` | string | Filtrer par type d'entité |
| `action` | string | Filtrer par action |
| `actorId` | string | Filtrer par utilisateur |
| `startDate` | string | Date de début (ISO) |
| `endDate` | string | Date de fin (ISO) |

---

## Command Palette

**Raccourci**: `Ctrl+K` (ou `Cmd+K` sur Mac)

Palette de commandes pour navigation et recherche rapide, inspirée de Notion/Linear.

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+K` | Ouvrir la palette |
| `Ctrl+N` | Nouvel article |
| `Ctrl+,` | Paramètres |
| `/` | Ouvrir recherche |
| `↑↓` | Naviguer |
| `Enter` | Sélectionner |
| `Escape` | Fermer |

### Sections de commandes

1. **Quick Actions** - Actions rapides (New Article, New Category, etc.)
2. **Navigation** - Liens vers les pages (Overview, Articles, Analytics, etc.)
3. **Help** - Documentation et support

### Utilisation

```tsx
// Dans un composant
import { useCommandPalette } from '@/hooks/useCommandPalette';

function MyComponent() {
  const { open, close, toggle, isOpen } = useCommandPalette();

  return (
    <button onClick={open}>Open Command Palette</button>
  );
}
```

### Architecture

```
hooks/useCommandPalette.ts    # Context + hook
lib/commands.ts               # Configuration des commandes
components/CommandPalette.tsx # Composant UI
components/DashboardShell.tsx # Wrapper avec keyboard listener
```

---

## Onboarding Wizard

**Déclencheur**: Première visite du dashboard avec 0 articles

Guide étape par étape pour les nouveaux utilisateurs.

### Étapes

1. **Welcome** - Introduction à WikiBot
2. **Create Category** - Créer la première catégorie
3. **Create Article** - Créer le premier article (optionnel, skip possible)
4. **Complete** - Confirmation et accès au dashboard

### Persistance

L'onboarding est marqué comme complété via `localStorage`:

```ts
const ONBOARDING_KEY = 'wikibot-onboarding-completed';

// Marquer comme complété
localStorage.setItem(ONBOARDING_KEY, 'true');

// Vérifier si complété
const completed = localStorage.getItem(ONBOARDING_KEY);
```

### Architecture des fichiers

```
components/onboarding/
├── OnboardingWizard.tsx       # Composant principal
├── index.ts                   # Export
└── steps/
    ├── WelcomeStep.tsx        # Étape 1
    ├── CategoryStep.tsx       # Étape 2
    ├── ArticleStep.tsx        # Étape 3
    └── CompleteStep.tsx       # Étape 4
```

### Utilisation

```tsx
import { OnboardingWizard } from '@/components/onboarding';

{showOnboarding && (
  <OnboardingWizard
    onComplete={() => {
      localStorage.setItem('wikibot-onboarding-completed', 'true');
      setShowOnboarding(false);
      mutate(); // Refresh data
    }}
    onSkip={() => {
      localStorage.setItem('wikibot-onboarding-completed', 'true');
      setShowOnboarding(false);
    }}
  />
)}
```

---

## Category Drag & Drop

**Localisation**: `/dashboard/categories`

Réorganisation des catégories par glisser-déposer avec mise à jour temps réel.

### Fonctionnalités

- Drag & drop intuitif avec `@dnd-kit/core` et `@dnd-kit/sortable`
- Mise à jour optimiste de l'UI pendant la sauvegarde
- Rollback automatique en cas d'erreur
- Indicateur visuel de sauvegarde en cours

### Implémentation technique

```tsx
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Composant SortableCategory avec useSortable hook
function SortableCategory({ category, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  // ...
}
```

### API Backend

```
PUT /api/v1/categories/reorder
Body: { categoryIds: string[] }
```

- Vérifie les permissions (rôle `editor` minimum)
- Mise à jour transactionnelle des positions
- Log d'audit automatique

---

## Article Import

**Localisation**: `/dashboard/settings` > "Import Articles"

Importation en masse d'articles depuis un fichier JSON.

### Format JSON attendu

```json
[
  {
    "title": "Mon Article",
    "content": "Contenu en **Markdown**...",
    "slug": "mon-article",
    "categorySlug": "getting-started",
    "published": true
  }
]
```

### Fonctionnalités

- Validation côté client avec preview du nombre d'articles
- Mapping automatique des catégories par slug
- Feedback en temps réel (succès/échecs par article)
- Gestion des doublons (slug déjà existant)

### Interface

```tsx
// Modal d'import avec file input
const handleImport = async () => {
  const file = /* ... */;
  const text = await file.text();
  const articles = JSON.parse(text);

  // Validation
  if (!Array.isArray(articles)) {
    throw new Error('Format invalide');
  }

  // Import via API
  for (const article of articles) {
    await articlesApi.create(article);
  }
};
```

---

## Contact Form

**Localisation**: `/contact`

Formulaire de contact fonctionnel avec validation et rate limiting.

### Champs

| Champ | Type | Validation |
|-------|------|------------|
| `name` | text | 2-100 caractères |
| `email` | email | Format email valide |
| `subject` | text | 5-200 caractères |
| `message` | textarea | 20-5000 caractères |
| `category` | select | general, support, billing, partnership, other |

### Fonctionnalités

- Validation en temps réel avec messages d'erreur
- Chargement des catégories depuis l'API
- Rate limiting (3 soumissions/heure)
- Confirmation avec numéro de ticket

### Architecture

```tsx
// Client component avec form state
'use client';

const handleSubmit = async (e: FormEvent) => {
  const response = await fetch('/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message, category }),
  });

  if (response.ok) {
    const data = await response.json();
    // data.ticketId = "WB-XXXXXXX"
  }
};
```

---

## Composants UI

### Skeleton Loaders

**Localisation**: `components/ui/Skeleton.tsx`

Composants de chargement pour améliorer le perceived performance.

```tsx
import { Skeleton, SkeletonArticleRow, SkeletonTable } from '@/components/ui/Skeleton';

// Skeleton générique
<Skeleton className="h-4 w-32" />

// Table d'articles avec skeleton
<SkeletonTable rows={5} />
```

### Empty States

**Localisation**: `components/ui/EmptyState.tsx`

États vides illustrés avec call-to-action.

| Composant | Usage |
|-----------|-------|
| `EmptyArticles` | Liste d'articles vide |
| `EmptyCategories` | Aucune catégorie |
| `EmptySearchResults` | Recherche sans résultats |
| `EmptyAnalytics` | Pas encore de données |

```tsx
import { EmptyArticles } from '@/components/ui/EmptyState';

{articles.length === 0 && <EmptyArticles />}
```

### Confirm Dialog

**Localisation**: `components/ui/ConfirmDialog.tsx`

Modal de confirmation avec hook pour gestion d'état.

```tsx
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/ConfirmDialog';

function MyComponent() {
  const { isOpen, isLoading, open, close, confirm } = useConfirmDialog({
    onConfirm: async () => {
      await deleteItem();
    },
  });

  return (
    <>
      <button onClick={open}>Delete</button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={close}
        onConfirm={confirm}
        isLoading={isLoading}
        title="Delete Item"
        description="Are you sure?"
        variant="danger"
      />
    </>
  );
}
```

### Pagination

**Localisation**: `components/ui/Pagination.tsx`

Composant de pagination avec info sur les résultats.

```tsx
import { Pagination, PaginationInfo } from '@/components/ui/Pagination';

<PaginationInfo
  currentPage={page}
  totalPages={totalPages}
  totalItems={total}
  itemsPerPage={limit}
/>

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### Breadcrumbs

**Localisation**: `components/ui/Breadcrumbs.tsx`

Navigation fil d'Ariane.

```tsx
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

<Breadcrumbs
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Articles', href: '/dashboard/articles' },
    { label: 'Edit Article' },
  ]}
/>
```

---

## API Publique

### GET /api/public/stats

Endpoint public (sans authentification) pour les statistiques de la landing page.

**Response**:
```json
{
  "servers": 156,
  "articles": 4523,
  "searches": 12450
}
```

**Utilisation**:
```tsx
const { data } = useSWR('/api/public/stats', fetcher);
```

---

## API Client

**Localisation**: `lib/api.ts`

Le client API centralise toutes les requêtes vers le backend.

### Configuration

```ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Authentification automatique

L'intercepteur de requêtes ajoute automatiquement :

1. **X-Server-Id** : ID du serveur Discord sélectionné (depuis localStorage)
2. **Authorization** : Token Bearer de la session NextAuth

```ts
api.interceptors.request.use(async (config) => {
  // Server ID
  const serverId = localStorage.getItem('selectedServerId');
  if (serverId) {
    config.headers['X-Server-Id'] = serverId;
  }

  // Auth token
  const session = await getSession();
  if (session?.accessToken) {
    config.headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  return config;
});
```

### Services disponibles

| Service | Endpoints | Description |
|---------|-----------|-------------|
| `articlesApi` | GET, POST, PUT, DELETE `/api/v1/articles` | Gestion des articles |
| `categoriesApi` | GET, POST, PUT, DELETE `/api/v1/categories` | Gestion des catégories |
| `membersApi` | GET, POST, PUT, DELETE `/api/v1/members` | Gestion des membres |
| `auditLogsApi` | GET `/api/v1/audit-logs` | Consultation des logs d'audit |
| `analyticsApi` | GET `/api/v1/analytics/*` | Statistiques |
| `searchApi` | GET `/api/v1/search` | Recherche |
| `settingsApi` | GET, PUT `/api/v1/settings` | Configuration |
| `subscriptionsApi` | GET, POST `/api/v1/subscriptions/*` | Abonnements |
| `exportApi` | GET, POST `/api/v1/export/*` | Import/Export |

### Exemple d'utilisation

```tsx
import { categoriesApi } from '@/lib/api';

// Dans un composant avec useSWR
const { data: categories, mutate } = useSWR('categories', () =>
  categoriesApi.getAll().then((res) => res.data)
);

// Créer une catégorie
await categoriesApi.create({
  name: 'Getting Started',
  slug: 'getting-started',
  emoji: '🚀',
});
mutate(); // Refresh data
```

---

## Design System

Les composants utilisent le design system glassmorphic du projet:

- **GlassCard** - Cartes avec effet de verre
- **GradientText** - Texte avec dégradé animé
- **GradientButton** - Boutons avec dégradé
- **Badge** - Badges (default, success, warning, error, premium)
- **AnimatedCounter** - Compteurs animés

### Couleurs principales

```css
--primary: 250 90% 65%    /* Violet */
--secondary: 200 80% 55%  /* Bleu */
--accent: 280 85% 65%     /* Magenta */
```

---

## Changelog

### v0.5.0 (2026-01-30)

- **Page Members** (`/dashboard/members`):
  - Liste des membres avec avatars Discord et badges de rôles colorés
  - Ajout de membre par Discord User ID
  - Modification des rôles (Owner/Admin/Editor/Viewer)
  - Suppression de membres
  - Transfert de propriété du serveur
  - Vérification des permissions en temps réel

- **Page Audit Logs** (`/dashboard/audit-logs`):
  - Liste paginée des logs d'audit (50 par page)
  - Filtrage par type d'entité (Article, Category, Settings, Member)
  - Détails JSON expandables pour voir les changements
  - Refresh manuel des données
  - Icônes et couleurs distinctes par type d'action

- **API Client**:
  - Nouveau service `membersApi` avec 7 méthodes (getAll, getMe, getById, add, updateRole, remove, transferOwnership)
  - Nouveau service `auditLogsApi` avec 2 méthodes (getAll, getById)

- **Navigation**:
  - Ajout des liens "Members" et "Audit Logs" dans la sidebar

### v0.4.0 (2025-01-30)

- **Category Drag & Drop**:
  - Réorganisation des catégories par glisser-déposer avec `@dnd-kit`
  - Mise à jour optimiste + rollback automatique en cas d'erreur
  - Indicateur de sauvegarde en cours

- **Article Import**:
  - Modal d'import JSON fonctionnel dans les paramètres
  - Validation et preview avant import
  - Gestion des erreurs par article

- **Contact Form**:
  - Formulaire entièrement fonctionnel
  - Validation côté client et serveur
  - Catégories de contact dynamiques
  - Numéro de ticket après soumission

- **Settings Page**:
  - Support upload logo (S3/R2 presigned URLs)
  - Section export/import opérationnelle

### v0.3.0 (2025-01-29)

- **Composants UI**:
  - `Skeleton` - Loaders squelettes pour chargement (`SkeletonArticleRow`, `SkeletonTable`)
  - `EmptyState` - États vides illustrés (`EmptyArticles`, `EmptyCategories`, `EmptySearchResults`)
  - `ConfirmDialog` - Modals de confirmation avec hook `useConfirmDialog`
  - `Breadcrumbs` - Navigation fil d'Ariane
  - `Pagination` - Composant pagination réutilisable
- **Page Articles**:
  - Pagination côté serveur avec `page` et `limit` params
  - Skeletons pendant le chargement des données
  - Dialogs de confirmation avant suppression
- **Landing Page**:
  - Section `Testimonials` avec avis utilisateurs animés
  - Animations Framer Motion améliorées sur le hero
- **API Client**:
  - Support pagination (`articlesApi.getAll({ page, limit })`)
  - Authentification JWT automatique via NextAuth session

### v0.2.1 (2025-01-29)

- Fix responsive mobile sur toutes les pages dashboard
- Fix authentification API (ajout header Authorization Bearer)
- Documentation API client

### v0.2.0 (2025-01-28)

- Ajout de la Quick Actions Bar
- Ajout de la page Modules avec toggles
- Ajout du Command Palette (Ctrl+K)
- Ajout de l'Onboarding Wizard
- Stats dynamiques sur la landing page
- Nouveau endpoint API public /api/public/stats

# Dashboard Features

Documentation des fonctionnalités du dashboard WikiBot.

## Table des matières

- [Quick Actions Bar](#quick-actions-bar)
- [Page Modules](#page-modules)
- [Command Palette](#command-palette)
- [Onboarding Wizard](#onboarding-wizard)

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

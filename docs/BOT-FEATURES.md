# Bot Discord - Documentation

Documentation technique du bot Discord WikiBot.

## Table des matières

- [Architecture](#architecture)
- [Commandes Slash](#commandes-slash)
- [Système de permissions](#système-de-permissions)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Configuration](#configuration)

---

## Architecture

### Structure des fichiers

```
apps/bot/src/
├── index.ts              # Point d'entrée, connexion Discord
├── types.ts              # Types TypeScript
├── commands/             # Commandes slash
│   ├── wiki-search.ts    # Recherche d'articles
│   ├── wiki-view.ts      # Affichage d'article
│   ├── wiki-create.ts    # Création d'article
│   ├── wiki-list.ts      # Liste des articles
│   ├── wiki-category.ts  # Gestion des catégories
│   ├── wiki-stats.ts     # Statistiques du serveur
│   └── wiki-help.ts      # Aide
├── events/               # Gestionnaires d'événements
│   ├── ready.ts          # Startup, sync serveurs
│   ├── interactionCreate.ts  # Commandes + boutons + autocomplete
│   ├── guildCreate.ts    # Nouveau serveur
│   └── guildDelete.ts    # Serveur quitté (cleanup)
├── services/
│   └── apiClient.ts      # Client HTTP vers l'API
└── utils/
    ├── loadCommands.ts   # Chargement dynamique
    └── embeds.ts         # Utilities pour embeds Discord
```

### Flux de données

```
Discord User → Bot (discord.js)
                    ↓
              API Backend (Express)
                    ↓
            PostgreSQL + Pinecone
```

---

## Commandes Slash

| Commande | Description | Permission requise |
|----------|-------------|-------------------|
| `/wiki-search <query>` | Recherche dans la base de connaissances | Aucune |
| `/wiki-view <slug>` | Affiche un article complet | Aucune |
| `/wiki-list [category]` | Liste tous les articles | Aucune |
| `/wiki-create` | Crée un nouvel article (modal) | `Manage Messages` |
| `/wiki-category <action>` | Gère les catégories (create/list/delete) | `Manage Server` |
| `/wiki-stats` | Affiche les statistiques du serveur | Aucune |
| `/wiki-help` | Affiche l'aide et les liens | Aucune |

### wiki-search

Recherche fulltext avec affichage des 5 premiers résultats.

**Options**:
- `query` (requis): Terme de recherche (2-200 caractères)

**Réponse**: Embed avec résultats incluant titre, extrait, vues et votes.

### wiki-view

Affiche le contenu complet d'un article avec boutons de feedback.

**Options**:
- `slug` (requis): Identifiant URL de l'article

**Fonctionnalités**:
- Affichage du contenu (max 4000 caractères)
- Métadonnées: auteur, vues, votes, catégorie
- Boutons "Helpful" / "Not Helpful"
- Incrémentation automatique des vues

### wiki-list

Liste tous les articles du serveur avec pagination.

**Options**:
- `category` (optionnel): Filtrer par catégorie (autocomplete)

**Fonctionnalités**:
- Affichage de 10 articles par page
- Filtrage par catégorie avec autocomplete
- Boutons Previous/Next pour navigation
- Affichage des vues par article

### wiki-create

Ouvre un modal pour créer un article.

**Champs du modal**:
- Titre (3-200 caractères)
- Contenu Markdown (10-4000 caractères)
- Catégorie (optionnel)

**Timeout**: 5 minutes pour soumettre le modal.

### wiki-category

Gère les catégories du serveur (sous-commandes).

**Permission requise**: `MANAGE_GUILD`

**Sous-commandes**:

| Sous-commande | Description | Options |
|---------------|-------------|---------|
| `create` | Créer une catégorie | `name` (requis), `slug`, `description`, `emoji` |
| `list` | Lister les catégories | - |
| `delete` | Supprimer une catégorie | `slug` (requis, autocomplete) |

**Fonctionnalités**:
- Génération automatique du slug si non fourni
- Autocomplete sur delete pour faciliter la sélection
- Affichage du nombre d'articles par catégorie
- Les articles orphelins deviennent "non catégorisés"

### wiki-stats

Affiche les statistiques du serveur.

**Données affichées**:
- Nombre d'articles publiés
- Nombre de catégories
- Total des vues
- Nombre de recherches (30 derniers jours)

**Authentification**: Utilise le `BOT_API_SECRET` pour accéder à l'endpoint `/api/v1/stats/server/:serverId`.

---

## Système de permissions

### Permissions Discord requises

| Action | Permission Discord |
|--------|-------------------|
| Créer un article | `MANAGE_MESSAGES` |
| Gérer les catégories | `MANAGE_GUILD` |
| Rechercher | Aucune |
| Voir un article | Aucune |
| Lister les articles | Aucune |
| Voir les statistiques | Aucune |
| Voter (feedback) | Aucune |

### Authentification Bot → API

Le bot s'authentifie auprès de l'API via le header `X-Bot-Token`:

```ts
// services/apiClient.ts
apiClient.interceptors.request.use(config => {
  const botToken = process.env.BOT_API_SECRET;
  if (botToken) {
    config.headers['X-Bot-Token'] = botToken;
  }
  return config;
});
```

---

## Gestion des erreurs

### Pattern axios.isAxiosError

Toutes les erreurs HTTP sont gérées avec le pattern type-safe:

```ts
} catch (error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    // Accès sécurisé à error.response.status
    // et error.response.data
  }
}
```

### Codes d'erreur gérés

| Code | Signification | Message utilisateur |
|------|---------------|---------------------|
| 404 | Article non trouvé | "No article found with slug..." |
| 403 | Permission refusée | "You do not have permission..." |
| 409 | Conflit (doublon) | "An article with this title already exists" |
| 5xx | Erreur serveur | "An error occurred..." |

---

## Configuration

### Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `DISCORD_BOT_TOKEN` | Oui | Token du bot Discord |
| `DISCORD_CLIENT_ID` | Oui | ID de l'application Discord |
| `API_URL` | Non | URL de l'API (défaut: http://localhost:4000) |
| `BOT_API_SECRET` | Non | Secret pour auth bot → API |
| `DASHBOARD_URL` | Non | URL du dashboard (pour liens) |
| `SUPPORT_URL` | Non | URL du serveur de support |

### Validation au démarrage

```ts
// index.ts
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('DISCORD_BOT_TOKEN is not set');
  process.exit(1);
}

if (!process.env.BOT_API_SECRET) {
  console.warn('BOT_API_SECRET not set, API requests will be unauthenticated');
}
```

---

## Fonctionnalités avancées

### Autocomplete

Plusieurs commandes supportent l'autocomplete Discord pour faciliter la saisie:

| Commande | Option | Source des suggestions |
|----------|--------|------------------------|
| `/wiki-view` | `slug` | Articles du serveur |
| `/wiki-list` | `category` | Catégories du serveur |
| `/wiki-category delete` | `slug` | Catégories du serveur |

**Implémentation**:

```ts
// types.ts
interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
```

**Cache**: Les suggestions sont mises en cache pendant 60 secondes pour optimiser les performances.

### Auto-reconnexion

Le bot gère les déconnexions avec backoff exponentiel:

- Max 10 tentatives
- Délai initial: 5 secondes
- Délai max: 5 minutes
- Reset du compteur après connexion réussie

### Synchronisation des serveurs

Au démarrage, le bot synchronise tous les serveurs en parallèle:

```ts
const results = await Promise.allSettled(
  guilds.map(guild => apiClient.post('/api/v1/servers', { id, name }))
);
```

### Statut rotatif

Le bot affiche un statut qui change toutes les 30 secondes:

- `/wiki-help`
- `/wiki-search your questions`
- `{servers} servers`
- `{articles} articles`
- `your knowledge base`

---

## Changelog

### v0.3.0 (2025-01-29)

- **Nouvelles commandes**:
  - `/wiki-list` - Liste des articles avec pagination et filtrage par catégorie
  - `/wiki-category` - Gestion complète des catégories (create/list/delete)
  - `/wiki-stats` - Statistiques du serveur (articles, vues, recherches)
- **Autocomplete**: Support sur `/wiki-view`, `/wiki-list` et `/wiki-category delete`
- **Pagination**: Boutons Previous/Next sur `/wiki-search` et `/wiki-list`
- **Event guildDelete**: Nettoyage automatique quand le bot quitte un serveur
- **Utilities**: Nouveau module `utils/embeds.ts` pour embeds standardisés
- **Documentation**: Mise à jour de `/wiki-help` avec toutes les commandes

### v0.2.0 (2025-01-29)

- Ajout de la vérification de permission `MANAGE_MESSAGES` pour `/wiki-create`
- Correction des noms de commandes dans les messages de statut (`/wiki-help`, `/wiki-search`)
- Optimisation de la synchronisation des serveurs avec `Promise.allSettled`
- Amélioration de la gestion d'erreurs avec `axios.isAxiosError()`
- Ajout du warning pour `BOT_API_SECRET` manquant

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
│   └── wiki-help.ts      # Aide
├── events/               # Gestionnaires d'événements
│   ├── ready.ts          # Startup, sync serveurs
│   ├── interactionCreate.ts  # Commandes + boutons
│   └── guildCreate.ts    # Nouveau serveur
├── services/
│   └── apiClient.ts      # Client HTTP vers l'API
└── utils/
    └── loadCommands.ts   # Chargement dynamique
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
| `/wiki-create` | Crée un nouvel article (modal) | `Manage Messages` |
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

### wiki-create

Ouvre un modal pour créer un article.

**Champs du modal**:
- Titre (3-200 caractères)
- Contenu Markdown (10-4000 caractères)
- Catégorie (optionnel)

**Timeout**: 5 minutes pour soumettre le modal.

---

## Système de permissions

### Permissions Discord requises

| Action | Permission Discord |
|--------|-------------------|
| Créer un article | `MANAGE_MESSAGES` |
| Rechercher | Aucune |
| Voir un article | Aucune |
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

### v0.2.0 (2025-01-29)

- Ajout de la vérification de permission `MANAGE_MESSAGES` pour `/wiki-create`
- Correction des noms de commandes dans les messages de statut (`/wiki-help`, `/wiki-search`)
- Optimisation de la synchronisation des serveurs avec `Promise.allSettled`
- Amélioration de la gestion d'erreurs avec `axios.isAxiosError()`
- Ajout du warning pour `BOT_API_SECRET` manquant

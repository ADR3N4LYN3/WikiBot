# Changelog

All notable changes to WikiBot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-28

### Added
- Discord bot with slash commands (`/wiki`, `/search`, `/ask`)
- Web dashboard for article and category management
- Full-text search with PostgreSQL
- AI-powered semantic search using OpenAI embeddings (premium)
- RAG-powered answers with GPT-4 (premium)
- Analytics dashboard with usage statistics
- Command Palette (`Ctrl+K`) for quick navigation
- Onboarding wizard for new users
- Modules page to enable/disable features
- Public wiki pages for web sharing
- Multi-server support
- Role-based permissions

### Technical
- Next.js 14 App Router with React 18
- Express API with TypeScript
- PostgreSQL database with Prisma ORM
- Pinecone vector database for embeddings
- Discord.js v14 for bot interactions
- NextAuth.js v5 for authentication

[Unreleased]: https://github.com/yourusername/wikibot/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/wikibot/releases/tag/v1.0.0

# Changelog

All notable changes to WikiBot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.0] - 2025-01-28

### Added
- **Quick Actions Bar** - Fast access buttons on dashboard overview (New Article, New Category, Search, Settings)
- **Modules Page** - Toggle switches to enable/disable features (`/dashboard/modules`)
- **Command Palette** - Press `Ctrl+K` for quick navigation and search
- **Onboarding Wizard** - 4-step guided setup for new users (Welcome, Create Category, Create Article, Complete)
- **Public Stats API** - New endpoint `GET /api/public/stats` for landing page statistics
- **Dynamic Landing Stats** - Real-time statistics from API on the Hero section

### Changed
- Dashboard layout now includes `DashboardShell` wrapper for global keyboard shortcuts
- Hero component fetches stats dynamically with SWR
- Sidebar navigation includes new "Modules" link

### Technical
- Added `CommandPaletteProvider` context for palette state management
- Added `useCommandPalette` hook
- Added `commands.ts` for command configuration
- Added `ModuleCard` component with toggle switch animation
- Added `QuickActions` component with GlassCard design

[Unreleased]: https://github.com/yourusername/wikibot/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/yourusername/wikibot/releases/tag/v2.2.0

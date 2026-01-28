# Changelog

All notable changes to WikiBot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.0] - 2025-01-28

### Added
- **Quick Actions Bar** - Fast access buttons on dashboard overview (New Article, New Category, Search, Settings)
- **Modules Page** - MEE6-style toggle switches to enable/disable features (`/dashboard/modules`)
- **Command Palette** - Press `Ctrl+K` for quick navigation and search (Notion/Linear style)
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

## [2.1.0] - 2024-01-15

### Added
- AI-powered search suggestions for better results
- Natural language search support

### Changed
- Faster article loading times

### Fixed
- Fixed category sorting on mobile

## [2.0.0] - 2024-01-01

### Added
- Brand new dashboard with glassmorphism design
- Dark/Light mode with system preference detection
- Enhanced analytics with 90-day history
- Public wiki pages for web sharing

### Changed
- Complete UI/UX overhaul
- Better mobile responsiveness

### Fixed
- Various performance improvements

## [1.5.0] - 2023-12-15

### Added
- Manage multiple Discord servers from one dashboard
- Server-specific article permissions

### Changed
- Improved search algorithm

## [1.4.0] - 2023-12-01

### Added
- Detailed analytics for article views
- Search query insights

### Changed
- Better category management

### Fixed
- Fixed duplicate article issue

## [1.0.0] - 2023-11-01

### Added
- Initial release
- Discord bot with slash commands
- Web dashboard for article management
- Full-text search
- Category organization
- Basic analytics

[Unreleased]: https://github.com/yourusername/wikibot/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/yourusername/wikibot/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/yourusername/wikibot/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/yourusername/wikibot/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/yourusername/wikibot/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/yourusername/wikibot/compare/v1.0.0...v1.4.0
[1.0.0]: https://github.com/yourusername/wikibot/releases/tag/v1.0.0

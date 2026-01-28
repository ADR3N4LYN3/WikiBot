import { Metadata } from 'next';
import { Sparkles, Bug, Zap, ArrowUp } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Changelog - WikiBot',
  description: 'See what\'s new in WikiBot. Latest updates and improvements.',
};

type ChangeType = 'feature' | 'improvement' | 'fix';

interface Change {
  type: ChangeType;
  description: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  changes: Change[];
}

const releases: Release[] = [
  {
    version: '2.1.0',
    date: '2024-01-15',
    title: 'AI-Powered Search',
    changes: [
      { type: 'feature', description: 'AI-powered search suggestions for better results' },
      { type: 'feature', description: 'Natural language search support' },
      { type: 'improvement', description: 'Faster article loading times' },
      { type: 'fix', description: 'Fixed category sorting on mobile' },
    ],
  },
  {
    version: '2.0.0',
    date: '2024-01-01',
    title: 'WikiBot 2.0 - Complete Redesign',
    changes: [
      { type: 'feature', description: 'Brand new dashboard with glassmorphism design' },
      { type: 'feature', description: 'Dark/Light mode with system preference detection' },
      { type: 'feature', description: 'Enhanced analytics with 90-day history' },
      { type: 'feature', description: 'Public wiki pages for web sharing' },
      { type: 'improvement', description: 'Complete UI/UX overhaul' },
      { type: 'improvement', description: 'Better mobile responsiveness' },
      { type: 'fix', description: 'Various performance improvements' },
    ],
  },
  {
    version: '1.5.0',
    date: '2023-12-15',
    title: 'Multi-Server Support',
    changes: [
      { type: 'feature', description: 'Manage multiple Discord servers from one dashboard' },
      { type: 'feature', description: 'Server-specific article permissions' },
      { type: 'improvement', description: 'Improved search algorithm' },
    ],
  },
  {
    version: '1.4.0',
    date: '2023-12-01',
    title: 'Analytics Dashboard',
    changes: [
      { type: 'feature', description: 'Detailed analytics for article views' },
      { type: 'feature', description: 'Search query insights' },
      { type: 'improvement', description: 'Better category management' },
      { type: 'fix', description: 'Fixed duplicate article issue' },
    ],
  },
];

function getChangeIcon(type: ChangeType) {
  switch (type) {
    case 'feature':
      return Sparkles;
    case 'improvement':
      return ArrowUp;
    case 'fix':
      return Bug;
  }
}

function getChangeColor(type: ChangeType) {
  switch (type) {
    case 'feature':
      return 'text-primary bg-primary/10';
    case 'improvement':
      return 'text-blue-500 bg-blue-500/10';
    case 'fix':
      return 'text-green-500 bg-green-500/10';
  }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="premium" glow className="mb-6">
              Latest: v{releases[0].version}
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <GradientText>Changelog</GradientText>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay up to date with all the latest features, improvements, and bug fixes.
            </p>
          </div>
        </section>

        {/* Releases */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {releases.map((release, index) => (
                <GlassCard key={release.version} className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl sm:text-2xl font-bold">
                          {release.title}
                        </h2>
                        {index === 0 && (
                          <Badge variant="premium">Latest</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Version {release.version} &middot;{' '}
                        {new Date(release.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {release.changes.map((change, changeIndex) => {
                      const Icon = getChangeIcon(change.type);
                      return (
                        <div
                          key={changeIndex}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={cn(
                              'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                              getChangeColor(change.type)
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {change.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Zap className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Never Miss an Update</h2>
            <p className="text-muted-foreground mb-6">
              Join our Discord to get notified about new releases.
            </p>
            <a
              href="https://discord.gg/wikibot"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-[#5865F2] text-white font-semibold',
                'hover:bg-[#4752C4] transition-colors'
              )}
            >
              Join Discord
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Search, Terminal, Settings, Zap, Shield, ArrowRight, FileText, MessageSquare } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Documentation - WikiBot',
  description: 'Learn how to use WikiBot to create and manage your Discord wiki.',
};

const quickLinks = [
  {
    icon: Zap,
    title: 'Quick Start',
    description: 'Get WikiBot running in your server in under 5 minutes',
    href: '/docs/quick-start',
  },
  {
    icon: Terminal,
    title: 'Commands',
    description: 'Complete list of all slash commands and how to use them',
    href: '/docs/commands',
  },
  {
    icon: Settings,
    title: 'Dashboard',
    description: 'Learn how to use the web dashboard to manage your wiki',
    href: '/docs/dashboard',
  },
  {
    icon: Shield,
    title: 'Permissions',
    description: 'Set up role-based permissions for your team',
    href: '/docs/permissions',
  },
];

const guides = [
  {
    title: 'Creating Your First Article',
    description: 'Step-by-step guide to creating and publishing articles',
    icon: FileText,
  },
  {
    title: 'Organizing with Categories',
    description: 'Learn how to structure your wiki with categories',
    icon: BookOpen,
  },
  {
    title: 'Using Search Effectively',
    description: 'Tips for making your content easy to find',
    icon: Search,
  },
  {
    title: 'Moderating Your Wiki',
    description: 'Best practices for wiki moderation',
    icon: Shield,
  },
];

const commands = [
  { name: '/wiki search', description: 'Search for articles by keyword' },
  { name: '/wiki article', description: 'Display a specific article' },
  { name: '/wiki create', description: 'Create a new article (authorized users)' },
  { name: '/wiki edit', description: 'Edit an existing article' },
  { name: '/wiki delete', description: 'Delete an article' },
  { name: '/wiki list', description: 'List all articles or by category' },
  { name: '/wiki help', description: 'Show help information' },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-primary mb-6" />

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <GradientText>Documentation</GradientText>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Everything you need to know about setting up and using WikiBot
              for your Discord community.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className={cn(
                    'w-full pl-12 pr-4 py-4 rounded-xl',
                    'bg-muted/50 border border-border',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                    'transition-all duration-300'
                  )}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Quick Links</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <Link key={link.title} href={link.href}>
                  <GlassCard className="p-6 h-full group cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Commands Reference */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Command Reference</h2>

            <GlassCard className="p-6 sm:p-8">
              <div className="space-y-4">
                {commands.map((cmd) => (
                  <div
                    key={cmd.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border/50 last:border-0"
                  >
                    <code className="text-primary font-mono text-sm">{cmd.name}</code>
                    <span className="text-sm text-muted-foreground">{cmd.description}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Guides */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Popular Guides</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guides.map((guide) => (
                <GlassCard key={guide.title} className="p-6 group cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <guide.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Need Help */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Can&apos;t find what you&apos;re looking for? Our community is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
              <Link href="/contact">
                <GradientButton variant="outline">
                  Contact Support
                </GradientButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight, AlertCircle } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Invite WikiBot',
  description: 'Add WikiBot to your Discord server',
};

// Force dynamic rendering to access server-side env vars at runtime
export const dynamic = 'force-dynamic';

const BOT_PERMISSIONS = '274878024704';
const SCOPES = 'bot applications.commands';

export default function InvitePage() {
  // Read client ID at runtime (server-side)
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID;

  // If client ID is configured, redirect to Discord OAuth
  if (clientId) {
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${BOT_PERMISSIONS}&scope=${encodeURIComponent(SCOPES)}`;
    redirect(inviteUrl);
  }

  // If no client ID, show a nice page explaining how to add the bot
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-xl shadow-primary/25">
              <BookOpen className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Add <GradientText>WikiBot</GradientText> to Your Server
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Create a powerful knowledge base for your Discord community.
              Get started in just a few clicks.
            </p>

            <GlassCard className="p-6 sm:p-8 text-left mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Configuration Required</h2>
                  <p className="text-sm text-muted-foreground">
                    The bot invite link is not configured yet. This is a self-hosted instance
                    and requires the Discord Client ID to be set.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">To add WikiBot to your server:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Discord Developer Portal</a></li>
                  <li>Create a new application or select your existing bot</li>
                  <li>Copy your Application ID (Client ID)</li>
                  <li>Set <code className="px-1.5 py-0.5 rounded bg-muted text-xs">NEXT_PUBLIC_DISCORD_CLIENT_ID</code> in your environment</li>
                  <li>Restart the dashboard and try again</li>
                </ol>
              </div>
            </GlassCard>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GradientButton size="lg" className="group">
                  Discord Developer Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </GradientButton>
              </a>
              <Link href="/docs">
                <button
                  className={cn(
                    'px-6 py-3 rounded-xl font-semibold',
                    'bg-muted/50 hover:bg-muted',
                    'border border-border hover:border-primary/30',
                    'transition-all duration-300'
                  )}
                >
                  View Documentation
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

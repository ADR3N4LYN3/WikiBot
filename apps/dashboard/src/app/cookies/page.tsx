import { Metadata } from 'next';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: 'Cookie Policy - WikiBot',
  description: 'WikiBot Cookie Policy - Learn about how we use cookies.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Cookie <GradientText>Policy</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 15, 2024
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <GlassCard className="p-6 sm:p-10">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold mb-4">What Are Cookies?</h2>
                <p className="text-muted-foreground mb-6">
                  Cookies are small text files stored on your device when you visit a website.
                  They help websites remember your preferences and improve your experience.
                </p>

                <h2 className="text-xl font-bold mb-4">Cookies We Use</h2>
                <p className="text-muted-foreground mb-4">
                  We use the following types of cookies:
                </p>

                <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  Required for the website to function properly. These include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Authentication cookies to keep you signed in</li>
                  <li>Session cookies for security</li>
                  <li>Preference cookies for your settings</li>
                </ul>

                <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  Help us understand how visitors use our website:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Page view statistics</li>
                  <li>Feature usage patterns</li>
                  <li>Error tracking for improvements</li>
                </ul>

                <h3 className="text-lg font-semibold mb-2">Preference Cookies</h3>
                <p className="text-muted-foreground mb-6">
                  Remember your preferences like theme selection (dark/light mode) and
                  dashboard settings.
                </p>

                <h2 className="text-xl font-bold mb-4">Managing Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  You can control cookies through your browser settings:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Block all cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Allow cookies from specific sites only</li>
                </ul>
                <p className="text-muted-foreground mb-6">
                  Note: Blocking essential cookies may affect the functionality of our service.
                </p>

                <h2 className="text-xl font-bold mb-4">Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-6">
                  We may use third-party services that set their own cookies, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Discord OAuth for authentication</li>
                  <li>Analytics providers</li>
                  <li>Error monitoring services</li>
                </ul>

                <h2 className="text-xl font-bold mb-4">Updates to This Policy</h2>
                <p className="text-muted-foreground mb-6">
                  We may update this Cookie Policy from time to time. Changes will be
                  posted on this page with an updated revision date.
                </p>

                <h2 className="text-xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  For questions about our cookie practices, contact us at{' '}
                  <a href="mailto:privacy@wikibot-app.xyz" className="text-primary hover:underline">
                    privacy@wikibot-app.xyz
                  </a>
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

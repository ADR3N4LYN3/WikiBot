import { Metadata } from 'next';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - WikiBot',
  description: 'WikiBot Terms of Service - Read our terms and conditions.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Terms of <GradientText>Service</GradientText>
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
                <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground mb-6">
                  By using WikiBot, you agree to these Terms of Service. If you do not agree
                  to these terms, please do not use our services.
                </p>

                <h2 className="text-xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-6">
                  WikiBot is a Discord bot and web dashboard that helps communities create,
                  organize, and share knowledge through articles and a searchable wiki system.
                </p>

                <h2 className="text-xl font-bold mb-4">3. User Responsibilities</h2>
                <p className="text-muted-foreground mb-4">
                  When using WikiBot, you agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Provide accurate information</li>
                  <li>Not create content that violates Discord&apos;s Terms of Service</li>
                  <li>Not use the service for illegal activities</li>
                  <li>Not attempt to abuse or exploit the service</li>
                  <li>Respect other users and communities</li>
                </ul>

                <h2 className="text-xl font-bold mb-4">4. Content Ownership</h2>
                <p className="text-muted-foreground mb-6">
                  You retain ownership of all content you create using WikiBot. By using our
                  service, you grant us a license to store, display, and distribute your content
                  as necessary to provide the service.
                </p>

                <h2 className="text-xl font-bold mb-4">5. Prohibited Content</h2>
                <p className="text-muted-foreground mb-4">
                  The following content is prohibited:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Illegal content or content promoting illegal activities</li>
                  <li>Hate speech, harassment, or discriminatory content</li>
                  <li>Spam or misleading content</li>
                  <li>Malware or malicious links</li>
                  <li>Content that infringes on intellectual property rights</li>
                </ul>

                <h2 className="text-xl font-bold mb-4">6. Premium Subscriptions</h2>
                <p className="text-muted-foreground mb-6">
                  Premium features are offered through paid subscriptions. Subscriptions
                  automatically renew unless canceled. Refunds are handled on a case-by-case basis.
                </p>

                <h2 className="text-xl font-bold mb-4">7. Service Availability</h2>
                <p className="text-muted-foreground mb-6">
                  We strive to maintain high availability but do not guarantee uninterrupted
                  service. We may modify or discontinue features with reasonable notice.
                </p>

                <h2 className="text-xl font-bold mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-6">
                  WikiBot is provided &quot;as is&quot; without warranties. We are not liable for any
                  damages arising from your use of the service, including data loss or
                  service interruptions.
                </p>

                <h2 className="text-xl font-bold mb-4">9. Termination</h2>
                <p className="text-muted-foreground mb-6">
                  We reserve the right to terminate or suspend accounts that violate these
                  terms. You may also terminate your account at any time through the dashboard.
                </p>

                <h2 className="text-xl font-bold mb-4">10. Changes to Terms</h2>
                <p className="text-muted-foreground mb-6">
                  We may update these terms from time to time. Continued use of the service
                  after changes constitutes acceptance of the new terms.
                </p>

                <h2 className="text-xl font-bold mb-4">11. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these terms, contact us at{' '}
                  <a href="mailto:legal@wikibot-app.xyz" className="text-primary hover:underline">
                    legal@wikibot-app.xyz
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

import { Metadata } from 'next';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - WikiBot',
  description: 'WikiBot Privacy Policy - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Privacy <GradientText>Policy</GradientText>
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
                <h2 className="text-xl font-bold mb-4">1. Information we collect</h2>
                <p className="text-muted-foreground mb-6">
                  When you use WikiBot, we collect certain information to provide our services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Discord user ID and username</li>
                  <li>Discord server IDs where the bot is installed</li>
                  <li>Articles and content you create</li>
                  <li>Search queries and usage analytics</li>
                </ul>

                <h2 className="text-xl font-bold mb-4">2. How we use your information</h2>
                <p className="text-muted-foreground mb-6">
                  We use the collected information to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Provide and maintain our services</li>
                  <li>Improve and personalize your experience</li>
                  <li>Generate anonymized analytics</li>
                  <li>Communicate important updates</li>
                </ul>

                <h2 className="text-xl font-bold mb-4">3. Data storage and security</h2>
                <p className="text-muted-foreground mb-6">
                  Your data is stored securely on encrypted servers. We implement industry-standard
                  security measures to protect your information from unauthorized access,
                  alteration, or destruction.
                </p>

                <h2 className="text-xl font-bold mb-4">4. Data sharing</h2>
                <p className="text-muted-foreground mb-6">
                  We do not sell your personal information. We may share data with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Service providers who assist in our operations</li>
                  <li>Legal authorities when required by law</li>
                </ul>

                <h2 className="text-xl font-bold mb-4">5. Your rights</h2>
                <p className="text-muted-foreground mb-6">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Request data deletion</li>
                  <li>Export your articles and content</li>
                  <li>Opt out of analytics collection</li>
                </ul>

                <h2 className="text-xl font-bold mb-4">6. Data retention</h2>
                <p className="text-muted-foreground mb-6">
                  We retain your data for as long as your account is active or as needed to provide
                  services. When you delete your account, we remove your personal data within 30 days.
                </p>

                <h2 className="text-xl font-bold mb-4">7. Contact us</h2>
                <p className="text-muted-foreground">
                  For privacy-related inquiries, contact us at{' '}
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

import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { Navbar } from '@/components/marketing/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { Preview } from '@/components/marketing/Preview';
import { Features } from '@/components/marketing/Features';
import { Pricing } from '@/components/marketing/Pricing';
import { FAQ } from '@/components/marketing/FAQ';
import { Footer } from '@/components/marketing/Footer';

export default async function HomePage() {
  const session = await auth();

  // Redirect to dashboard if already logged in
  if (session) {
    redirect('/dashboard');
  }

  // Show landing page for non-authenticated users
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Preview />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}

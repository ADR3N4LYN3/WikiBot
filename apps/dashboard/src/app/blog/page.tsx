import { Metadata } from 'next';
import { Calendar, Clock } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: 'Blog - WikiBot',
  description: 'Latest news, updates, and tips for using WikiBot in your Discord community.',
};

const posts = [
  {
    id: 1,
    title: 'Introducing WikiBot 2.0: A Complete Redesign',
    excerpt: 'We\'ve completely redesigned WikiBot with a new dashboard, better performance, and more features than ever before.',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'Announcement',
    featured: true,
  },
  {
    id: 2,
    title: 'How to Organize Your Discord Wiki for Maximum Engagement',
    excerpt: 'Learn best practices for structuring your knowledge base so your community can find answers quickly.',
    date: '2024-01-10',
    readTime: '8 min read',
    category: 'Tutorial',
    featured: false,
  },
  {
    id: 3,
    title: 'New Feature: AI-Powered Search Suggestions',
    excerpt: 'Our new AI feature helps users find what they\'re looking for, even when they don\'t know the exact keywords.',
    date: '2024-01-05',
    readTime: '4 min read',
    category: 'Feature',
    featured: false,
  },
  {
    id: 4,
    title: 'Case Study: How Gaming Community Grew to 100K Members',
    excerpt: 'See how one gaming community used WikiBot to scale their support and grow their Discord server.',
    date: '2024-01-01',
    readTime: '6 min read',
    category: 'Case Study',
    featured: false,
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  const featuredPost = posts.find((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Header */}
        <section className="relative py-12 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              The WikiBot <GradientText>Blog</GradientText>
            </h1>
            <p className="text-lg text-muted-foreground">
              Updates, tutorials, and tips for Discord communities.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <GlassCard className="p-6 sm:p-10">
                <Badge variant="premium" glow className="mb-4">
                  Featured
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(featuredPost.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
              </GlassCard>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <GlassCard key={post.id} className="h-full p-6">
                  <Badge variant="default" className="mb-4">
                    {post.category}
                  </Badge>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                    <span>{formatDate(post.date)}</span>
                    <Badge variant="default" className="text-xs">
                      Coming soon
                    </Badge>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

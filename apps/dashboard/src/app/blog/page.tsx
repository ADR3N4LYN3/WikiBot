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
    title: 'WikiBot 1.0 is Here!',
    excerpt: 'We\'re excited to announce the official launch of WikiBot! Create, organize, and search your Discord knowledge base with ease using simple slash commands.',
    date: '2026-01-28',
    readTime: '3 min read',
    category: 'Announcement',
    featured: true,
  },
  {
    id: 2,
    title: 'Getting Started with WikiBot: A Complete Guide',
    excerpt: 'Learn how to set up WikiBot in your Discord server, create your first articles, organize them into categories, and make the most of the search functionality.',
    date: '2026-01-25',
    readTime: '8 min read',
    category: 'Tutorial',
    featured: false,
  },
  {
    id: 3,
    title: '5 Best Practices for Discord Knowledge Bases',
    excerpt: 'Discover proven strategies to structure your wiki for maximum engagement: clear naming conventions, smart categorization, and keeping content fresh.',
    date: '2026-01-20',
    readTime: '6 min read',
    category: 'Guide',
    featured: false,
  },
  {
    id: 4,
    title: 'Understanding AI-Powered Search in WikiBot',
    excerpt: 'Deep dive into how our semantic search works, when to use it versus full-text search, and tips to optimize your articles for better discoverability.',
    date: '2026-01-15',
    readTime: '5 min read',
    category: 'Feature',
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
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
                    <span>{formatDate(post.date)}</span>
                    <span>{post.readTime}</span>
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

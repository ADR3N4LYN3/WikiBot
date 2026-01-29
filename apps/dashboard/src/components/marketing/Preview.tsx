'use client';

import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  FolderOpen,
  BarChart3,
  Settings,
  Home,
  Plus,
  MoreVertical,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { GradientText } from '../ui/GradientText';

// Fake article data for the mockup
const mockArticles = [
  { title: 'Getting Started Guide', category: 'Tutorials', views: 1234 },
  { title: 'Server Rules & Guidelines', category: 'Rules', views: 892 },
  { title: 'Frequently Asked Questions', category: 'Support', views: 756 },
  { title: 'Bot Commands Reference', category: 'Documentation', views: 543 },
];

// Fake sidebar navigation
const sidebarItems = [
  { icon: Home, label: 'Overview', active: false },
  { icon: BookOpen, label: 'Articles', active: true },
  { icon: FolderOpen, label: 'Categories', active: false },
  { icon: BarChart3, label: 'Analytics', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

export function Preview() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-pattern opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            A Dashboard That
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <GradientText>Just Works</GradientText>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Manage your wiki from a beautiful, intuitive dashboard.
            No technical skills required.
          </p>
        </motion.div>

        {/* Browser mockup */}
        <motion.div
          className="relative max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Glow effect behind */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />

          {/* Browser frame */}
          <div className="relative glass rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/20">
            {/* Browser header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
              {/* Traffic lights */}
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              {/* URL bar */}
              <div className="flex-1 mx-4">
                <div className="bg-background/50 rounded-lg px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="text-green-500">🔒</span>
                  <span>wikibot-app.xyz/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="flex min-h-[400px] sm:min-h-[500px]">
              {/* Sidebar */}
              <div className="hidden sm:flex w-56 flex-col bg-card/50 border-r border-border/50 p-4">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm">WikiBot</span>
                </div>

                {/* Nav items */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                        item.active
                          ? 'bg-gradient-to-r from-primary/80 to-secondary/80 text-white'
                          : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  ))}
                </nav>

                {/* Plan badge */}
                <div className="mt-auto pt-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-primary mb-1">Free Plan</div>
                    <div className="text-xs text-muted-foreground">50 articles left</div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Articles</h3>
                    <p className="text-xs text-muted-foreground">Manage your knowledge base</p>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary to-secondary rounded-lg text-white text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Article</span>
                  </button>
                </div>

                {/* Search bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <div className="w-full h-10 bg-muted/50 rounded-lg pl-10 pr-4 flex items-center text-sm text-muted-foreground">
                    Search articles...
                  </div>
                </div>

                {/* Articles table */}
                <div className="bg-card/50 rounded-xl border border-border/50 overflow-hidden">
                  {/* Table header */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
                    <div className="col-span-5">Title</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-2">Views</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {/* Table rows */}
                  {mockArticles.map((article, index) => (
                    <div
                      key={article.title}
                      className={cn(
                        'grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm',
                        index !== mockArticles.length - 1 && 'border-b border-border/50'
                      )}
                    >
                      <div className="col-span-12 sm:col-span-5 font-medium truncate">
                        {article.title}
                      </div>
                      <div className="hidden sm:block col-span-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {article.category}
                        </span>
                      </div>
                      <div className="hidden sm:block col-span-2 text-muted-foreground">
                        {article.views.toLocaleString()}
                      </div>
                      <div className="hidden sm:flex col-span-2 justify-end">
                        <button className="p-1 hover:bg-muted rounded">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature highlights below mockup */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 sm:mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {[
            { label: 'Intuitive Interface', desc: 'No learning curve needed' },
            { label: 'Real-time Updates', desc: 'Changes sync instantly' },
            { label: 'Mobile Friendly', desc: 'Manage from anywhere' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-semibold text-sm sm:text-base">{item.label}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

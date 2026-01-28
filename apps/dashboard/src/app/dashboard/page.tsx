'use client';

import useSWR from 'swr';
import { BookOpen, Search, Eye, FolderOpen, TrendingUp, ArrowUpRight } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';

import { analyticsApi } from '@/lib/api';
import { formatNumber, cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Badge } from '@/components/ui/Badge';
import type { TopArticle } from '@/lib/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: overview } = useSWR('analytics-overview', () =>
    analyticsApi.getOverview().then((res) => res.data)
  );
  const { data: topArticles } = useSWR('top-articles', () =>
    analyticsApi.getTopArticles(5).then((res) => res.data)
  );
  const { data: activity } = useSWR('activity', () =>
    analyticsApi.getActivity(30).then((res) => res.data)
  );

  const stats = [
    {
      name: 'Total Articles',
      value: overview?.totalArticles || 0,
      icon: BookOpen,
      change: overview?.articlesThisMonth || 0,
      changeLabel: 'this month',
      gradient: 'from-primary to-secondary',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      name: 'Total Searches',
      value: overview?.totalSearches || 0,
      icon: Search,
      change: overview?.searchesThisMonth || 0,
      changeLabel: 'this month',
      gradient: 'from-secondary to-accent',
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary',
    },
    {
      name: 'Total Views',
      value: overview?.totalViews || 0,
      icon: Eye,
      change: null,
      changeLabel: '',
      gradient: 'from-accent to-primary',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      name: 'Categories',
      value: overview?.totalCategories || 0,
      icon: FolderOpen,
      change: null,
      changeLabel: '',
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">
          Welcome back, <GradientText>Admin</GradientText>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your wiki today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {stats.map((stat) => (
          <motion.div key={stat.name} variants={itemVariants}>
            <GlassCard className="p-6 group">
              <div className="flex items-start justify-between">
                {/* Icon with gradient background */}
                <div
                  className={cn(
                    'p-3 rounded-xl',
                    stat.iconBg,
                    'group-hover:scale-110 transition-transform duration-300'
                  )}
                >
                  <stat.icon className={cn('w-6 h-6', stat.iconColor)} />
                </div>

                {/* Change badge */}
                {stat.change !== null && stat.change > 0 && (
                  <Badge variant="success" glow>
                    <ArrowUpRight className="w-3 h-3" />
                    +{stat.change}
                  </Badge>
                )}
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold">
                  <AnimatedCounter
                    value={stat.value}
                    formatFn={(v) => formatNumber(Math.round(v))}
                  />
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
              </div>

              {/* Decorative gradient line */}
              <div
                className={cn(
                  'absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl',
                  'bg-gradient-to-r',
                  stat.gradient,
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                )}
              />
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Activity Overview</h2>
                <p className="text-sm text-muted-foreground">
                  Searches and views over the last 30 days
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Searches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Views</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity || []}>
                  <defs>
                    <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => value.slice(5)}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="searches"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorSearches)"
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    fill="url(#colorViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Top Articles */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Top Articles</h2>
              <Badge variant="premium">Trending</Badge>
            </div>

            <div className="space-y-3">
              {topArticles?.map((article: TopArticle, index: number) => (
                <motion.div
                  key={article.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl',
                    'bg-muted/30 hover:bg-muted/50',
                    'transition-all duration-300',
                    'group cursor-pointer'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  {/* Rank badge */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      'text-xs font-bold',
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                        : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                          : index === 2
                            ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                            : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(article.views)} views
                    </p>
                  </div>

                  <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}

              {!topArticles?.length && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No articles yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create your first article to see stats
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

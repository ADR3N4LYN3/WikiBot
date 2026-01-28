'use client';

import useSWR from 'swr';
import { BookOpen, Search, Eye, FolderOpen, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { analyticsApi } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

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
    },
    {
      name: 'Total Searches',
      value: overview?.totalSearches || 0,
      icon: Search,
      change: overview?.searchesThisMonth || 0,
      changeLabel: 'this month',
    },
    {
      name: 'Total Views',
      value: overview?.totalViews || 0,
      icon: Eye,
      change: null,
      changeLabel: '',
    },
    {
      name: 'Categories',
      value: overview?.totalCategories || 0,
      icon: FolderOpen,
      change: null,
      changeLabel: '',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your WikiBot dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <stat.icon className="w-8 h-8 text-primary" />
              {stat.change !== null && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  +{stat.change} {stat.changeLabel}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{formatNumber(stat.value)}</p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="searches"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Top Articles</h2>
          <div className="space-y-4">
            {topArticles?.map((article: any, index: number) => (
              <div
                key={article.id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(article.views)} views
                  </p>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            ))}
            {!topArticles?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No articles yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

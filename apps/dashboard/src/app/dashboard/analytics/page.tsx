'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Search, Eye, BookOpen, TrendingUp } from 'lucide-react';

import { analyticsApi } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { TopSearch, TopArticle } from '@/lib/types';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);

  const { data: overview } = useSWR('analytics-overview', () =>
    analyticsApi.getOverview().then((res) => res.data)
  );
  const { data: topArticles } = useSWR('top-articles-10', () =>
    analyticsApi.getTopArticles(10).then((res) => res.data)
  );
  const { data: topSearches } = useSWR('top-searches', () =>
    analyticsApi.getTopSearches(10).then((res) => res.data)
  );
  const { data: activity } = useSWR(`activity-${period}`, () =>
    analyticsApi.getActivity(period).then((res) => res.data)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your knowledge base performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="px-4 py-2 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-xl border">
          <BookOpen className="w-8 h-8 text-primary mb-4" />
          <p className="text-3xl font-bold">{formatNumber(overview?.totalArticles || 0)}</p>
          <p className="text-sm text-muted-foreground">Total Articles</p>
        </div>
        <div className="bg-card p-6 rounded-xl border">
          <Search className="w-8 h-8 text-green-500 mb-4" />
          <p className="text-3xl font-bold">{formatNumber(overview?.totalSearches || 0)}</p>
          <p className="text-sm text-muted-foreground">Total Searches</p>
        </div>
        <div className="bg-card p-6 rounded-xl border">
          <Eye className="w-8 h-8 text-yellow-500 mb-4" />
          <p className="text-3xl font-bold">{formatNumber(overview?.totalViews || 0)}</p>
          <p className="text-sm text-muted-foreground">Total Views</p>
        </div>
        <div className="bg-card p-6 rounded-xl border">
          <TrendingUp className="w-8 h-8 text-pink-500 mb-4" />
          <p className="text-3xl font-bold">{formatNumber(overview?.searchesThisMonth || 0)}</p>
          <p className="text-sm text-muted-foreground">Searches This Month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Search Activity</h2>
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
                  stroke="#5865F2"
                  strokeWidth={2}
                  dot={false}
                  name="Searches"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Articles Chart */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Top Articles by Views</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topArticles?.slice(0, 5) || []}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fontSize: 12 }}
                  width={150}
                  tickFormatter={(value) =>
                    value.length > 20 ? value.slice(0, 20) + '...' : value
                  }
                />
                <Tooltip />
                <Bar dataKey="views" fill="#5865F2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Top Searches</h2>
          <div className="space-y-3">
            {topSearches?.map((search: TopSearch, index: number) => (
              <div
                key={search.query}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{search.query}</p>
                  <p className="text-xs text-muted-foreground">
                    {search.count} searches • Avg {search.avgResultCount} results
                  </p>
                </div>
              </div>
            ))}
            {!topSearches?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No searches yet
              </p>
            )}
          </div>
        </div>

        {/* Top Articles Table */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Most Viewed Articles</h2>
          <div className="space-y-3">
            {topArticles?.map((article: TopArticle, index: number) => (
              <div
                key={article.id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(article.views)} views • {formatNumber(article.helpful)} helpful
                  </p>
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

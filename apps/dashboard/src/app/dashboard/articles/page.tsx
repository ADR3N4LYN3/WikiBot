'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Plus, Search, Eye, ThumbsUp, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { articlesApi, categoriesApi } from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';
import type { Article, Category } from '@/lib/types';

export default function ArticlesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: articlesData, mutate } = useSWR('articles', () =>
    articlesApi.getAll({ categoryId: selectedCategory || undefined }).then((res) => res.data)
  );
  const { data: categories } = useSWR('categories', () =>
    categoriesApi.getAll().then((res) => res.data)
  );

  const articles = articlesData?.articles || [];
  const filteredArticles = articles.filter((article: Article) =>
    article.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await articlesApi.delete(slug);
      toast.success('Article deleted');
      mutate();
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-muted-foreground">
            Manage your knowledge base articles
          </p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories?.map((cat: Category) => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Articles Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                Title
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                Category
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                Stats
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                Updated
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredArticles.map((article: Article) => (
              <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-muted-foreground">/{article.slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {article.category ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                      {article.category.emoji} {article.category.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(article.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {formatNumber(article.helpful)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(article.updatedAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/articles/${article.slug}`}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.slug)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredArticles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No articles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

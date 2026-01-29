'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Plus, Search, Eye, ThumbsUp, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { articlesApi, categoriesApi } from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';
import type { Article, Category } from '@/lib/types';
import { SkeletonArticleRow } from '@/components/ui/Skeleton';
import { EmptyArticles, EmptySearchResults } from '@/components/ui/EmptyState';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination, PaginationInfo } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

export default function ArticlesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  const { data: articlesData, mutate, isLoading } = useSWR(
    ['articles', selectedCategory, currentPage],
    () => articlesApi.getAll({
      categoryId: selectedCategory || undefined,
      page: currentPage,
      limit: PAGE_SIZE,
    }).then((res) => res.data)
  );

  const { data: categories } = useSWR('categories', () =>
    categoriesApi.getAll().then((res) => res.data)
  );

  const articles = articlesData?.articles || [];
  const total = articlesData?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Client-side search filter (for quick filtering)
  const filteredArticles = articles.filter((article: Article) =>
    article.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!articleToDelete) return;

    try {
      await articlesApi.delete(articleToDelete);
      toast.success('Article deleted successfully');
      mutate();
      setArticleToDelete(null);
    } catch (error) {
      toast.error('Failed to delete article');
      throw error;
    }
  }, [articleToDelete, mutate]);

  const deleteDialog = useConfirmDialog({ onConfirm: handleDeleteConfirm });

  const handleDeleteClick = (slug: string) => {
    setArticleToDelete(slug);
    deleteDialog.open();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when category changes
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
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
          onChange={(e) => handleCategoryChange(e.target.value || null)}
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

      {/* Pagination Info */}
      {!isLoading && total > 0 && (
        <PaginationInfo
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
        />
      )}

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
            {/* Loading state */}
            {isLoading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonArticleRow key={i} />
                ))}
              </>
            )}

            {/* Articles */}
            {!isLoading && filteredArticles.map((article: Article) => (
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
                      title="Edit article"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(article.slug)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      title="Delete article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty states */}
            {!isLoading && articles.length === 0 && !search && (
              <tr>
                <td colSpan={5}>
                  <EmptyArticles />
                </td>
              </tr>
            )}

            {!isLoading && articles.length > 0 && filteredArticles.length === 0 && search && (
              <tr>
                <td colSpan={5}>
                  <EmptySearchResults query={search} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => {
          deleteDialog.close();
          setArticleToDelete(null);
        }}
        onConfirm={deleteDialog.confirm}
        title="Delete Article"
        description="Are you sure you want to delete this article? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
}

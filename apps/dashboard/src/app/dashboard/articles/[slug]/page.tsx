'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { ArticleEditor } from '@/components/ArticleEditor';
import { articlesApi, categoriesApi } from '@/lib/api';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [published, setPublished] = useState(true);

  const { data: article, error } = useSWR(`article-${slug}`, () =>
    articlesApi.getBySlug(slug).then((res) => res.data)
  );
  const { data: categories } = useSWR('categories', () =>
    categoriesApi.getAll().then((res) => res.data)
  );

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setCategorySlug(article.category?.slug || '');
      setPublished(article.published);
    }
  }, [article]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Article not found</p>
        <Link href="/dashboard/articles" className="text-primary hover:underline">
          Back to articles
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await articlesApi.update(slug, {
        title: title.trim(),
        content: content.trim(),
        published,
      });

      toast.success('Article updated successfully!');
      router.push('/dashboard/articles');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/articles"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Article</h1>
          <p className="text-muted-foreground">Update your article</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-6 rounded-xl border space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">No category</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Published */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="published" className="text-sm font-medium">
              Published
            </label>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <ArticleEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/articles"
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

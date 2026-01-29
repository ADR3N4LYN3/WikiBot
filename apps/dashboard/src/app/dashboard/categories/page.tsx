'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

import { categoriesApi } from '@/lib/api';
import { generateSlug } from '@/lib/utils';
import type { Category, ApiError } from '@/lib/types';

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('');

  const { data: categories, mutate } = useSWR('categories', () =>
    categoriesApi.getAll().then((res) => res.data)
  );

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description || '');
      setEmoji(category.emoji || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setEmoji('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName('');
    setDescription('');
    setEmoji('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.slug, {
          name: name.trim(),
          description: description.trim() || undefined,
          emoji: emoji || undefined,
        });
        toast.success('Category updated');
      } else {
        await categoriesApi.create({
          name: name.trim(),
          slug: generateSlug(name),
          description: description.trim() || undefined,
          emoji: emoji || undefined,
        });
        toast.success('Category created');
      }
      mutate();
      closeModal();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this category? Articles will be uncategorized.')) return;

    try {
      await categoriesApi.delete(slug);
      toast.success('Category deleted');
      mutate();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize your articles into categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-card rounded-xl border">
        {categories?.length ? (
          <div className="divide-y">
            {categories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <GripVertical className="hidden sm:block w-5 h-5 text-muted-foreground cursor-move" />
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl">
                  {category.emoji || '📁'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.description || 'No description'}
                  </p>
                </div>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {category._count?.articles || 0} articles
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(category)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.slug)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No categories yet. Create one to organize your articles.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-xl w-full max-w-md mx-4 sm:mx-0">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Emoji</label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="📚"
                  maxLength={2}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingCategory ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

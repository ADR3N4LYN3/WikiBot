import { prisma } from '@wikibot/database';
import { CategoryCreateInput, CategoryUpdateInput } from '@wikibot/shared';

import { AppError } from '../middleware/errorHandler';

export async function getCategories(serverId: string) {
  return await prisma.category.findMany({
    where: { serverId },
    orderBy: { position: 'asc' },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
}

export async function createCategory(serverId: string, input: CategoryCreateInput) {
  const { name, slug, description, emoji, position } = input;

  // Check if slug already exists
  const existing = await prisma.category.findUnique({
    where: {
      serverId_slug: { serverId, slug },
    },
  });

  if (existing) {
    throw new AppError(409, 'Category with this slug already exists');
  }

  return await prisma.category.create({
    data: {
      serverId,
      name,
      slug,
      description,
      emoji,
      position: position ?? 0,
    },
  });
}

export async function updateCategory(
  serverId: string,
  slug: string,
  input: CategoryUpdateInput
) {
  const category = await prisma.category.findUnique({
    where: {
      serverId_slug: { serverId, slug },
    },
  });

  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  return await prisma.category.update({
    where: {
      serverId_slug: { serverId, slug },
    },
    data: input,
  });
}

export async function deleteCategory(serverId: string, slug: string) {
  const category = await prisma.category.findUnique({
    where: {
      serverId_slug: { serverId, slug },
    },
  });

  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  await prisma.category.delete({
    where: {
      serverId_slug: { serverId, slug },
    },
  });
}

export async function reorderCategories(serverId: string, categoryIds: string[]) {
  // Verify all categories belong to the server
  const categories = await prisma.category.findMany({
    where: {
      serverId,
      id: { in: categoryIds },
    },
  });

  if (categories.length !== categoryIds.length) {
    throw new AppError(400, 'Invalid category IDs');
  }

  // Update positions in a transaction
  await prisma.$transaction(
    categoryIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { position: index },
      })
    )
  );
}

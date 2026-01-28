import { prisma } from './client';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test server (Discord guild)
  const testServer = await prisma.server.upsert({
    where: { id: '123456789012345678' },
    update: {},
    create: {
      id: '123456789012345678',
      name: 'Test Server',
      premium: false,
      premiumTier: 'free',
      settings: {
        create: {
          brandColor: '#5865F2',
          maxArticles: 50,
          maxSearchesPerMonth: 1000,
          aiSearchEnabled: false,
          publicWebview: true,
        },
      },
    },
  });

  console.log('✅ Created test server:', testServer.name);

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { id: '987654321098765432' },
    update: {},
    create: {
      id: '987654321098765432',
      username: 'TestUser',
      discriminator: '0001',
      avatar: null,
    },
  });

  console.log('✅ Created test user:', testUser.username);

  // Create test categories
  const generalCategory = await prisma.category.upsert({
    where: {
      serverId_slug: {
        serverId: testServer.id,
        slug: 'general',
      },
    },
    update: {},
    create: {
      serverId: testServer.id,
      name: 'General',
      slug: 'general',
      description: 'General information and guides',
      emoji: '📚',
      position: 0,
    },
  });

  const faqCategory = await prisma.category.upsert({
    where: {
      serverId_slug: {
        serverId: testServer.id,
        slug: 'faq',
      },
    },
    update: {},
    create: {
      serverId: testServer.id,
      name: 'FAQ',
      slug: 'faq',
      description: 'Frequently Asked Questions',
      emoji: '❓',
      position: 1,
    },
  });

  console.log('✅ Created test categories:', generalCategory.name, faqCategory.name);

  // Create test articles
  const welcomeArticle = await prisma.article.create({
    data: {
      serverId: testServer.id,
      categoryId: generalCategory.id,
      authorId: testUser.id,
      title: 'Welcome to WikiBot',
      slug: 'welcome',
      content: `# Welcome to WikiBot!

WikiBot is your collaborative knowledge base for Discord servers.

## Features

- 📝 Create and manage wiki articles
- 🔍 Search through your knowledge base
- 👥 Collaborative editing with version history
- 🤖 AI-powered semantic search (Premium)
- 📊 Analytics and insights

Use \`/wiki\` commands to get started!`,
      published: true,
    },
  });

  const howToArticle = await prisma.article.create({
    data: {
      serverId: testServer.id,
      categoryId: faqCategory.id,
      authorId: testUser.id,
      title: 'How to Create an Article',
      slug: 'how-to-create-article',
      content: `# How to Create an Article

Creating an article in WikiBot is easy!

## Steps

1. Use the \`/wiki create\` command
2. Fill in the title and content in the modal
3. Submit the form
4. Your article will be created instantly!

## Tips

- Use Markdown for formatting
- Choose a descriptive title
- Assign a category for better organization`,
      published: true,
    },
  });

  console.log('✅ Created test articles:', welcomeArticle.title, howToArticle.title);

  // Create a search log entry
  await prisma.searchLog.create({
    data: {
      serverId: testServer.id,
      userId: testUser.id,
      query: 'how to create',
      resultCount: 1,
      clickedId: howToArticle.id,
    },
  });

  console.log('✅ Created test search log');

  console.log('\n🎉 Database seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { ActivityType, Events, REST, Routes } from 'discord.js';

import { client } from '../index';
import { apiClient } from '../services/apiClient';

// Auto-register slash commands on startup
async function registerCommands() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!clientId || !botToken) {
    console.warn('⚠️  Missing DISCORD_CLIENT_ID or DISCORD_BOT_TOKEN, skipping command registration');
    return;
  }

  try {
    // Get commands from client collection
    const commands = Array.from(client.commands.values()).map(cmd => cmd.data.toJSON());

    if (commands.length === 0) {
      console.warn('⚠️  No commands to register');
      return;
    }

    const rest = new REST().setToken(botToken);

    console.log(`🔄 Registering ${commands.length} slash commands...`);

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`✅ Successfully registered ${commands.length} slash commands globally`);
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
    // Don't exit - bot can still work with existing commands
  }
}

// Rotating status messages
const statusMessages = [
  { name: '/wiki-help', type: ActivityType.Listening },
  { name: '/wiki-search your questions', type: ActivityType.Listening },
  { name: '{servers} servers', type: ActivityType.Watching },
  { name: '{articles} articles', type: ActivityType.Watching },
  { name: 'your knowledge base', type: ActivityType.Competing },
];

let currentStatusIndex = 0;
let totalArticles = 0;

// Update article count periodically from the stats API
async function updateArticleCount() {
  try {
    const response = await apiClient.get('/api/v1/stats');
    totalArticles = response.data.articles || 0;
    console.log(`📊 Updated stats: ${totalArticles} articles`);
  } catch (error) {
    // Log but don't fail - stats are optional
    console.warn('⚠️  Failed to fetch stats:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Sync all servers to database on startup
async function syncServers() {
  console.log('🔄 Syncing servers to database...');

  const guilds = client.guilds.cache;

  const results = await Promise.allSettled(
    Array.from(guilds.values()).map(guild =>
      apiClient.post('/api/v1/servers', {
        id: guild.id,
        name: guild.name,
      }).then(() => ({ success: true, name: guild.name }))
        .catch(error => {
          console.error(`❌ Failed to sync server ${guild.name}:`, error);
          return { success: false, name: guild.name };
        })
    )
  );

  const synced = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - synced;

  console.log(`✅ Server sync complete: ${synced} synced, ${failed} failed`);
}

function rotateStatus() {
  const status = statusMessages[currentStatusIndex];
  const serverCount = client.guilds.cache.size;

  // Replace placeholders
  const statusName = status.name
    .replace('{servers}', serverCount.toString())
    .replace('{articles}', totalArticles.toString());

  client.user?.setPresence({
    activities: [{ name: statusName, type: status.type }],
    status: 'online',
  });

  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
}

client.once(Events.ClientReady, c => {
  console.log(`✅ Bot ready! Logged in as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} servers`);

  // Sync servers to database
  syncServers();

  // Auto-register slash commands on startup
  registerCommands();

  // Initial status
  rotateStatus();

  // Rotate status every 30 seconds
  setInterval(rotateStatus, 30000);

  // Update article count every 5 minutes
  updateArticleCount();
  setInterval(updateArticleCount, 300000);
});

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
  { name: '/help', type: ActivityType.Listening },
  { name: '/search your questions', type: ActivityType.Listening },
  { name: '{servers} servers', type: ActivityType.Watching },
  { name: '{articles} articles', type: ActivityType.Watching },
  { name: 'your knowledge base', type: ActivityType.Competing },
];

let currentStatusIndex = 0;
let totalArticles = 0;

// Update article count periodically
async function updateArticleCount() {
  try {
    // This would ideally come from the API, but we'll use a placeholder
    // TODO: Fetch from API when endpoint is available
    totalArticles = 0;
  } catch {
    // Ignore errors
  }
}

// Sync all servers to database on startup
async function syncServers() {
  console.log('🔄 Syncing servers to database...');

  const guilds = client.guilds.cache;
  let synced = 0;
  let failed = 0;

  for (const [, guild] of guilds) {
    try {
      await apiClient.post('/api/v1/servers', {
        id: guild.id,
        name: guild.name,
      });
      synced++;
    } catch (error) {
      console.error(`❌ Failed to sync server ${guild.name}:`, error);
      failed++;
    }
  }

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

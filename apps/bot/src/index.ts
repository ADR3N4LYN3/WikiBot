import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

import { Command } from './types';
import { loadCommands } from './utils/loadCommands';

// Validate required environment variables
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

if (!process.env.API_URL) {
  console.warn('⚠️  API_URL not set, defaulting to http://localhost:4000');
}

if (!process.env.BOT_API_SECRET) {
  console.warn('⚠️  BOT_API_SECRET not set, API requests will be unauthenticated');
}

// Create Discord client
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Commands collection
client.commands = new Collection<string, Command>();

// Load commands
loadCommands(client);

// Load event handlers
import('./events/ready');
import('./events/interactionCreate');
import('./events/guildCreate');
import('./events/guildDelete');

// Auto-reconnect configuration
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 5000; // 5 seconds
let reconnectAttempts = 0;
let isShuttingDown = false;

async function connectWithRetry() {
  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    console.log('🤖 Bot is logging in...');
    reconnectAttempts = 0; // Reset on successful connection
  } catch (error) {
    console.error('❌ Failed to login:', error);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !isShuttingDown) {
      reconnectAttempts++;
      const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), 300000); // Max 5 min
      console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(connectWithRetry, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Exiting...');
      process.exit(1);
    }
  }
}

// Handle disconnection and auto-reconnect
client.on('error', error => {
  console.error('❌ Client error:', error);
});

client.on('disconnect', () => {
  console.warn('⚠️  Bot disconnected from Discord');
  if (!isShuttingDown) {
    console.log('🔄 Attempting to reconnect...');
    connectWithRetry();
  }
});

client.on('shardError', error => {
  console.error('❌ Shard error:', error);
});

client.on('shardDisconnect', (event, shardId) => {
  console.warn(`⚠️  Shard ${shardId} disconnected (code: ${event.code})`);
});

client.on('shardReconnecting', shardId => {
  console.log(`🔄 Shard ${shardId} reconnecting...`);
});

client.on('shardResume', (shardId, replayedEvents) => {
  console.log(`✅ Shard ${shardId} resumed (replayed ${replayedEvents} events)`);
});

// Initial login
connectWithRetry();

// Handle process termination
process.on('SIGINT', () => {
  console.log('👋 Bot is shutting down...');
  isShuttingDown = true;
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Bot received SIGTERM, shutting down...');
  isShuttingDown = true;
  client.destroy();
  process.exit(0);
});

// Extend Discord.js Client type
declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>;
  }
}

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

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => {
    console.log('🤖 Bot is logging in...');
  })
  .catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', () => {
  console.log('👋 Bot is shutting down...');
  client.destroy();
  process.exit(0);
});

// Extend Discord.js Client type
declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>;
  }
}

import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

import { Command } from '../types';

const commands: any[] = [];

// Load all commands
const commandsPath = join(__dirname, '..', 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
  const command: Command = require(join(commandsPath, file)).default;
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

// Register commands with Discord
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    const data: any = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commands }
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();

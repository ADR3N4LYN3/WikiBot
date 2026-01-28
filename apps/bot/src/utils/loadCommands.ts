import { readdirSync } from 'fs';
import { join } from 'path';

import { Client } from 'discord.js';

import { Command } from '../types';

export function loadCommands(client: Client) {
  const commandsPath = join(__dirname, '..', 'commands');
  const commandFiles = readdirSync(commandsPath).filter(file =>
    (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
  );

  let loadedCount = 0;

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command: Command = require(filePath).default;

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      loadedCount++;
    } else {
      console.warn(`⚠️  The command at ${filePath} is missing required "data" or "execute" property.`);
    }
  }

  console.log(`📦 Loaded ${loadedCount} commands`);
}

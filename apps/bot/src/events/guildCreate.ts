import { Events } from 'discord.js';

import { client } from '../index';
import { apiClient } from '../services/apiClient';

client.on(Events.GuildCreate, async guild => {
  console.log(`🎉 Bot joined a new server: ${guild.name} (${guild.id})`);

  try {
    // Create server entry in database via API
    await apiClient.post('/api/v1/servers', {
      id: guild.id,
      name: guild.name,
    });

    console.log(`✅ Created database entry for ${guild.name}`);
  } catch (error) {
    console.error(`❌ Failed to create database entry:`, error);
  }
});

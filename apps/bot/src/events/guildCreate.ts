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

    // Add server owner as owner in WikiBot
    try {
      const owner = await guild.fetchOwner();
      if (owner) {
        await apiClient.post('/api/v1/members/initialize-owner', {
          serverId: guild.id,
          userId: owner.id,
          userData: {
            username: owner.user.username,
            discriminator: owner.user.discriminator || '0',
            avatar: owner.user.avatar,
          },
        });
        console.log(`✅ Added server owner ${owner.user.username} as WikiBot owner`);
      }
    } catch (ownerError) {
      console.error(`⚠️ Failed to add server owner (non-critical):`, ownerError);
    }
  } catch (error) {
    console.error(`❌ Failed to create database entry:`, error);
  }
});

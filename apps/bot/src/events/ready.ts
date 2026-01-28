import { Events } from 'discord.js';

import { client } from '../index';

client.once(Events.ClientReady, c => {
  console.log(`✅ Bot ready! Logged in as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} servers`);

  // Set presence
  c.user.setPresence({
    activities: [{ name: '/wiki help' }],
    status: 'online',
  });
});

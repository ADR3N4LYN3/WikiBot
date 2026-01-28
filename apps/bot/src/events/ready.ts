import { ActivityType, Events } from 'discord.js';

import { client } from '../index';

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

  // Initial status
  rotateStatus();

  // Rotate status every 30 seconds
  setInterval(rotateStatus, 30000);

  // Update article count every 5 minutes
  updateArticleCount();
  setInterval(updateArticleCount, 300000);
});

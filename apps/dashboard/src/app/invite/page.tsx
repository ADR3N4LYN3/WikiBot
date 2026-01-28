import { redirect } from 'next/navigation';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID;
const BOT_PERMISSIONS = '274878024704';
const SCOPES = 'bot applications.commands';

export default function InvitePage() {
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=${BOT_PERMISSIONS}&scope=${encodeURIComponent(SCOPES)}`;

  redirect(inviteUrl);
}

export const metadata = {
  title: 'Invite WikiBot',
  description: 'Add WikiBot to your Discord server',
};

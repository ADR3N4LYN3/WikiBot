import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invite WikiBot',
  description: 'Add WikiBot to your Discord server',
};

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID;
const BOT_PERMISSIONS = '274878024704';
const SCOPES = 'bot applications.commands';

export default function InvitePage() {
  // If no client ID is configured, show a message
  if (!DISCORD_CLIENT_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Bot Invite</h1>
          <p className="text-muted-foreground">
            Discord Client ID is not configured. Please set NEXT_PUBLIC_DISCORD_CLIENT_ID in your environment.
          </p>
        </div>
      </div>
    );
  }

  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=${BOT_PERMISSIONS}&scope=${encodeURIComponent(SCOPES)}`;

  redirect(inviteUrl);
}

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Server, Loader2 } from 'lucide-react';

interface DiscordServer {
  id: string;
  name: string;
  icon: string | null;
}

export function ServerSelector() {
  const [servers, setServers] = useState<DiscordServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<DiscordServer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load selected server from localStorage
    const savedServerId = localStorage.getItem('selectedServerId');
    const savedServerName = localStorage.getItem('selectedServerName');
    const savedServerIcon = localStorage.getItem('selectedServerIcon');

    if (savedServerId && savedServerName) {
      setSelectedServer({ id: savedServerId, name: savedServerName, icon: savedServerIcon });
    }

    // Fetch user's Discord servers from API
    async function fetchServers() {
      try {
        setLoading(true);
        const response = await fetch('/api/servers');

        if (!response.ok) {
          throw new Error('Failed to fetch servers');
        }

        const data = await response.json();
        setServers(data.servers || []);

        // If no server is selected but we have servers, select the first one
        if (!savedServerId && data.servers?.length > 0) {
          const firstServer = data.servers[0];
          setSelectedServer(firstServer);
          localStorage.setItem('selectedServerId', firstServer.id);
          localStorage.setItem('selectedServerName', firstServer.name);
          localStorage.setItem('selectedServerIcon', firstServer.icon || '');
        }
      } catch (err) {
        console.error('Error fetching servers:', err);
        setError('Failed to load servers');
      } finally {
        setLoading(false);
      }
    }

    fetchServers();
  }, []);

  const selectServer = (server: DiscordServer) => {
    setSelectedServer(server);
    localStorage.setItem('selectedServerId', server.id);
    localStorage.setItem('selectedServerName', server.name);
    localStorage.setItem('selectedServerIcon', server.icon || '');
    setIsOpen(false);
    // Reload to refresh data with new server
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        ) : (
          <Server className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="font-medium">
          {loading ? 'Loading...' : selectedServer?.name || 'Select a server'}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && !loading && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-64 bg-card border rounded-lg shadow-lg py-1 z-20">
            <div className="px-4 py-2 border-b">
              <p className="text-xs text-muted-foreground uppercase font-medium">
                Your servers
              </p>
            </div>
            <div className="max-h-64 overflow-auto">
              {servers.map((server) => (
                <button
                  key={server.id}
                  onClick={() => selectServer(server)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${
                    selectedServer?.id === server.id ? 'bg-muted' : ''
                  }`}
                >
                  {server.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                      alt={server.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-medium">
                      {server.name[0]}
                    </div>
                  )}
                  <span className="font-medium">{server.name}</span>
                </button>
              ))}
            </div>
            {error && (
              <p className="px-4 py-3 text-sm text-red-500">
                {error}
              </p>
            )}
            {!error && servers.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No servers found. Invite the bot to a server first.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

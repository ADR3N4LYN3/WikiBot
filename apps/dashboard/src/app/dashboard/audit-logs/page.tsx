'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  ScrollText,
  Filter,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Settings,
  Users,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react';

import { auditLogsApi } from '@/lib/api';

interface AuditLog {
  id: string;
  serverId: string;
  actorId: string;
  action: string;
  entityType: 'article' | 'category' | 'settings' | 'member';
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

const entityTypeConfig = {
  article: { icon: FileText, label: 'Article', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  category: { icon: FolderOpen, label: 'Category', color: 'text-green-500', bg: 'bg-green-500/10' },
  settings: { icon: Settings, label: 'Settings', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  member: { icon: Users, label: 'Member', color: 'text-orange-500', bg: 'bg-orange-500/10' },
};

const actionLabels: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  settings_change: 'Changed settings',
  member_add: 'Added member',
  member_remove: 'Removed member',
  member_role_change: 'Changed role',
  ownership_transfer: 'Transferred ownership',
};

function LogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const config = entityTypeConfig[log.entityType] || entityTypeConfig.article;
  const EntityIcon = config.icon;
  const actionLabel = actionLabels[log.action] || log.action;

  let details: Record<string, unknown> | null = null;
  try {
    if (log.details) {
      details = JSON.parse(log.details);
    }
  } catch {
    // Invalid JSON, ignore
  }

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <EntityIcon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">
            <span className="text-muted-foreground">{log.actor.username}</span>
            {' '}
            <span className="text-foreground">{actionLabel.toLowerCase()}</span>
            {' '}
            <span className={config.color}>{config.label.toLowerCase()}</span>
            {log.entityId && (
              <span className="text-muted-foreground text-sm ml-1">
                ({log.entityId.slice(0, 8)}...)
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
            <Clock className="w-3 h-3" />
            {new Date(log.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {details && (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </div>
      </button>
      {expanded && details && (
        <div className="px-4 pb-4 ml-14">
          <div className="p-3 bg-muted/30 rounded-lg text-sm font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  const [entityType, setEntityType] = useState<string>('');
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const { data, mutate, isLoading } = useSWR(
    ['audit-logs', entityType, limit, offset],
    () =>
      auditLogsApi
        .getAll({
          limit,
          offset,
          entityType: entityType as 'article' | 'category' | 'settings' | 'member' | undefined,
        })
        .then((res) => res.data as AuditLogsResponse)
  );

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const hasMore = offset + limit < total;
  const hasPrev = offset > 0;

  const handleRefresh = () => {
    mutate();
  };

  const handleNextPage = () => {
    setOffset((prev) => prev + limit);
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const handleFilterChange = (value: string) => {
    setEntityType(value);
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all changes and actions on your server
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>
        <select
          value={entityType}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-3 py-1.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All types</option>
          <option value="article">Articles</option>
          <option value="category">Categories</option>
          <option value="settings">Settings</option>
          <option value="member">Members</option>
        </select>
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground">
          {total} total {total === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Logs List */}
      <div className="bg-card rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        ) : logs.length > 0 ? (
          <div>
            {logs.map((log: AuditLog) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <ScrollText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No audit logs found</p>
            {entityType && (
              <p className="text-sm mt-1">Try removing the filter to see all logs</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {(hasPrev || hasMore) && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevPage}
            disabled={!hasPrev}
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasMore}
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-muted/30 rounded-xl">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">About Audit Logs</p>
            <p className="text-sm text-muted-foreground mt-1">
              Audit logs track all important actions on your server including article edits,
              category changes, settings updates, and member management. Only admins can view
              these logs. Logs are retained for 90 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

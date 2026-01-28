'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Palette,
  Shield,
  CreditCard,
  Download,
  Upload,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { settingsApi } from '@/lib/api';

interface Settings {
  brandColor: string;
  logoUrl: string | null;
  publicWebview: boolean;
  aiSearchEnabled: boolean;
  maxArticles: number;
  maxSearchesPerMonth: number;
}

export default function SettingsPage() {
  useSession(); // Ensure user is authenticated
  const [brandColor, setBrandColor] = useState('#5865F2');
  const [publicWebview, setPublicWebview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: settings, mutate } = useSWR<Settings>('settings', () =>
    settingsApi.get().then((res) => res.data)
  );

  // Sync state with fetched settings
  useEffect(() => {
    if (settings) {
      setBrandColor(settings.brandColor);
      setPublicWebview(settings.publicWebview);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await settingsApi.update({
        brandColor,
        publicWebview,
      });
      mutate();
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const serverId = localStorage.getItem('selectedServerId');
      if (!serverId) {
        toast.error('Please select a server first');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/export/json`,
        {
          headers: {
            'X-Server-Id': serverId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wikibot-export-${serverId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Failed to export articles');
    } finally {
      setExporting(false);
    }
  };

  const hasChanges =
    settings && (brandColor !== settings.brandColor || publicWebview !== settings.publicWebview);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your WikiBot configuration</p>
      </div>

      {/* Branding */}
      <div className="bg-card p-6 rounded-xl border space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Branding</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border rounded-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Used in Discord embeds and dashboard
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Upload logo (Premium)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-card p-6 rounded-xl border space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Privacy</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Public Web View</p>
            <p className="text-sm text-muted-foreground">
              Allow anyone with a link to view articles
            </p>
          </div>
          <button
            onClick={() => setPublicWebview(!publicWebview)}
            className={`w-12 h-6 rounded-full transition-colors ${
              publicWebview ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                publicWebview ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Subscription */}
      <Link href="/dashboard/settings/billing" className="block">
        <div className="bg-card p-6 rounded-xl border hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Subscription & Billing</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your plan, view usage, and update payment methods
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </Link>

      {/* Export/Import */}
      <div className="bg-card p-6 rounded-xl border space-y-4">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Data</h2>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Articles (JSON)
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted transition-colors opacity-50 cursor-not-allowed">
            <Upload className="w-4 h-4" />
            Import (Premium)
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}

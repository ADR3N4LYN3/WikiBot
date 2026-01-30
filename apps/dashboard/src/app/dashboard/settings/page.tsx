'use client';

import { useState, useEffect, useRef } from 'react';
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
  X,
  AlertTriangle,
  CheckCircle,
  FileJson,
  Image as ImageIcon,
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

interface ServerInfo {
  premiumTier: 'free' | 'premium' | 'pro';
}

interface ImportValidation {
  valid: boolean;
  summary?: {
    categories: number;
    articles: number;
    duplicates: number;
  };
  warnings?: string[];
  errors?: Array<{ message: string }>;
}

interface ImportResult {
  success: boolean;
  imported: {
    categories: number;
    articles: number;
  };
  skipped: {
    categories: number;
    articles: number;
  };
  errors: string[];
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [brandColor, setBrandColor] = useState('#5865F2');
  const [publicWebview, setPublicWebview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<unknown>(null);
  const [importValidation, setImportValidation] = useState<ImportValidation | null>(null);
  const [importing, setImporting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: settings, mutate } = useSWR<Settings>('settings', () =>
    settingsApi.get().then((res) => res.data)
  );

  const { data: serverInfo } = useSWR<ServerInfo>('serverInfo', async () => {
    const serverId = localStorage.getItem('selectedServerId');
    if (!serverId) return { premiumTier: 'free' as const };
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/servers/${serverId}`
    );
    if (!res.ok) return { premiumTier: 'free' as const };
    return res.json();
  });

  const isPremium = serverInfo?.premiumTier && serverInfo.premiumTier !== 'free';

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
    } catch {
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
            Authorization: `Bearer ${session?.accessToken}`,
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
    } catch {
      toast.error('Failed to export articles');
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON file');
      return;
    }

    setImportFile(file);
    setImportValidation(null);
    setValidating(true);

    try {
      const content = await file.text();
      const data = JSON.parse(content);
      setImportData(data);

      // Validate with API
      const serverId = localStorage.getItem('selectedServerId');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/export/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Server-Id': serverId || '',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ data }),
        }
      );

      const validation = await response.json();
      setImportValidation(validation);
    } catch {
      toast.error('Failed to parse JSON file');
      setImportFile(null);
      setImportData(null);
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setImporting(true);
    try {
      const serverId = localStorage.getItem('selectedServerId');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/export/import`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Server-Id': serverId || '',
            'X-User-Id': session?.user?.discordId || '',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            data: importData,
            overwriteExisting,
            importCategories: true,
          }),
        }
      );

      const result: ImportResult = await response.json();

      if (result.success) {
        toast.success(
          `Imported ${result.imported.articles} articles and ${result.imported.categories} categories`
        );
        setShowImportModal(false);
        resetImportState();
      } else {
        toast.error(result.errors?.[0] || 'Import failed');
      }
    } catch {
      toast.error('Failed to import articles');
    } finally {
      setImporting(false);
    }
  };

  const resetImportState = () => {
    setImportFile(null);
    setImportData(null);
    setImportValidation(null);
    setOverwriteExisting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (PNG, JPEG, GIF, WebP, or SVG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const serverId = localStorage.getItem('selectedServerId');

      // Get presigned upload URL
      const urlResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/settings/logo/upload-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Server-Id': serverId || '',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        }
      );

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.message || 'Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await urlResponse.json();

      // Upload to S3/R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Update settings with new logo URL
      await settingsApi.update({ logoUrl: publicUrl });
      mutate();
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const serverId = localStorage.getItem('selectedServerId');
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/settings/logo`,
        {
          method: 'DELETE',
          headers: {
            'X-Server-Id': serverId || '',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      mutate();
      toast.success('Logo deleted');
    } catch {
      toast.error('Failed to delete logo');
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            {settings?.logoUrl ? (
              <div className="relative border rounded-lg p-4">
                <img
                  src={settings.logoUrl}
                  alt="Server logo"
                  className="h-16 mx-auto object-contain"
                />
                <button
                  onClick={handleDeleteLogo}
                  className="absolute top-2 right-2 p-1 bg-destructive/10 hover:bg-destructive/20 rounded"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => isPremium && logoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  isPremium ? 'cursor-pointer hover:border-primary/50' : 'opacity-50'
                }`}
              >
                {uploadingLogo ? (
                  <Loader2 className="w-6 h-6 mx-auto text-muted-foreground mb-2 animate-spin" />
                ) : (
                  <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                )}
                <p className="text-sm text-muted-foreground">
                  {isPremium ? 'Click to upload logo' : 'Upload logo (Premium)'}
                </p>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
              onChange={handleLogoUpload}
              className="hidden"
            />
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
          <button
            onClick={() => isPremium && setShowImportModal(true)}
            disabled={!isPremium}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
              isPremium ? 'hover:bg-muted' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            {isPremium ? 'Import Articles' : 'Import (Premium)'}
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Import Articles</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  resetImportState();
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Select JSON File</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50"
                >
                  {importFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileJson className="w-6 h-6 text-primary" />
                      <span className="font-medium">{importFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to select a WikiBot export file
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Validation Status */}
              {validating && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating file...
                </div>
              )}

              {importValidation && (
                <div className="space-y-3">
                  {importValidation.valid ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="w-5 h-5" />
                      File is valid
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      File validation failed
                    </div>
                  )}

                  {importValidation.summary && (
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p>
                        <strong>Categories:</strong> {importValidation.summary.categories}
                      </p>
                      <p>
                        <strong>Articles:</strong> {importValidation.summary.articles}
                      </p>
                      {importValidation.summary.duplicates > 0 && (
                        <p className="text-amber-500">
                          <strong>Duplicates:</strong> {importValidation.summary.duplicates}
                        </p>
                      )}
                    </div>
                  )}

                  {importValidation.warnings && importValidation.warnings.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-amber-500 mb-1">Warnings:</p>
                      <ul className="text-sm text-amber-500/80 list-disc list-inside">
                        {importValidation.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Options */}
              {importValidation?.valid && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="overwrite"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="overwrite" className="text-sm">
                    Overwrite existing articles with same slug
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  resetImportState();
                }}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importValidation?.valid || importing}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

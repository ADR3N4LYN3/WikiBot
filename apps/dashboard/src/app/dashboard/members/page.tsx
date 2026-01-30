'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Crown,
  Shield,
  UserCog,
  Eye,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { membersApi } from '@/lib/api';
import type { ApiError } from '@/lib/types';

interface Member {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
}

const roleConfig = {
  owner: { label: 'Owner', icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  admin: { label: 'Admin', icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10' },
  editor: { label: 'Editor', icon: UserCog, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

function MemberRow({
  member,
  onEditRole,
  onRemove,
  currentUserRole,
}: {
  member: Member;
  onEditRole: (member: Member) => void;
  onRemove: (userId: string) => void;
  currentUserRole: string | null;
}) {
  const config = roleConfig[member.role];
  const RoleIcon = config.icon;
  const canManage = currentUserRole === 'owner' || (currentUserRole === 'admin' && member.role !== 'owner' && member.role !== 'admin');
  const isOwner = member.role === 'owner';

  return (
    <div className="flex items-center gap-4 p-4 bg-card hover:bg-muted/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {member.user.avatar ? (
          <img
            src={`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`}
            alt={member.user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <Users className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{member.user.username}</p>
        <p className="text-sm text-muted-foreground">
          Joined {new Date(member.joinedAt).toLocaleDateString()}
        </p>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
        <RoleIcon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>
      {!isOwner && canManage && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditRole(member)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Change role"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(member.userId)}
            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
            title="Remove member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [transferTargetId, setTransferTargetId] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: members, mutate } = useSWR('members', () =>
    membersApi.getAll().then((res) => res.data)
  );

  const { data: currentMember } = useSWR('members-me', () =>
    membersApi.getMe().then((res) => res.data)
  );

  const currentUserRole = currentMember?.role || null;
  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin' || isOwner;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) {
      toast.error('Please enter a Discord User ID');
      return;
    }

    setLoading(true);
    try {
      await membersApi.add({ userId: newUserId.trim(), role: newRole });
      toast.success('Member added successfully');
      mutate();
      setIsAddModalOpen(false);
      setNewUserId('');
      setNewRole('viewer');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setLoading(true);
    try {
      await membersApi.updateRole(editingMember.userId, selectedRole);
      toast.success('Role updated successfully');
      mutate();
      setIsEditModalOpen(false);
      setEditingMember(null);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await membersApi.remove(userId);
      toast.success('Member removed');
      mutate();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetId) {
      toast.error('Please select a member');
      return;
    }

    if (!confirm('Are you sure you want to transfer ownership? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await membersApi.transferOwnership(transferTargetId);
      toast.success('Ownership transferred successfully');
      mutate();
      setIsTransferModalOpen(false);
      setTransferTargetId('');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to transfer ownership');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setSelectedRole(member.role === 'owner' ? 'admin' : member.role);
    setIsEditModalOpen(true);
  };

  const admins = members?.filter((m: Member) => m.role === 'admin') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage who can access and edit your wiki
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-yellow-500/50 text-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-colors"
            >
              <Crown className="w-4 h-4" />
              Transfer Ownership
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          )}
        </div>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-xl">
        {Object.entries(roleConfig).map(([role, config]) => {
          const Icon = config.icon;
          return (
            <div key={role} className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className="text-sm">
                <strong>{config.label}</strong>
                {role === 'owner' && ' - Full control'}
                {role === 'admin' && ' - Manage members & settings'}
                {role === 'editor' && ' - Edit articles'}
                {role === 'viewer' && ' - Read only'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Members List */}
      <div className="bg-card rounded-xl border overflow-hidden">
        {members?.length ? (
          <div className="divide-y">
            {members.map((member: Member) => (
              <MemberRow
                key={member.id}
                member={member}
                onEditRole={openEditModal}
                onRemove={handleRemoveMember}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No members yet. Add members to collaborate on your wiki.</p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discord User ID</label>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="123456789012345678"
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enable Developer Mode in Discord to copy user IDs
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="viewer">Viewer - Read only</option>
                  <option value="editor">Editor - Can edit articles</option>
                  <option value="admin">Admin - Full management access</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Change Role</h2>
            <p className="text-muted-foreground mb-4">
              Update role for <strong>{editingMember.user.username}</strong>
            </p>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="viewer">Viewer - Read only</option>
                  <option value="editor">Editor - Can edit articles</option>
                  {isOwner && <option value="admin">Admin - Full management access</option>}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-xl w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <h2 className="text-xl font-bold">Transfer Ownership</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              This will transfer full ownership of the server. You will become an admin.
              This action cannot be undone.
            </p>
            <form onSubmit={handleTransferOwnership} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Transfer to</label>
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select an admin...</option>
                  {admins.map((admin: Member) => (
                    <option key={admin.userId} value={admin.userId}>
                      {admin.user.username}
                    </option>
                  ))}
                </select>
                {admins.length === 0 && (
                  <p className="text-xs text-yellow-500 mt-1">
                    You need at least one admin to transfer ownership
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || admins.length === 0}
                  className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Transfer Ownership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ticketAPI, userAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { WatcherUser } from '@/types/ticket.types';
import type { User } from '@/types/user.types';
import { Eye, EyeOff, Plus, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { API_CONSTANTS } from '@/constants';

interface WatchersPanelProps {
  ticketId: string;
  onUpdate: () => void;
}

export default function WatchersPanel({ ticketId, onUpdate }: WatchersPanelProps) {
  const { user } = useAuth();
  const [watchers, setWatchers] = useState<WatcherUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadWatchers();
  }, [ticketId]);

  const loadWatchers = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getWatchers(ticketId);
      setWatchers(response.watchers);
    } catch (err) {
      console.error('Error loading watchers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll({ limit: API_CONSTANTS.DEFAULT_PAGE_SIZE });
      setUsers(response.users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleAddWatcher = async (userId: string) => {
    try {
      setAdding(true);
      await ticketAPI.addWatcher(ticketId, userId);
      await loadWatchers();
      setShowAddModal(false);
      onUpdate();
    } catch (err) {
      console.error('Error adding watcher:', err);
      alert('Failed to add watcher');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveWatcher = async (userId: string) => {
    if (!confirm('Remove this watcher?')) return;

    try {
      await ticketAPI.removeWatcher(ticketId, userId);
      await loadWatchers();
      onUpdate();
    } catch (err) {
      console.error('Error removing watcher:', err);
      alert('Failed to remove watcher');
    }
  };

  const handleToggleWatch = async () => {
    if (!user) return;

    const isWatching = watchers.some(w => w.id === user.id);
    
    try {
      if (isWatching) {
        await ticketAPI.removeWatcher(ticketId, user.id);
      } else {
        await ticketAPI.addWatcher(ticketId, user.id);
      }
      await loadWatchers();
      onUpdate();
    } catch (err) {
      console.error('Error toggling watch:', err);
      alert('Failed to update watch status');
    }
  };

  const isWatching = user && watchers.some(w => w.id === user.id);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggleWatch}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
            isWatching
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          {isWatching ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {isWatching ? 'Watching' : 'Watch'}
        </button>
        <button
          onClick={() => {
            loadUsers();
            setShowAddModal(true);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-200"
          title="Add watcher"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {watchers.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6 italic">No watchers yet</p>
      ) : (
        <div className="space-y-2">
          {watchers.map((watcher) => (
            <div
              key={watcher.id}
              className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase shadow-sm">
                  {watcher.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">{watcher.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{watcher.email}</p>
                </div>
              </div>
              {user && user.id === watcher.id && (
                <button
                  onClick={() => handleRemoveWatcher(watcher.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  title="Remove watcher"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Watcher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Soft Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowAddModal(false)} 
          />

          {/* Modal Container */}
          <div 
            className="relative bg-white w-full max-w-md max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Top Header - Minimalist */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-50 rounded-md border border-slate-100">
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Add Watcher
                </span>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {users
                  .filter(u => !watchers.some(w => w.id === u.id))
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddWatcher(user.id)}
                      disabled={adding}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left disabled:opacity-50 border border-slate-100"
                    >
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

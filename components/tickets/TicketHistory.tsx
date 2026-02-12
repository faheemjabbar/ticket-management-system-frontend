'use client';

import { useState, useEffect } from 'react';
import { Clock, User, Activity } from 'lucide-react';
import { historyAPI, HistoryEntry } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface TicketHistoryProps {
  ticketId: string;
}

export function TicketHistory({ ticketId }: TicketHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [ticketId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await historyAPI.getByTicketId(ticketId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load ticket history');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('created')) return '🎉';
    if (action.includes('assigned')) return '👤';
    if (action.includes('status')) return '🔄';
    if (action.includes('priority')) return '⚡';
    if (action.includes('comment')) return '💬';
    if (action.includes('closed')) return '✅';
    if (action.includes('updated')) return '✏️';
    return '📝';
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'text-green-600 bg-green-50';
    if (action.includes('assigned')) return 'text-blue-600 bg-blue-50';
    if (action.includes('status')) return 'text-purple-600 bg-purple-50';
    if (action.includes('priority')) return 'text-orange-600 bg-orange-50';
    if (action.includes('closed')) return 'text-gray-600 bg-gray-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-bold text-gray-900">Activity Timeline</h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* History entries */}
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getActionColor(entry.action)}`}>
                <span className="text-lg">{getActionIcon(entry.action)}</span>
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.action}
                      </p>
                      {entry.details && (
                        <p className="text-sm text-gray-600 mt-1">
                          {entry.details}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{entry.userName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

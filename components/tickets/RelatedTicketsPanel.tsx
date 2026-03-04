'use client';

import { useState, useEffect } from 'react';
import { ticketAPI } from '@/lib/api';
import { RELATION_TYPE_LABELS } from '@/types/ticket.types';
import type { RelatedTicket } from '@/types/ticket.types';
import StatusBadge from '@/components/ui/StatusBadge';
import TypeBadge from '@/components/ui/TypeBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Link2, X } from 'lucide-react';

interface RelatedTicketsPanelProps {
  ticketId: string;
  onUpdate: () => void;
}

export default function RelatedTicketsPanel({ ticketId, onUpdate }: RelatedTicketsPanelProps) {
  const [relatedTickets, setRelatedTickets] = useState<RelatedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  useEffect(() => {
    loadRelatedTickets();
  }, [ticketId]);

  const loadRelatedTickets = async () => {
    try {
      setLoading(true);
      const tickets = await ticketAPI.getRelatedTickets(ticketId);
      // Ensure tickets is always an array
      setRelatedTickets(Array.isArray(tickets) ? tickets : []);
    } catch (err) {
      console.error('Error loading related tickets:', err);
      setRelatedTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (targetId: string, relationType: string) => {
    if (!confirm('Are you sure you want to unlink this ticket?')) return;

    try {
      setUnlinking(targetId);
      await ticketAPI.unlinkTicket(ticketId, targetId, relationType);
      await loadRelatedTickets();
      onUpdate();
    } catch (err) {
      console.error('Error unlinking ticket:', err);
      alert('Failed to unlink ticket');
    } finally {
      setUnlinking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (relatedTickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Link2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>No related tickets</p>
      </div>
    );
  }

  // Group by relationship type
  const groupedTickets = (relatedTickets || []).reduce((acc, ticket) => {
    if (!acc[ticket.relationType]) {
      acc[ticket.relationType] = [];
    }
    acc[ticket.relationType].push(ticket);
    return acc;
  }, {} as Record<string, RelatedTicket[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedTickets).map(([relationType, tickets]) => (
        <div key={relationType}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {RELATION_TYPE_LABELS[relationType] || relationType} ({tickets.length})
          </h4>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TypeBadge type={ticket.type} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
                <button
                  onClick={() => handleUnlink(ticket.id, relationType)}
                  disabled={unlinking === ticket.id}
                  className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Unlink ticket"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

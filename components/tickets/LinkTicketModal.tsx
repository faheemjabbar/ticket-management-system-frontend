'use client';

import { useState, useEffect } from 'react';
import { ticketAPI } from '@/lib/api';
import { RelationType, RELATION_TYPE_LABELS } from '@/types/ticket.types';
import type { Ticket } from '@/types/ticket.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Link2, Search } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import TypeBadge from '@/components/ui/TypeBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import BaseModal from '@/components/ui/BaseModal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { API_CONSTANTS } from '@/constants';

interface LinkTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onLink: () => void;
}

export default function LinkTicketModal({ isOpen, onClose, ticket, onLink }: LinkTicketModalProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [relationType, setRelationType] = useState<string>(RelationType.RELATES_TO);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTickets();
      setSearchTerm('');
      setSelectedTicketId('');
      setRelationType(RelationType.RELATES_TO);
      setError('');
    }
  }, [isOpen, ticket.projectId]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getAll({
        projectId: ticket.projectId,
        limit: API_CONSTANTS.DEFAULT_PAGE_SIZE,
      });
      // Filter out current ticket and already linked tickets
      const linkedIds = ticket.relatedTickets?.map(r => r.ticketId) || [];
      const available = response.tickets.filter(
        t => t.id !== ticket.id && !linkedIds.includes(t.id)
      );
      setTickets(available);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTicketId) return;

    setSubmitting(true);
    setError('');

    try {
      await ticketAPI.linkTicket(ticket.id, {
        targetTicketId: selectedTicketId,
        relationType,
      });
      onLink();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to link ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Ticket"
      subtitle={`Link "${ticket.title}" to another ticket`}
      icon={Link2}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={!selectedTicketId}>
            Link Ticket
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <FormField.Select
          label="Relationship Type"
          value={relationType}
          onChange={(e) => setRelationType(e.target.value)}
          required
        >
          {Object.entries(RELATION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FormField.Select>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Search Tickets
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-700 placeholder:text-slate-400 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Select Ticket
          </label>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner text="Loading tickets..." />
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto custom-scrollbar">
              {filteredTickets.length === 0 ? (
                <p className="text-center text-slate-500 py-12 text-sm">
                  {searchTerm ? 'No tickets match your search' : 'No tickets available'}
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredTickets.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="ticket"
                        value={t.id}
                        checked={selectedTicketId === t.id}
                        onChange={(e) => setSelectedTicketId(e.target.value)}
                        className="mt-1.5 w-4 h-4 text-orange-600 border-slate-300 focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 mb-2 leading-snug">{t.title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <TypeBadge type={t.type || 'task'} />
                          <StatusBadge status={t.status} />
                          <PriorityBadge priority={t.priority} />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

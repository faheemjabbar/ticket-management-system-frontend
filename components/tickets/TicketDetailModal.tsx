'use client';

import { useState, useEffect } from 'react';
import { ticketAPI, type Ticket } from '@/lib/api';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  AlignLeft, 
  MessageSquare, 
  Clock,
  Hash,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import TicketComments from '@/components/tickets/TicketComments';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface TicketDetailModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailModal({ ticketId, isOpen, onClose }: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && ticketId) {
      loadTicket();
    }
  }, [isOpen, ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await ticketAPI.getById(ticketId);
      setTicket(data);
    } catch (error) {
      toast.error('Failed to load ticket details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Soft Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header - Minimalist */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-50 rounded-md border border-slate-100">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Ticket Detail
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-white">
            <LoadingSpinner size="lg" text="Fetching details..." />
          </div>
        ) : ticket ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left Content Column (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
              <div className="max-w-3xl">
                {/* Status/Priority Row */}
                <div className="flex items-center gap-2 mb-6">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
                  {ticket.title}
                </h2>

                {/* Description Section */}
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4 text-slate-400">
                    <AlignLeft className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Description</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap prose prose-slate">
                    {ticket.description || "No description provided."}
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 mb-10" />

                {/* Comments Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Discussion</span>
                  </div>
                  <TicketComments ticketId={ticketId} />
                </div>
              </div>
            </div>

            {/* Right Sidebar Column (Static/Sticky-ish) */}
            <div className="w-full lg:w-72 bg-slate-50/50 border-l border-slate-100 p-8 space-y-8 overflow-y-auto">
              
              {/* Project Info */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Project</h4>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  {ticket.projectName}
                </div>
              </div>

              {/* People Section */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Assignee</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase shadow-sm">
                      {ticket.assignedToName?.charAt(0) || '?'}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      ticket.assignedToName ? "text-slate-700" : "text-slate-400 italic"
                    )}>
                      {ticket.assignedToName || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reporter</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                      {ticket.authorName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{ticket.authorName}</span>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              {ticket.labels && ticket.labels.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Labels</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ticket.labels.map((label, idx) => (
                      <span 
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata / Timeline */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Created
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Updated
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">{formatDate(ticket.updatedAt)}</span>
                </div>
                {ticket.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3" /> Deadline
                    </span>
                    <span className="text-[11px] font-medium text-orange-600">{formatDate(ticket.deadline)}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="p-20 text-center text-slate-500 text-sm">Ticket not found.</div>
        )}
      </div>
    </div>
  );
}
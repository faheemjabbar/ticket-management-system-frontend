'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTickets } from '@/hooks/useTickets';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import EmptyState from '@/components/common/EmptyState';
import { Search, Plus, Filter, Eye, Ticket } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TicketsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { tickets, loading, fetchTickets } = useTickets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.projectName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const handleCreateTicket = () => {
    router.push('/tickets/create');
  };

  const handleViewTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}/edit`);
  };

  if (loading && tickets.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Tickets</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage and track all tickets across projects
              </p>
            </div>
            {(user?.role === 'project-manager' || user?.role === 'qa') && (
              <button
                onClick={handleCreateTicket}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Ticket
              </button>
            )}
          </div>
                    {/* Summary Stats */}
          {tickets.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Total</div>
                    <div className="text-xl font-semibold text-gray-900 tabular-nums">{tickets.length}</div>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 rounded flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Pending</div>
                    <div className="text-xl font-semibold text-orange-600 tabular-nums">
                      {tickets.filter(t => t.status === 'pending').length}
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-orange-50 rounded flex items-center justify-center">
                    <Filter className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">In Progress</div>
                    <div className="text-xl font-semibold text-blue-600 tabular-nums">
                      {tickets.filter(t => t.status === 'assigned' || t.status === 'awaiting').length}
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 rounded flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Closed</div>
                    <div className="text-xl font-semibold text-green-600 tabular-nums">
                      {tickets.filter(t => t.status === 'closed').length}
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-green-50 rounded flex items-center justify-center">
                    <Filter className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded border border-gray-200 p-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="w-32">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="awaiting">Awaiting</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="w-32">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-600">
                <Filter className="w-3 h-3" />
                <span>
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="text-orange-600 hover:underline ml-1 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title={searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ? "No tickets found" : "No tickets yet"}
              description={
                searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? "Try adjusting your filters or search query"
                  : "Create your first ticket to get started"
              }
              action={(user?.role === 'project-manager' || user?.role === 'qa') ? {
                label: "Create Ticket",
                onClick: handleCreateTicket,
                icon: Plus
              } : undefined}
            />
          ) : (
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Ticket
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Project
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Priority
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Assigned To
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Created By
                      </th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-900">
                              {ticket.title}
                            </span>
                            <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                              {ticket.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-gray-900">{ticket.projectName}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-3 py-2.5">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-gray-900">
                            {ticket.assignedToName || (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-gray-900">{ticket.authorName}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleViewTicket(ticket.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default TicketsPage;

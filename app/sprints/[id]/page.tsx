'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { sprintAPI } from '@/lib/api';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/context/AuthContext';
import SprintBadge from '@/components/ui/SprintBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import TypeBadge from '@/components/ui/TypeBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TicketDetailModal from '@/components/tickets/TicketDetailModal';
import type { Sprint, SprintStats } from '@/types/sprint.types';
import type { Ticket } from '@/types/ticket.types';

export default function SprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sprintId = params.id as string;
  
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [stats, setStats] = useState<SprintStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const { tickets, loading: ticketsLoading, fetchTickets } = useTickets();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sprintData, statsData] = await Promise.all([
          sprintAPI.getById(sprintId),
          sprintAPI.getStats(sprintId),
        ]);
        setSprint(sprintData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching sprint:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sprintId]);

  const sprintTickets = tickets.filter(t => t.sprintId === sprintId);

  const ticketsByStatus = {
    backlog: sprintTickets.filter(t => t.status === 'backlog'),
    todo: sprintTickets.filter(t => t.status === 'todo'),
    in_progress: sprintTickets.filter(t => t.status === 'in_progress'),
    in_review: sprintTickets.filter(t => t.status === 'in_review'),
    qa_testing: sprintTickets.filter(t => t.status === 'qa_testing'),
    done: sprintTickets.filter(t => t.status === 'done'),
    blocked: sprintTickets.filter(t => t.status === 'blocked'),
  };

  if (loading || ticketsLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading sprint..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!sprint) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Sprint not found</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const progressPercentage = stats ? Math.round(stats.progress) : 0;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-5">
          <button
            onClick={() => router.back()}
            className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            ← Back
          </button>

        <div className="bg-white rounded border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{sprint.name}</h1>
                <SprintBadge status={sprint.status} />
              </div>
              <p className="text-gray-600">{sprint.goal}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">
                {new Date(sprint.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">
                {new Date(sprint.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium">{sprint.capacity} points</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="font-medium">{progressPercentage}%</p>
            </div>
          </div>

          {stats && (
            <>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {stats.completedStoryPoints} / {stats.totalStoryPoints} points completed
                  </span>
                  <span className="text-gray-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.todoTickets}</p>
                  <p className="text-sm text-gray-600">To Do</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgressTickets}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.completedTickets}</p>
                  <p className="text-sm text-gray-600">Done</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{stats.blockedTickets}</p>
                  <p className="text-sm text-gray-600">Blocked</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {Object.entries(ticketsByStatus).map(([status, tickets]) => (
            <div key={status} className="bg-white rounded border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                {status.replace('_', ' ')} ({tickets.length})
              </h3>
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {ticket.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <TypeBadge type={ticket.type} />
                      <PriorityBadge priority={ticket.priority} />
                      {ticket.storyPoints && (
                        <span className="text-xs text-gray-600">
                          {ticket.storyPoints} pts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No tickets</p>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
      </DashboardLayout>

      {selectedTicket && (
        <TicketDetailModal
          ticketId={selectedTicket.id}
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </ProtectedRoute>
  );
}

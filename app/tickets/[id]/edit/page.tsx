'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TicketForm from '@/components/tickets/TicketForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ticketAPI, type Ticket } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminRedirect } from '@/hooks/useAdminRedirect';

export default function EditTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  useAdminRedirect();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  // Load ticket data
  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true);
        const ticketData = await ticketAPI.getById(ticketId);
        setTicket(ticketData);
      } catch {
        toast.error('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading ticket..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 mb-4">The ticket you're trying to edit doesn't exist.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Back to Dashboard
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.push(`/tickets/${ticketId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Ticket</span>
              </button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Ticket</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Update ticket details - #{ticket.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <TicketForm
                mode="edit"
                ticketId={ticketId}
                initialData={{
                  title: ticket.title,
                  description: ticket.description,
                  priority: ticket.priority,
                  projectId: ticket.projectId,
                  labels: ticket.labels,
                  assignedToId: ticket.assignedToId,
                  deadline: ticket.deadline?.split('T')[0], // Convert to YYYY-MM-DD format
                }}
              />
            </div>
          </div>
        </DashboardLayout>
    </ProtectedRoute>
  );
}

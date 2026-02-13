'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TicketForm from '@/components/tickets/TicketForm';
import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateTicketPage() {
  const router = useRouter();
  useAdminRedirect(); // Use custom hook instead of manual redirect

  return (
    <ProtectedRoute>
      <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
              <p className="text-sm text-gray-600 mt-1">
                Fill in the details below to create a new ticket
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <TicketForm mode="create" />
            </div>
          </div>
        </DashboardLayout>
    </ProtectedRoute>
  );
}

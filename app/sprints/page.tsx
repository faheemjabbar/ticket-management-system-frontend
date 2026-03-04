'use client';

import { useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSprints } from '@/hooks/useSprints';
import { useAuth } from '@/context/AuthContext';
import SprintBadge from '@/components/ui/SprintBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import type { Sprint } from '@/types/sprint.types';

// Lazy load heavy modal component
const SprintModal = lazy(() => import('@/components/sprints/SprintModal'));

export default function SprintsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { sprints, loading, createSprint, updateSprint, deleteSprint } = useSprints();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Sprint | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const canManageSprints = user?.role === 'project-manager';

  const filteredSprints = sprints.filter(sprint => {
    if (statusFilter === 'all') return true;
    return sprint.status === statusFilter;
  });

  const handleCreate = () => {
    setSelectedSprint(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedSprint) {
      await updateSprint(selectedSprint.id, data);
    } else {
      await createSprint(data);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteSprint(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading sprints..." />
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
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Sprints</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your project sprints and iterations
              </p>
            </div>
            {canManageSprints && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Sprint
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Sprints</div>
                  <div className="text-xl font-semibold text-gray-900 tabular-nums">{sprints.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Planning</div>
                  <div className="text-xl font-semibold text-gray-600 tabular-nums">
                    {sprints.filter(s => s.status === 'planning').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Active</div>
                  <div className="text-xl font-semibold text-blue-600 tabular-nums">
                    {sprints.filter(s => s.status === 'active').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Completed</div>
                  <div className="text-xl font-semibold text-green-600 tabular-nums">
                    {sprints.filter(s => s.status === 'completed').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded border border-gray-200 p-3">
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('planning')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'planning'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Planning
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Sprints List */}
          {filteredSprints.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No sprints found"
              description={
                statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No sprints created yet'
              }
              action={canManageSprints ? {
                label: 'Create Sprint',
                onClick: handleCreate,
                icon: Plus
              } : undefined}
            />
          ) : (
            <div className="space-y-3">
              {filteredSprints.map((sprint) => {
                const daysRemaining = getDaysRemaining(sprint.endDate);
                const isActive = sprint.status === 'active';

                return (
                  <div
                    key={sprint.id}
                    className="bg-white rounded border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                    onClick={() => router.push(`/sprints/${sprint.id}`)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {sprint.name}
                            </h3>
                            <SprintBadge status={sprint.status} />
                          </div>
                          <p className="text-xs text-gray-600">{sprint.goal}</p>
                        </div>
                        {canManageSprints && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEdit(sprint)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Edit sprint"
                            >
                              <Edit className="w-3 h-3 text-gray-600" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(sprint)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete sprint"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Start Date</p>
                          <p className="text-xs font-medium text-gray-900">{formatDate(sprint.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">End Date</p>
                          <p className="text-xs font-medium text-gray-900">{formatDate(sprint.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Capacity</p>
                          <p className="text-xs font-medium text-gray-900">{sprint.capacity} points</p>
                        </div>
                        {isActive && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Days Remaining</p>
                            <p className={`text-xs font-medium ${daysRemaining < 3 ? 'text-red-600' : 'text-gray-900'}`}>
                              {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <SprintModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            sprint={selectedSprint}
          />
        </Suspense>

        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Sprint"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

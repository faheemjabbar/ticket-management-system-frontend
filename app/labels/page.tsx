'use client';

import { useState, lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLabels } from '@/hooks/useLabels';
import { useAuth } from '@/context/AuthContext';
import LabelBadge from '@/components/ui/LabelBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';
import { LABEL_CATEGORY_LABELS } from '@/types/label.types';
import type { Label } from '@/types/label.types';

// Lazy load heavy modal component
const LabelModal = lazy(() => import('@/components/labels/LabelModal'));

export default function LabelsPage() {
  const { user } = useAuth();
  const { labels, loading, createLabel, updateLabel, deleteLabel } = useLabels();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Label | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const canManageLabels = user?.role === 'project-manager';

  const filteredLabels = labels.filter(label => {
    if (categoryFilter === 'all') return true;
    return label.category === categoryFilter;
  });

  const handleCreate = () => {
    setSelectedLabel(null);
    setIsModalOpen(true);
  };

  const handleEdit = (label: Label) => {
    setSelectedLabel(label);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedLabel) {
      await updateLabel(selectedLabel.id, data);
    } else {
      await createLabel(data);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteLabel(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading labels..." />
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
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Labels</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Organize and categorize your tickets with labels
              </p>
            </div>
            {canManageLabels && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Label
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Labels</div>
                  <div className="text-xl font-semibold text-gray-900 tabular-nums">{labels.length}</div>
                </div>
              </div>
            </div>
            {Object.entries(LABEL_CATEGORY_LABELS).slice(0, 4).map(([value, label]) => (
              <div key={value} className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
                    <div className="text-xl font-semibold text-gray-900 tabular-nums">
                      {labels.filter(l => l.category === value).length}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded border border-gray-200 p-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {Object.entries(LABEL_CATEGORY_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setCategoryFilter(value)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    categoryFilter === value
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Labels List */}
          {filteredLabels.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No labels found"
              description={
                categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No labels created yet'
              }
              action={canManageLabels ? {
                label: 'Create Label',
                onClick: handleCreate,
                icon: Plus
              } : undefined}
            />
          ) : (
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filteredLabels.map((label) => (
                  <div
                    key={label.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <LabelBadge name={label.name} color={label.color} />
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                            {LABEL_CATEGORY_LABELS[label.category]}
                          </span>
                        </div>
                        {label.description && (
                          <p className="text-xs text-gray-600 mb-1">{label.description}</p>
                        )}
                        <p className="text-[10px] text-gray-500">
                          Project: {label.projectName || 'Unknown'}
                        </p>
                      </div>
                      {canManageLabels && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(label)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Edit label"
                          >
                            <Edit className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(label)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete label"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <LabelModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            label={selectedLabel}
          />
        </Suspense>

        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Label"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

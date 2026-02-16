'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { organizationAPI, type Organization } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Users,
  FolderKanban
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import OrganizationModal from '@/components/organizations/OrganizationModal';

export default function OrganizationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load organizations
  useEffect(() => {
    if (user?.role === 'admin') {
      loadOrganizations();
    }
  }, [user]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationAPI.getAll();
      setOrganizations(data);
    } catch {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const handleDeleteOrg = (org: Organization) => {
    setOrgToDelete(org);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orgToDelete) return;
    
    try {
      setIsDeleting(true);
      await organizationAPI.delete(orgToDelete.id);
      setOrganizations(prev => prev.filter(o => o.id !== orgToDelete.id));
      toast.success(`Organization "${orgToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setOrgToDelete(null);
    } catch {
      toast.error('Failed to delete organization');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading organizations..." />
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
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Organizations</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage organizations and tenants
              </p>
            </div>

            <button
              onClick={handleCreateOrg}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Organization
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Total Organizations
                  </div>
                  <div className="text-xl font-semibold text-gray-900 tabular-nums">
                    {organizations.length}
                  </div>
                </div>
                <Building2 className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Active
                  </div>
                  <div className="text-xl font-semibold text-green-600 tabular-nums">
                    {organizations.filter(o => o.isActive).length}
                  </div>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Inactive
                  </div>
                  <div className="text-xl font-semibold text-gray-600 tabular-nums">
                    {organizations.filter(o => !o.isActive).length}
                  </div>
                </div>
                <FolderKanban className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded border border-gray-200 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/organizations/${org.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{org.name}</h3>
                      <span className={`text-[10px] ${org.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {org.description || 'No description'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-[10px] text-gray-500">
                    Created {new Date(org.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditOrg(org);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Edit organization"
                    >
                      <Edit className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrg(org);
                      }}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete organization"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOrgs.length === 0 && (
            <div className="bg-white rounded border border-gray-200 p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">No organizations found</p>
              <p className="text-xs text-gray-500 mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Create your first organization to get started'}
              </p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Organization"
          message={`Are you sure you want to delete "${orgToDelete?.name}"? This will affect all users and projects in this organization.`}
          confirmText="Delete Organization"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />

        {/* Organization Modal */}
        <OrganizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          organization={editingOrg}
          onSuccess={loadOrganizations}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

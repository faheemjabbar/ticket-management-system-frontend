'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { organizationAPI, userAPI, type Organization, type User } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Building2, 
  ArrowLeft,
  Calendar,
  Shield,
  Mail,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OrganizationDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projectManager, setProjectManager] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load organization details
  useEffect(() => {
    if (user?.role === 'admin' && orgId) {
      const controller = new AbortController();
      loadOrganizationDetails();
      
      return () => {
        controller.abort();
      };
    }
  }, [user, orgId]);

  const loadOrganizationDetails = async () => {
    try {
      setLoading(true);
      
      // Load organization
      const orgData = await organizationAPI.getById(orgId);
      setOrganization(orgData);

      // Load only project managers from this organization (more efficient than loading all 1000 users)
      const usersResponse = await userAPI.getAll({ 
        role: 'project-manager',
        limit: 10 
      });
      const pm = usersResponse.users.find(u => 
        u.organization?.id === orgId
      );
      setProjectManager(pm || null);

    } catch (error: any) {
      // Error already handled by axios interceptor
      console.error('Failed to load organization:', error);
      router.push('/organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!organization) return;
    
    try {
      setIsToggling(true);
      const updatedOrg = await organizationAPI.update(organization.id, {
        isActive: !organization.isActive
      });
      setOrganization(updatedOrg);
      toast.success(`Organization ${updatedOrg.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      // Error already handled by axios interceptor
      console.error('Failed to toggle organization status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading organization details..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!organization) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Building2 className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Not Found</h2>
            <p className="text-sm text-gray-600 mb-4">The organization you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/organizations')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
            >
              Back to Organizations
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-5">
          {/* Header */}
          <div>
            <button
              onClick={() => router.push('/organizations')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 mb-3 text-xs font-medium"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Organizations
            </button>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{organization.name}</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    {organization.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Toggle Status Button */}
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`px-4 py-2 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  organization.isActive
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                }`}
              >
                {isToggling ? 'Updating...' : organization.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>

          {/* Organization Info & Project Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Organization Information */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Organization Information</h2>
              
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Description
                  </div>
                  <p className="text-xs text-gray-900">
                    {organization.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created Date
                  </div>
                  <p className="text-xs text-gray-900">
                    {formatDate(organization.createdAt)}
                  </p>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last Updated
                  </div>
                  <p className="text-xs text-gray-900">
                    {formatDate(organization.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Manager */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-orange-600" />
                Project Manager
              </h2>
              
              {projectManager ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-sm">
                        {projectManager.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{projectManager.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Project Manager
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </div>
                    <p className="text-xs text-gray-900">{projectManager.email}</p>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Status
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      projectManager.isActive 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {projectManager.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {projectManager.lastLogin && (
                    <div>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Last Login
                      </div>
                      <p className="text-xs text-gray-900">
                        {formatDate(projectManager.lastLogin)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Shield className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No project manager assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

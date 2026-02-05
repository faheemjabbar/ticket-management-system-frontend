'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { userAPI, projectAPI, type User, type Project } from '@/lib/api';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserWithProjects extends User {
  projectNames: string[];
}

export default function UsersPage() {
  // State
  const [users, setUsers] = useState<UserWithProjects[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithProjects | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load users and projects
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load users and projects in parallel
        const [usersResponse, projectsResponse] = await Promise.all([
          userAPI.getAll({ limit: 100 }),
          projectAPI.getAll({ limit: 100 })
        ]);

        setProjects(projectsResponse.projects);
        
        // Map users with their project names and filter out superadmin from regular users
        const usersWithProjects = usersResponse.users
          .filter(user => user.role !== 'superadmin') // Hide superadmin from list
          .map(user => {
            // Find projects where this user is a team member
            const userProjects = projectsResponse.projects.filter(project =>
              project.teamMembers.some(member => member.userId === user.id)
            );
            
            return {
              ...user,
              projectNames: userProjects.map(p => p.name)
            };
          });
        
        setUsers(usersWithProjects);
        
      } catch {
        toast.error('Failed to load users data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        filterStatus === 'active' ? user.isActive : !user.isActive
      );
    }

    return filtered;
  }, [users, searchQuery, filterRole, filterStatus]);

  const handleToggleStatus = async (userId: string) => {
    try {
      await userAPI.toggleStatus(userId);
      
      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      ));
      
      const user = users.find(u => u.id === userId);
      toast.success(`User ${user?.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = (user: UserWithProjects) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      await userAPI.delete(userToDelete.id);
      
      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'qa':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'developer':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading users..." />
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
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">User Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage team members and their access
                </p>
              </div>

              <button
                onClick={() => toast('Add user modal coming soon!')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add User
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Users</div>
                    <div className="text-xl font-semibold text-gray-900 tabular-nums">{users.length}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Active</div>
                    <div className="text-xl font-semibold text-green-600 tabular-nums">
                      {users.filter(u => u.isActive).length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Developers</div>
                    <div className="text-xl font-semibold text-gray-900 tabular-nums">
                      {users.filter(u => u.role === 'developer').length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">QA Team</div>
                    <div className="text-xl font-semibold text-gray-900 tabular-nums">
                      {users.filter(u => u.role === 'qa').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="qa">QA</option>
                    <option value="developer">Developer</option>
                    {/* SuperAdmin option hidden from regular users */}
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        User
                      </th>
                      <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        Role
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        Projects
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        Last Login
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">{user.name}</div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                                <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex text-gray-600 items-center px-2 py-0.5 rounded text-[10px]  uppercase tracking-wide `}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-[10px] text-gray-600 line-clamp-2 max-w-xs">
                            {user.projectNames.length > 0 ? user.projectNames.join(', ') : <span className="text-gray-400">No projects</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-medium border border-green-200">
                              <UserCheck className="w-2.5 h-2.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] font-medium border border-gray-200">
                              <UserX className="w-2.5 h-2.5" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-[10px] text-gray-600 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-gray-400" />
                            <span className="tabular-nums">{formatDate(user.lastLogin)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => toast('Edit user modal coming soon!')}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Edit user"
                            >
                              <Edit className="w-3 h-3 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? (
                                <UserX className="w-3 h-3 text-orange-600" />
                              ) : (
                                <UserCheck className="w-3 h-3 text-green-600" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UserX className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-900">No users found</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
            title="Delete User"
            message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone and will remove all user data.`}
            confirmText="Delete User"
            cancelText="Cancel"
            variant="danger"
            isLoading={isDeleting}
          />
        </DashboardLayout>
      </ProtectedRoute>
    );
}
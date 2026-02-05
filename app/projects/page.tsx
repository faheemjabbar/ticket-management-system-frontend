'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { projectAPI, ticketAPI, type Project } from '@/lib/api';
import ProjectModal from '@/components/projects/ProjectModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Search, 
  Plus, 
  Folder,
  Users,
  Calendar,
  CheckCircle2,
  Archive,
  Clock,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProjectWithStats extends Project {
  ticketCount: {
    total: number;
    pending: number;
    assigned: number;
    closed: number;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  
  // State
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load projects and their ticket stats
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        
        // Get all projects
        const projectsResponse = await projectAPI.getAll({ limit: 100 });
        
        // Get ticket counts for each project
        const projectsWithStats = await Promise.all(
          projectsResponse.projects.map(async (project) => {
            try {
              const ticketsResponse = await ticketAPI.getAll({ 
                projectId: project.id,
                limit: 1000 
              });
              
              const tickets = ticketsResponse.tickets;
              const ticketCount = {
                total: tickets.length,
                pending: tickets.filter(t => t.status === 'pending').length,
                assigned: tickets.filter(t => t.status === 'assigned').length,
                closed: tickets.filter(t => t.status === 'closed').length,
              };
              
              return { ...project, ticketCount };
            } catch {
              return { 
                ...project, 
                ticketCount: { total: 0, pending: 0, assigned: 0, closed: 0 } 
              };
            }
          })
        );
        
        setProjects(projectsWithStats);
        
      } catch {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      archived: projects.filter(p => p.status === 'archived').length,
    };
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    return filtered;
  }, [projects, searchQuery, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-semibold uppercase tracking-wide border border-green-200">
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold uppercase tracking-wide border border-blue-200">
            Completed
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] font-semibold uppercase tracking-wide border border-gray-200">
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    setModalMode('create');
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: ProjectWithStats) => {
    setModalMode('edit');
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (project: ProjectWithStats) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      setIsDeleting(true);
      await projectAPI.delete(projectToDelete.id);
      
      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      
      toast.success(`Project "${projectToDelete.name}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
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
          <LoadingSpinner size="lg" text="Loading projects..." />
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
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Projects</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage and organize your projects
                </p>
              </div>

              <button
                onClick={handleCreateProject}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Project
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Total</div>
                    <div className="text-xl font-semibold text-gray-900 tabular-nums">{stats.total}</div>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 rounded flex items-center justify-center">
                    <Folder className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Active</div>
                    <div className="text-xl font-semibold text-green-600 tabular-nums">{stats.active}</div>
                  </div>
                  <div className="w-9 h-9 bg-green-50 rounded flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Completed</div>
                    <div className="text-xl font-semibold text-blue-600 tabular-nums">{stats.completed}</div>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 rounded flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Archived</div>
                    <div className="text-xl font-semibold text-gray-600 tabular-nums">{stats.archived}</div>
                  </div>
                  <div className="w-9 h-9 bg-gray-50 rounded flex items-center justify-center">
                    <Archive className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="w-40">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-3 gap-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group"
                  onClick={() => handleViewProject(project.id)}
                >
                  {/* Card Header */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-orange-50 rounded flex items-center justify-center flex-shrink-0">
                          <Folder className="w-4 h-4 text-orange-600" />
                        </div>
                        <h3 className="text-xs font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                          {project.name}
                        </h3>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <Users className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span>{project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(project.startDate)} {project.endDate && `— ${formatDate(project.endDate)}`}
                      </span>
                    </div>

                    {/* Ticket Stats */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900 tabular-nums">{project.ticketCount.total}</div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-orange-600 tabular-nums">{project.ticketCount.pending}</div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-blue-600 tabular-nums">{project.ticketCount.assigned}</div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">Assigned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-green-600 tabular-nums">{project.ticketCount.closed}</div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">Closed</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProject(project.id);
                      }}
                      className="text-[10px] font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </button>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Edit project"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project);
                        }}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="bg-white rounded border border-gray-200 p-8 text-center">
                <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No projects found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first project'}
                </p>
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            )}
          </div>

          {/* Project Modal */}
          <ProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            project={selectedProject}
            mode={modalMode}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Project"
            message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone and will remove all associated data.`}
            confirmText="Delete Project"
            cancelText="Cancel"
            variant="danger"
            isLoading={isDeleting}
          />
        </DashboardLayout>
      </ProtectedRoute>
    );
}
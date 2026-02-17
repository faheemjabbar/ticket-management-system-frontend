'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { projectAPI, ticketAPI, type Project, type Ticket as TicketType } from '@/lib/api';
import ProjectModal from '@/components/projects/ProjectModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft,
  Edit,
  Archive,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Ticket,
  User,
  Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  // State
  const [project, setProject] = useState<Project | null>(null);
  const [projectTickets, setProjectTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'team'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load project and tickets data
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        
        // Load project and its tickets in parallel
        const [projectData, ticketsResponse] = await Promise.all([
          projectAPI.getById(projectId),
          ticketAPI.getAll({ projectId, limit: 1000 })
        ]);

        setProject(projectData);
        setProjectTickets(ticketsResponse.tickets);
        
      } catch {
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // Calculate ticket counts
  const ticketCounts = useMemo(() => {
    return {
      total: projectTickets.length,
      pending: projectTickets.filter(t => t.status === 'pending').length,
      assigned: projectTickets.filter(t => t.status === 'assigned').length,
      closed: projectTickets.filter(t => t.status === 'closed').length,
    };
  }, [projectTickets]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading project..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-96">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
              <p className="text-sm text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
              <button
                onClick={() => router.push('/projects')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-semibold"
              >
                Back to Projects
              </button>
            </div>
          </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-300">
            <Clock className="w-3 h-3" />
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-300">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-300">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/projects')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(project.status)}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold transition-all"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                  <div className='text-gray-600'>Edit</div>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Total Tickets</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{ticketCounts.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Pending</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{ticketCounts.pending}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Assigned</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{ticketCounts.assigned}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Closed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{ticketCounts.closed}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex gap-6 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === 'tickets'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tickets ({projectTickets.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('team')}
                    className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === 'team'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Team ({project.teamMembers.length})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Project Info */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase">Project Information</h3>
                        <div className="space-y-3">
                          {project.organization && (
                            <div className="flex items-center gap-3">
                              <Building2 className="w-4 h-4 text-orange-600" />
                              <div>
                                <p className="text-xs text-gray-600">Organization</p>
                                <p className="text-sm font-semibold text-gray-900">{project.organization.name}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600">Start Date</p>
                              <p className="text-sm font-semibold text-gray-600">{formatDate(project.startDate)}</p>
                            </div>
                          </div>
                          {project.endDate && (
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-xs text-gray-600">End Date</p>
                                <p className="text-sm font-semibold text-gray-600">{formatDate(project.endDate)}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600">Team Size</p>
                              <p className="text-sm font-semibold text-gray-600">{project.teamMembers.length} members</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase">Description</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                  <div className="space-y-3">
                    {projectTickets.length > 0 ? (
                      projectTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-gray-900 mb-1">{ticket.title}</h4>
                              <p className="text-xs text-gray-600 line-clamp-1">{ticket.description}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <StatusBadge status={ticket.status} />
                              <PriorityBadge priority={ticket.priority} />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>#{ticket.id}</span>
                            <span>•</span>
                            <span>Created {formatDate(ticket.createdAt)}</span>
                            {ticket.assignedToName && (
                              <>
                                <span>•</span>
                                <span>Assigned to {ticket.assignedToName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No tickets in this project yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                  <div className="space-y-3">
                    {project.teamMembers.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {member.userName ? member.userName.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{member.userName || 'Unknown User'}</p>
                            <p className="text-xs text-gray-600 capitalize">{member.role}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          member.role === 'project-manager' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-300'
                            : member.role === 'qa'
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-green-100 text-green-700 border border-green-300'
                        }`}>
                          {member.role.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Project Modal */}
          <ProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            project={project}
            mode="edit"
          />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

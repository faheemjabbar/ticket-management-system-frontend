'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ticketAPI, projectAPI, type Ticket, type Project } from '@/lib/api';
import PriorityBadge from '@/components/ui/PriorityBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Search, 
  Plus, 
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type ViewMode = 'grid' | 'table';
type SortField = 'createdAt' | 'priority' | 'status' | 'title';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const statuses = [
  { id: 'all', name: 'All Statuses' },
  { id: 'pending', name: 'Pending' },
  { id: 'assigned', name: 'Assigned' },
  { id: 'awaiting', name: 'Awaiting Response' },
  { id: 'closed', name: 'Closed' },
];

const priorities = [
  { id: 'all', name: 'All Priorities' },
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
  { id: 'critical', name: 'Critical' },
];

export default function TicketsListPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<(Project & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Load data on component mount
  useEffect(() => {
    // Redirect superadmin to organizations
    if (user && user.role === 'superadmin') {
      router.push('/organizations');
      return;
    }
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load tickets and projects in parallel
        const [ticketsResponse, projectsResponse] = await Promise.all([
          ticketAPI.getAll({ limit: 1000 }), // Get all tickets for client-side filtering
          projectAPI.getAll({ limit: 100 })
        ]);

        setTickets(ticketsResponse.tickets);

        // Add "All Projects" option to projects list
        const projectsWithAll: (Project & { id: string })[] = [
          { 
            id: 'all', 
            name: 'All Projects', 
            description: '', 
            status: 'active' as const, 
            organization: { id: '', name: '' },
            createdBy: '', 
            teamMembers: [], 
            startDate: '', 
            createdAt: '', 
            updatedAt: '' 
          },
          ...projectsResponse.projects
        ];
        setProjects(projectsWithAll);
        
      } catch {
        toast.error('Failed to load tickets data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filteredTickets = [...tickets];

    // Apply filters
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.authorName.toLowerCase().includes(query) ||
        ticket.labels.some(label => label.toLowerCase().includes(query))
      );
    }

    if (selectedProject !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.projectId === selectedProject);
    }

    if (selectedStatus !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === selectedPriority);
    }

    // Apply sorting
    filteredTickets.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredTickets;
  }, [tickets, searchQuery, selectedProject, selectedStatus, selectedPriority, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredAndSortedTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleTicketClick = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  const canCreateTicket = user?.role === 'qa' || user?.role === 'admin';

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
          <LoadingSpinner size="lg" text="Loading tickets..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Public Questions</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredAndSortedTickets.length} ticket{filteredAndSortedTickets.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Create Ticket Button */}
              {canCreateTicket && (
                <button
                  onClick={() => router.push('/tickets/create')}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Ticket
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Dropdowns */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                {/* Project Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => {
                      setSelectedProject(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => {
                      setSelectedPriority(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Tickets Display */}
          {viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Title
                          {sortField === 'title' && (
                            <ChevronDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Status
                          {sortField === 'status' && (
                            <ChevronDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('priority')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Priority
                          {sortField === 'priority' && (
                            <ChevronDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Author</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Assigned To</th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Created
                          {sortField === 'createdAt' && (
                            <ChevronDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 line-clamp-1">
                              {ticket.title}
                            </span>
                            <span className="text-xs text-gray-500">{ticket.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{ticket.projectName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{ticket.authorName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {ticket.assignedToName || <span className="text-gray-400">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(ticket.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paginatedTickets.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No tickets found</p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                      {ticket.title}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">{ticket.id}</span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {ticket.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Project:</span>
                      <span className="font-medium">{ticket.projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Author:</span>
                      <span className="font-medium">{ticket.authorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Assigned:</span>
                      <span className="font-medium">{ticket.assignedToName || 'Unassigned'}</span>
                    </div>
                  </div>

                  {ticket.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-200">
                      {ticket.labels.slice(0, 3).map((label, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {label}
                        </span>
                      ))}
                      {ticket.labels.length > 3 && (
                        <span className="text-xs text-gray-500">+{ticket.labels.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {paginatedTickets.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No tickets found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTickets.length)} of{' '}
                {filteredAndSortedTickets.length} tickets
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

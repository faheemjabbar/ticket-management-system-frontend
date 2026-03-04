'use client';

import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user.types';
import { canTransitionTo } from '@/types/ticket.types';
import { Search, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import LabelBadge from '@/components/ui/LabelBadge';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ticketAPI, projectAPI, labelAPI, type Ticket as APITicket, type Project } from '@/lib/api';
import PageErrorBoundary from '@/components/common/PageErrorBoundary';
import { API_CONSTANTS, UI_CONSTANTS } from '@/constants';

// Lazy load heavy modal component
const TicketDetailModal = lazy(() => import('@/components/tickets/TicketDetailModal'));

// Dashboard ticket interface (simplified from API ticket)
interface DashboardTicket {
  id: string;
  title: string;
  description: string;
  author: string;
  time: string;
  labels: string[];
  labelObjects?: { id: string; name: string; color: string }[];
  project: string;
  projectName: string;
  status: string;
}

// Droppable Column Component
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
      {children}
    </div>
  );
}

// Sortable Ticket Card Component
function SortableTicketCard({ ticket, onClick, onCommentClick, onSelfAssign, isDeveloper, isPending }: {
  ticket: DashboardTicket;
  onClick: () => void;
  onCommentClick: () => void;
  onSelfAssign: (ticketId: string) => void;
  isDeveloper: boolean;
  isPending: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white p-2.5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-move"
    >
      {/* Ticket Title */}
      <div className="flex items-start justify-between mb-1.5">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 leading-tight">
          {ticket.title}
        </h4>
        <span className="text-[9px] text-gray-500 ml-1.5">#{ticket.id}</span>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {ticket.description}
        </p>
      )}

      {/* Labels */}
      {ticket.labelObjects && ticket.labelObjects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {ticket.labelObjects.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
                border: `1px solid ${label.color}40`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Row: Author, Time, and Action */}
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span className="font-medium">Created by {ticket.author.toUpperCase()}</span>
        <div className="flex items-center gap-1">
          <span>{ticket.time}</span>
          {isDeveloper && isPending ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelfAssign(ticket.id);
              }}
              className="text-[10px] text-orange-600 hover:text-orange-700 font-medium ml-1"
            >
              Assign yourself
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCommentClick();
              }}
              className="text-gray-400 hover:text-gray-600 ml-1"
              title="View details and comments"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to format date
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Helper function to convert API ticket to dashboard ticket
function convertToDashboardTicket(apiTicket: APITicket): DashboardTicket {
  return {
    id: apiTicket.id,
    title: apiTicket.title,
    description: apiTicket.description,
    author: apiTicket.authorName,
    time: formatRelativeTime(apiTicket.createdAt),
    labels: apiTicket.labels,
    labelObjects: apiTicket.labelObjects,
    project: apiTicket.projectId,
    projectName: apiTicket.projectName,
    status: apiTicket.status,
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  useAdminRedirect();
  
  // State
  const [tickets, setTickets] = useState<DashboardTicket[]>([]);
  const [projects, setProjects] = useState<(Project & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State to track visible ticket count per column (increased initial limit)
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({
    backlog: UI_CONSTANTS.INITIAL_VISIBLE_TICKETS,
    todo: UI_CONSTANTS.INITIAL_VISIBLE_TICKETS,
    in_progress: UI_CONSTANTS.INITIAL_VISIBLE_TICKETS,
    in_review: UI_CONSTANTS.INITIAL_VISIBLE_TICKETS,
    qa_testing: UI_CONSTANTS.INITIAL_VISIBLE_TICKETS,
    done: UI_CONSTANTS.INITIAL_VISIBLE_TICKETS,
    closed: UI_CONSTANTS.INITIAL_VISIBLE_TICKETS,
    blocked: UI_CONSTANTS.INITIAL_VISIBLE_TICKETS,
  });

  // State for project filter
  const [selectedProject, setSelectedProject] = useState('all');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Don't load if no user (logged out)
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load tickets and labels in parallel
        const [ticketsResponse, labelsResponse] = await Promise.all([
          ticketAPI.getAll({ limit: API_CONSTANTS.DEFAULT_PAGE_SIZE }),
          labelAPI.getAll({ limit: API_CONSTANTS.DEFAULT_PAGE_SIZE })
        ]);
        
        // Create a map of label IDs to label objects
        const labelMap = new Map(
          labelsResponse.labels.map(label => [label.id, label])
        );
        
        // Map tickets and populate labelObjects
        const dashboardTickets = ticketsResponse.tickets.map(ticket => {
          const dashboardTicket = convertToDashboardTicket(ticket);
          // Populate labelObjects from label IDs (map full labels to simplified format)
          dashboardTicket.labelObjects = ticket.labels
            .map(labelId => {
              const fullLabel = labelMap.get(labelId);
              if (!fullLabel) return undefined;
              return {
                id: fullLabel.id,
                name: fullLabel.name,
                color: fullLabel.color
              };
            })
            .filter((label): label is { id: string; name: string; color: string } => label !== undefined);
          return dashboardTicket;
        });
        
        setTickets(dashboardTickets);

        // Load projects only for QA and Project Manager
        if (user && (user.role === UserRole.QA || user.role === UserRole.PROJECT_MANAGER)) {
          const projectsResponse = await projectAPI.getAll({ limit: API_CONSTANTS.DEFAULT_PAGE_SIZE });
          const projectsWithAll = [
            { 
              id: 'all', 
              name: 'All Projects', 
              description: '', 
              status: 'active' as const, 
              organization: { id: '', name: '' },  // UPDATED
              createdBy: '', 
              teamMembers: [], 
              startDate: '', 
              createdAt: '', 
              updatedAt: '' 
            },
            ...projectsResponse.projects
          ];
          setProjects(projectsWithAll);
        }
        
      } catch (error) {
        // Only show error if user is still logged in
        if (user) {
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) {
      // Ticket was dropped outside any droppable area - do nothing
      return;
    }

    const activeTicket = tickets.find(t => t.id === active.id);
    const overColumn = over.id as string;

    // Validate that overColumn is a valid status (Phase 1: New statuses)
    const validStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'qa_testing', 'done', 'closed', 'blocked'];
    if (!validStatuses.includes(overColumn)) {
      return;
    }

    if (activeTicket && activeTicket.status !== overColumn) {
      // Phase 1: Validate status transition
      if (!canTransitionTo(activeTicket.status, overColumn)) {
        toast.error(`Cannot move ticket from ${formatStatus(activeTicket.status)} to ${formatStatus(overColumn)}`);
        return;
      }

      // Store original status for rollback
      const originalStatus = activeTicket.status;
      
      // Optimistically update UI
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === active.id
            ? { ...ticket, status: overColumn }
            : ticket
        )
      );

      try {
        // Update ticket status via API
        await ticketAPI.updateStatus(activeTicket.id, overColumn);
        toast.success(`Ticket moved to ${formatStatus(overColumn)}`);
      } catch (error) {
        console.error('Failed to update ticket status:', error);
        // Revert on error
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === active.id
              ? { ...ticket, status: originalStatus }
              : ticket
          )
        );
        toast.error('Failed to update ticket status');
      }
    }
  };

  const handleSeeMore = (columnId: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [columnId]: prev[columnId] + UI_CONSTANTS.TICKETS_LOAD_MORE_INCREMENT,
    }));
  };

  // Filter tickets by selected project and search query
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];
    
    // Filter by project
    if (selectedProject !== 'all') {
      filtered = filtered.filter(ticket => ticket.project === selectedProject);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(query) ||
        ticket.author.toLowerCase().includes(query) ||
        ticket.labelObjects?.some(label => label.name.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [tickets, selectedProject, searchQuery]);

  // Group tickets by status (Phase 1: Updated statuses)
  const ticketsByStatus = useMemo(() => {
    const grouped: Record<string, DashboardTicket[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      qa_testing: [],
      done: [],
      closed: [],
      blocked: [],
    };

    filteredTickets.forEach(ticket => {
      if (grouped[ticket.status]) {
        grouped[ticket.status].push(ticket);
      }
    });

    return grouped;
  }, [filteredTickets]);

  // Column definitions (Phase 1: New statuses)
  const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'in_review', title: 'In Review' },
    { id: 'qa_testing', title: 'QA Testing' },
    { id: 'done', title: 'Done' },
    { id: 'closed', title: 'Closed' },
    { id: 'blocked', title: 'Blocked' },
  ];

  // Helper function to format status for display
  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'backlog': 'Backlog',
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'in_review': 'In Review',
      'qa_testing': 'QA Testing',
      'done': 'Done',
      'closed': 'Closed',
      'blocked': 'Blocked',
    };
    return statusMap[status] || status;
  };

  // Role-based column filtering (memoized to prevent recomputation on every render)
  const roleBasedColumns = useMemo(() => {
    if (user?.role === UserRole.DEVELOPER) {
      // Developers see: backlog, todo, in_progress, in_review, done, closed
      return columns.filter(col => !['qa_testing', 'blocked'].includes(col.id));
    } else if (user?.role === UserRole.QA) {
      // QA sees all columns
      return columns;
    }
    // Project managers see all columns
    return columns;
  }, [user?.role, columns]);

  // Handle self-assignment for developers
  const handleSelfAssign = async (ticketId: string) => {
    if (!user) return;
    
    try {
      await ticketAPI.assign(ticketId, {
        assignedToId: user.id,
        assignedToName: user.name,
      });
      
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, status: 'assigned' }
            : ticket
        )
      );
      toast.success('Ticket assigned to you!');
    } catch {
      toast.error('Failed to assign ticket');
    }
  };
  
  // Handle ticket click
  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  // Handle comment icon click
  const handleCommentClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
  };

  const activeTicket = activeId ? tickets.find(t => t.id === activeId) : null;

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageErrorBoundary>
          <div className="space-y-3">
          {/* Organization Context Header */}
          {user && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ticket Dashboard</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user.role === UserRole.ADMIN 
                    ? 'Viewing all organizations' 
                    : user.organization 
                      ? `Organization: ${user.organization.name}`
                      : 'Your tickets and projects'
                  }
                </p>
              </div>
            </div>
          )}
          
          {/* Header with Search and Actions */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              {/* Project Filter Dropdown - Only for QA and Admin */}
              {user && (user.role === UserRole.QA || user.role === UserRole.ADMIN) && (
                <div className="relative">
                  <button 
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs font-medium text-black">
                      {projects.find(p => p.id === selectedProject)?.name || 'All Projects'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-black" />
                  </button>
                  
                  {isProjectDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsProjectDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        {projects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => {
                              setSelectedProject(project.id);
                              setIsProjectDropdownOpen(false);
                              // Reset visible counts when changing project
                              setVisibleCounts({
                                backlog: 10,
                                todo: 10,
                                in_progress: 10,
                                in_review: 10,
                                qa_testing: 10,
                                done: 10,
                                closed: 10,
                                blocked: 10,
                              });
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              selectedProject === project.id ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {project.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              {roleBasedColumns.map((column) => {
                const columnTickets = ticketsByStatus[column.id] || [];
                
                return (
                  <div key={column.id} className="bg-gray-50 rounded-lg p-2.5">
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-xs font-semibold text-gray-900">
                        {column.title} <span className="text-gray-500 text-[10px]">({columnTickets.length})</span>
                      </h3>
                    </div>

                    {/* Droppable Area with Scrollbar */}
                    <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                      <DroppableColumn id={column.id}>
                        <SortableContext
                          items={columnTickets.map(t => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {columnTickets.slice(0, visibleCounts[column.id]).map((ticket) => (
                            <SortableTicketCard
                              key={ticket.id}
                              ticket={ticket}
                              onClick={() => handleTicketClick(ticket.id)}
                              onCommentClick={() => handleCommentClick(ticket.id)}
                              onSelfAssign={handleSelfAssign}
                              isDeveloper={user?.role === 'developer'}
                              isPending={column.id === 'backlog' || column.id === 'todo'}
                            />
                          ))}
                          
                          {/* See More Button */}
                          {visibleCounts[column.id] < columnTickets.length && (
                            <button
                              onClick={() => handleSeeMore(column.id)}
                              className="w-full py-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                              See more ({columnTickets.length - visibleCounts[column.id]} remaining)
                            </button>
                          )}
                        </SortableContext>
                      </DroppableColumn>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTicket ? (
                <div className="bg-white p-2.5 rounded-lg border-2 border-orange-500 shadow-xl opacity-90">
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1 leading-tight">
                      {activeTicket.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 ml-1.5">
                      #{activeTicket.id}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-2">
                    <span className="font-medium">{activeTicket.author}</span>
                  </div>
                  {activeTicket.labelObjects && activeTicket.labelObjects.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {activeTicket.labelObjects.map((label) => (
                        <LabelBadge key={label.id} name={label.name} color={label.color} />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Ticket Detail Modal */}
          {selectedTicketId && (
            <Suspense fallback={<LoadingSpinner />}>
              <TicketDetailModal
                ticketId={selectedTicketId}
                isOpen={isModalOpen}
                onClose={closeModal}
              />
            </Suspense>
          )}
        </div>
        </PageErrorBoundary>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

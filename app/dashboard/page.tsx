'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Search, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNotifications } from '@/context/NotificationContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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
import { ticketAPI, projectAPI, type Ticket as APITicket, type Project } from '@/lib/api';

// Dashboard ticket interface (simplified from API ticket)
interface DashboardTicket {
  id: string;
  title: string;
  author: string;
  time: string;
  labels: string[];
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
function SortableTicketCard({ ticket, onClick, onSelfAssign, isDeveloper, isPending }: {
  ticket: DashboardTicket;
  onClick: () => void;
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
        <h4 className="text-[10px] font-medium text-gray-900 line-clamp-2 flex-1 leading-tight">
          {ticket.title}
        </h4>
        <span className="text-[9px] text-gray-500 ml-1.5">#{ticket.id}</span>
      </div>

      {/* Ticket Meta */}
      <div className="text-[9px] text-gray-500 mb-2">
        <span className="font-medium">{ticket.author}</span>
        <span className="mx-1">•</span>
        <span>{ticket.time}</span>
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-1">
        {ticket.labels.map((label: string, idx: number) => (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-100 text-blue-700"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Comment Icon / Self-Assign Link */}
      <div className="mt-2 flex items-center justify-end">
        {isDeveloper && isPending ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelfAssign(ticket.id);
            }}
            className="text-[10px] text-orange-600 hover:text-orange-700 font-medium"
          >
            Assign yourself
          </button>
        ) : (
          <button 
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
        )}
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
    author: apiTicket.authorName,
    time: formatRelativeTime(apiTicket.createdAt),
    labels: apiTicket.labels,
    project: apiTicket.projectId,
    projectName: apiTicket.projectName,
    status: apiTicket.status,
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { socket } = useNotifications();
  const router = useRouter();
  
  // State
  const [tickets, setTickets] = useState<DashboardTicket[]>([]);
  const [projects, setProjects] = useState<(Project & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // State to track visible ticket count per column
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({
    pending: 5,
    assigned: 5,
    awaiting: 5,
    closed: 5,
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
      // Superadmin should not access dashboard tickets/projects — redirect to organizations
      if (user.role === 'superadmin') {
        router.push('/organizations');
        return;
      }
      
      try {
        setLoading(true);
        
        // Load tickets - all roles can access
        const ticketsResponse = await ticketAPI.getAll({ limit: 100 });
        const dashboardTickets = ticketsResponse.tickets.map(convertToDashboardTicket);
        setTickets(dashboardTickets);

        // Load projects only for QA and Admin
        if (user && (user.role === 'qa' || user.role === 'admin')) {
          const projectsResponse = await projectAPI.getAll({ limit: 100 });
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

  // Listen for real-time ticket updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleTicketUpdate = (update: any) => {
      console.log('Ticket update received:', update);
      
      // Reload tickets to get latest data
      const reloadTickets = async () => {
        try {
          const ticketsResponse = await ticketAPI.getAll({ limit: 100 });
          const dashboardTickets = ticketsResponse.tickets.map(convertToDashboardTicket);
          setTickets(dashboardTickets);
        } catch (error) {
          console.error('Failed to reload tickets:', error);
        }
      };

      reloadTickets();
    };

    // Listen for general ticket updates
    socket.on('ticket:update', handleTicketUpdate);

    // Also listen for custom window events
    const handleCustomUpdate = () => {
      handleTicketUpdate({});
    };
    
    window.addEventListener('ticket-updated', handleCustomUpdate);

    return () => {
      socket.off('ticket:update', handleTicketUpdate);
      window.removeEventListener('ticket-updated', handleCustomUpdate);
    };
  }, [socket]);

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
      console.log('Dropped outside droppable area');
      return;
    }

    const activeTicket = tickets.find(t => t.id === active.id);
    const overColumn = over.id as string;

    // Validate that overColumn is a valid status
    const validStatuses = ['pending', 'assigned', 'awaiting', 'closed'];
    if (!validStatuses.includes(overColumn)) {
      console.log('Invalid drop target:', overColumn);
      return;
    }

    if (activeTicket && activeTicket.status !== overColumn) {
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
        toast.success(`Ticket moved to ${overColumn}`);
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
      [columnId]: prev[columnId] + 5,
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
        ticket.labels.some(label => label.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [tickets, selectedProject, searchQuery]);

  // Group tickets by status
  const ticketsByStatus = useMemo(() => {
    const grouped: Record<string, DashboardTicket[]> = {
      pending: [],
      assigned: [],
      awaiting: [],
      closed: [],
    };

    filteredTickets.forEach(ticket => {
      if (grouped[ticket.status]) {
        grouped[ticket.status].push(ticket);
      }
    });

    return grouped;
  }, [filteredTickets]);

  // Column definitions
  const columns = [
    { id: 'pending', title: 'Pending' },
    { id: 'assigned', title: 'Assigned' },
    { id: 'awaiting', title: 'Awaiting response' },
    { id: 'closed', title: 'Closed' },
  ];

  // Role-based column filtering
  const roleBasedColumns = user?.role === 'developer'
    ? columns.filter(col => col.id !== 'awaiting') // Show pending, assigned, closed for developers
    : columns; // Show all columns for QA and Admin

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
    router.push(`/tickets/${ticketId}`);
  };

  const activeTicket = activeId ? tickets.find(t => t.id === activeId) : null;

  // Calculate developer stats (only for developers)
  const developerStats = useMemo(() => {
    if (user?.role !== 'developer') return null;

    const pending = ticketsByStatus.pending?.length || 0;
    const inProgress = ticketsByStatus.assigned?.length || 0;
    const completed = ticketsByStatus.closed?.length || 0;
    const reopened = 0; // You can add this status if needed

    return [
      { name: 'Pending', value: pending, color: '#FB923C' },
      { name: 'In Progress', value: inProgress, color: '#F97316' },
      { name: 'Completed', value: completed, color: '#34D399' },
      { name: 'Reopened', value: reopened, color: '#60A5FA' },
    ];
  }, [ticketsByStatus, user]);

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
      <DashboardLayout 
        showActivityPanel={true}
        userRole={user?.role}
        activityStats={developerStats}
      >
        <div className="space-y-3">
          {/* Organization Context Header */}
          {user && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ticket Dashboard</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user.role === 'superadmin' 
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
              {user && (user.role === 'qa' || user.role === 'admin') && (
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
                                pending: 5,
                                assigned: 5,
                                awaiting: 5,
                                closed: 5,
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
                        {column.id === 'pending' && user?.role === 'developer' 
                          ? 'Available Tickets' 
                          : column.title} <span className="text-gray-500 text-[10px]">({columnTickets.length})</span>
                      </h3>
                    </div>

                    {/* Droppable Area */}
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
                            onSelfAssign={handleSelfAssign}
                            isDeveloper={user?.role === 'developer'}
                            isPending={column.id === 'pending'}
                          />
                        ))}
                        
                        {/* See More Button */}
                        {visibleCounts[column.id] < columnTickets.length && (
                          <button
                            onClick={() => handleSeeMore(column.id)}
                            className="w-full py-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            See more
                          </button>
                        )}
                      </SortableContext>
                    </DroppableColumn>
                  </div>
                );
              })}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTicket ? (
                <div className="bg-white p-2.5 rounded-lg border-2 border-orange-500 shadow-xl opacity-90">
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="text-xs font-medium text-gray-900 line-clamp-2 flex-1 leading-tight">
                      {activeTicket.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 ml-1.5">
                      #{activeTicket.id}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-2">
                    <span className="font-medium">{activeTicket.author}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeTicket.labels.map((label: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

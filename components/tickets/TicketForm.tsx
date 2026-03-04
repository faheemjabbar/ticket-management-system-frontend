'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ticketAPI, projectAPI, userAPI, sprintAPI, type Project, type User, type Sprint, type Ticket } from '@/lib/api';
import { TicketStatus, TicketType, TYPE_LABELS, STATUS_LABELS } from '@/types/ticket.types';
import { toast } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import LabelSelector from '@/components/tickets/LabelSelector';
import { handleApiError } from '@/utils/errorHandler';
import { API_CONSTANTS } from '@/constants';

interface TicketFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    title: string;
    description: string;
    type?: string;
    status?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    projectId: string;
    labels: string[];
    assignedToId?: string;
    deadline?: string;
    storyPoints?: number;
    estimatedHours?: number;
    acceptanceCriteria?: string[];
    sprintId?: string;
    parentId?: string;
  };
  ticketId?: string;
}

export default function TicketForm({ mode, initialData, ticketId }: TicketFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'task',
    status: initialData?.status || 'backlog',
    priority: initialData?.priority || 'medium' as const,
    projectId: initialData?.projectId || '',
    labels: initialData?.labels || [] as string[],
    assignedToId: initialData?.assignedToId || '',
    deadline: initialData?.deadline || '',
    storyPoints: initialData?.storyPoints || undefined,
    estimatedHours: initialData?.estimatedHours || undefined,
    acceptanceCriteria: initialData?.acceptanceCriteria || [] as string[],
    sprintId: initialData?.sprintId || '',
    parentId: initialData?.parentId || '',
  });

  const [newCriteria, setNewCriteria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize filtered team members to avoid recalculation on every render
  const availableAssignees = useMemo(() => {
    if (!formData.projectId) return [];
    
    const project = projects.find(p => p.id === formData.projectId);
    if (!project) return [];

    const projectTeamMemberIds = project.teamMembers.map(tm => tm.userId);
    return teamMembers.filter(user => 
      projectTeamMemberIds.includes(user.id) && 
      (user.role === 'developer' || user.role === 'qa') &&
      user.isActive
    );
  }, [formData.projectId, projects, teamMembers]);

  // Memoize filtered tickets for parent selection
  const availableParentTickets = useMemo(() => {
    return tickets.filter(t => 
      t.id !== ticketId && 
      (t.type === 'epic' || t.type === 'story')
    );
  }, [tickets, ticketId]);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsResponse = await projectAPI.getAll({ limit: API_CONSTANTS.DEFAULT_PAGE_SIZE });
        setProjects(projectsResponse.projects);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Load team members when project is selected
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!formData.projectId) {
        setTeamMembers([]);
        return;
      }

      try {
        // Get all users in the organization
        const usersResponse = await userAPI.getAll({ limit: API_CONSTANTS.DEFAULT_PAGE_SIZE });
        setTeamMembers(usersResponse.users);
        
        // Clear assignee if they're not in the new project's team
        if (formData.assignedToId && !usersResponse.users.find(u => u.id === formData.assignedToId)) {
          setFormData(prev => ({ ...prev, assignedToId: '' }));
        }
      } catch (error) {
        handleApiError(error);
      }
    };

    loadTeamMembers();
  }, [formData.projectId]);

  // Load sprints when project is selected
  useEffect(() => {
    const loadSprints = async () => {
      if (!formData.projectId) {
        setSprints([]);
        return;
      }

      try {
        const sprintsResponse = await sprintAPI.getAll({ 
          projectId: formData.projectId,
          status: 'active',
        });
        setSprints(sprintsResponse.sprints || []);
      } catch {
        // Silently fail - sprints are optional
        setSprints([]);
      }
    };

    loadSprints();
  }, [formData.projectId]);

  // Load tickets for parent selection
  useEffect(() => {
    const loadTickets = async () => {
      if (!formData.projectId) {
        setTickets([]);
        return;
      }

      try {
        const ticketsResponse = await ticketAPI.getAll({ 
          projectId: formData.projectId,
          limit: API_CONSTANTS.DEFAULT_PAGE_SIZE,
        });
        setTickets(ticketsResponse.tickets);
      } catch {
        setTickets([]);
      }
    };

    loadTickets();
  }, [formData.projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.projectId) {
      toast.error('Project is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const ticketData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          projectId: formData.projectId,
          labels: formData.labels,
          deadline: formData.deadline || undefined,
          storyPoints: formData.storyPoints,
          estimatedHours: formData.estimatedHours,
          sprintId: formData.sprintId || undefined,
          parentId: formData.parentId || undefined,
        };

        const newTicket = await ticketAPI.create(ticketData);
        
        // If assigned to someone, assign the ticket (Phase 1: No longer changes status)
        if (formData.assignedToId) {
          const assignedUser = availableAssignees.find(d => d.id === formData.assignedToId);
          if (assignedUser) {
            try {
              await ticketAPI.assign(newTicket.id, {
                assignedToId: assignedUser.id,
                assignedToName: assignedUser.name,
              });
            } catch (error: any) {
              // Handle assignment validation errors
              if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Failed to assign ticket');
              } else {
                throw error;
              }
            }
          }
        }
        
        toast.success('Ticket created successfully!');
        router.push('/dashboard');
      } else if (ticketId) {
        const updateData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          labels: formData.labels,
          deadline: formData.deadline || undefined,
          storyPoints: formData.storyPoints,
          estimatedHours: formData.estimatedHours,
          sprintId: formData.sprintId || undefined,
          parentId: formData.parentId || undefined,
        };

        await ticketAPI.update(ticketId, updateData);
        
        // Handle assignment change
        if (formData.assignedToId) {
          const assignedUser = availableAssignees.find(d => d.id === formData.assignedToId);
          if (assignedUser) {
            try {
              await ticketAPI.assign(ticketId, {
                assignedToId: assignedUser.id,
                assignedToName: assignedUser.name,
              });
            } catch (error: any) {
              // Handle assignment validation errors
              if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Failed to assign ticket');
              } else {
                throw error;
              }
            }
          }
        }
        
        toast.success('Ticket updated successfully!');
        router.push('/tickets');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      router.push('/tickets');
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter ticket title"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 outline-none"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the issue or question in detail..."
          rows={6}
          className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
          required
        />
      </div>

      {/* Project, Type, and Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project */}
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-900 mb-1">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            id="project"
            value={formData.projectId}
            onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type (Phase 1) */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-1">
            Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-900 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Status, Story Points, and Estimated Hours Row (Phase 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Story Points */}
        <div>
          <label htmlFor="storyPoints" className="block text-sm font-medium text-gray-900 mb-1">
            Story Points
          </label>
          <input
            type="number"
            id="storyPoints"
            value={formData.storyPoints || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              storyPoints: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            placeholder="e.g., 5"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 outline-none"
          />
        </div>

        {/* Estimated Hours */}
        <div>
          <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-900 mb-1">
            Estimated Hours
          </label>
          <input
            type="number"
            id="estimatedHours"
            value={formData.estimatedHours || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined 
            }))}
            placeholder="e.g., 8"
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 outline-none"
          />
        </div>
      </div>

      {/* Sprint and Parent Ticket (Phase 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sprint */}
        <div>
          <label htmlFor="sprint" className="block text-sm font-medium text-gray-900 mb-1">
            Sprint
          </label>
          <select
            id="sprint"
            value={formData.sprintId}
            onChange={(e) => setFormData(prev => ({ ...prev, sprintId: e.target.value }))}
            disabled={!formData.projectId}
            className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!formData.projectId ? 'Select a project first' : 'No sprint'}
            </option>
            {sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>

        {/* Parent Ticket */}
        <div>
          <label htmlFor="parentTicket" className="block text-sm font-medium text-gray-900 mb-1">
            Parent Ticket
          </label>
          <select
            id="parentTicket"
            value={formData.parentId}
            onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
            disabled={!formData.projectId}
            className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!formData.projectId ? 'Select a project first' : 'No parent'}
            </option>
            {availableParentTickets.map(ticket => (
              <option key={ticket.id} value={ticket.id}>
                [{ticket.type.toUpperCase()}] {ticket.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assign To and Deadline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assign To */}
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-900 mb-1">
            Assign To
          </label>
          <select
            id="assignedTo"
            value={formData.assignedToId}
            onChange={(e) => setFormData(prev => ({ ...prev, assignedToId: e.target.value }))}
            disabled={!formData.projectId}
            className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!formData.projectId ? 'Select a project first' : 'Unassigned'}
            </option>
            {availableAssignees.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role.toUpperCase()})
              </option>
            ))}
          </select>
          {formData.projectId && availableAssignees.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No team members available for this project
            </p>
          )}
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-900 mb-1">
            Deadline 
          </label>
          <input
            type="date"
            id="deadline"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            className="w-full px-3 text-gray-900 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Labels (Phase 3) */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Labels
        </label>
        {formData.projectId ? (
          <LabelSelector
            projectId={formData.projectId}
            selectedLabelIds={formData.labels}
            onChange={(labelIds) => setFormData(prev => ({ ...prev, labels: labelIds }))}
            disabled={!formData.projectId}
          />
        ) : (
          <p className="text-sm text-gray-500">Select a project first to add labels</p>
        )}
      </div>

      {/* Acceptance Criteria (Phase 1) */}
      <div>
        <label htmlFor="acceptanceCriteria" className="block text-sm font-medium text-gray-900 mb-1">
          Acceptance Criteria
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="acceptanceCriteria"
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newCriteria.trim()) {
                  setFormData(prev => ({
                    ...prev,
                    acceptanceCriteria: [...prev.acceptanceCriteria, newCriteria.trim()],
                  }));
                  setNewCriteria('');
                }
              }
            }}
            placeholder="Add acceptance criteria and press Enter"
            className="flex-1 px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (newCriteria.trim()) {
                setFormData(prev => ({
                  ...prev,
                  acceptanceCriteria: [...prev.acceptanceCriteria, newCriteria.trim()],
                }));
                setNewCriteria('');
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        
        {/* Display Acceptance Criteria */}
        {formData.acceptanceCriteria.length > 0 && (
          <div className="space-y-2">
            {formData.acceptanceCriteria.map((criteria, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200"
              >
                <span className="text-gray-600 text-sm flex-1">{idx + 1}. {criteria}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      acceptanceCriteria: prev.acceptanceCriteria.filter((_, i) => i !== idx),
                    }));
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Ticket' : 'Update Ticket'}
        </button>
      </div>
    </form>
  );
}

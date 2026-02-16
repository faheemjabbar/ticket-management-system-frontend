'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ticketAPI, projectAPI, userAPI, type Project, type User } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface TicketFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    projectId: string;
    labels: string[];
    assignedToId?: string;
    deadline?: string;
  };
  ticketId?: string;
}

export default function TicketForm({ mode, initialData, ticketId }: TicketFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium' as const,
    projectId: initialData?.projectId || '',
    labels: initialData?.labels || [] as string[],
    assignedToId: initialData?.assignedToId || '',
    deadline: initialData?.deadline || '',
  });

  const [newLabel, setNewLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsResponse = await projectAPI.getAll({ limit: 100 });
        setProjects(projectsResponse.projects);
      } catch {
        toast.error('Failed to load projects');
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
        const project = projects.find(p => p.id === formData.projectId);
        if (!project) return;

        // Get all users in the organization
        const usersResponse = await userAPI.getAll({ limit: 100 });
        
        // Filter to only team members (developers and QA) who are in this project
        const projectTeamMemberIds = project.teamMembers.map(tm => tm.userId);
        const availableAssignees = usersResponse.users.filter(user => 
          projectTeamMemberIds.includes(user.id) && 
          (user.role === 'developer' || user.role === 'qa') &&
          user.isActive
        );
        
        setTeamMembers(availableAssignees);
        
        // Clear assignee if they're not in the new project's team
        if (formData.assignedToId && !availableAssignees.find(u => u.id === formData.assignedToId)) {
          setFormData(prev => ({ ...prev, assignedToId: '' }));
        }
      } catch {
        toast.error('Failed to load team members');
      }
    };

    loadTeamMembers();
  }, [formData.projectId, projects]);

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
        };

        const newTicket = await ticketAPI.create(ticketData);
        
        // If assigned to someone, assign the ticket
        if (formData.assignedToId) {
          const assignedUser = teamMembers.find(d => d.id === formData.assignedToId);
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
        };

        await ticketAPI.update(ticketId, updateData);
        
        // Handle assignment change
        if (formData.assignedToId) {
          const assignedUser = teamMembers.find(d => d.id === formData.assignedToId);
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
    } catch {
      toast.error('Failed to save ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()],
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove),
    }));
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

      {/* Project and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role.toUpperCase()})
              </option>
            ))}
          </select>
          {formData.projectId && teamMembers.length === 0 && (
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

      {/* Labels */}
      <div>
        <label htmlFor="labels" className="block text-sm font-medium text-gray-900 mb-1">
          Labels
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="labels"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddLabel();
              }
            }}
            placeholder="Add a label and press Enter"
            className="flex-1 px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
          <button
            type="button"
            onClick={handleAddLabel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Add
          </button>
        </div>
        
        {/* Display Labels */}
        {formData.labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.labels.map((label, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
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

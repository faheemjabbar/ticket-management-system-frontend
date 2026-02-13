'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { X, Plus, Folder, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { projectAPI, userAPI, type Project, type User } from '@/lib/api';
import { useModalAnimation } from '@/hooks/useModalAnimation';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  mode: 'create' | 'edit';
}

export default function ProjectModal({ isOpen, onClose, project, mode }: ProjectModalProps) {
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { isAnimating, shouldRender } = useModalAnimation(isOpen);
  
  // State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'completed' | 'archived',
    startDate: '',
    endDate: '',
    teamMembers: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        try {
          setLoading(true);
          const usersResponse = await userAPI.getAll({ limit: 100 });
          const filteredUsers = usersResponse.users.filter(
          user => user.role !== 'admin'  // Filter out admin (was superadmin)
        );
          setAllUsers(filteredUsers);
        } catch {
          toast.error('Failed to load users');
        } finally {
          setLoading(false);
        }
      };

      loadUsers();
    }
  }, [isOpen]);

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate.split('T')[0], // Convert to YYYY-MM-DD format
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        teamMembers: project.teamMembers.map(m => m.userId),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
        startDate: '',
        endDate: '',
        teamMembers: [],
      });
    }
  }, [mode, project]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && isAnimating) {
      setTimeout(() => nameInputRef.current?.focus(), 200);
    }
  }, [isOpen, isAnimating]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.startDate) {
      toast.error('Start date is required');
      return;
    }
    // Team members are now OPTIONAL - removed validation

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const projectData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          teamMembers: formData.teamMembers.map(userId => {
            const user = allUsers.find(u => u.id === userId);
            return {
              userId,
              role: user?.role === 'project-manager' || user?.role === 'qa' || user?.role === 'developer' 
                ? user.role 
                : 'developer',
            };
          }),
        };

        await projectAPI.create(projectData);
        toast.success('Project created successfully!');
      } else if (project) {
        // For update, include userName and assignedAt from allUsers
        const projectData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          teamMembers: formData.teamMembers.map(userId => {
            const user = allUsers.find(u => u.id === userId);
            const existingMember = project.teamMembers.find(m => m.userId === userId);
            return {
              userId,
              userName: user?.name || 'Unknown User',
              role: user?.role === 'project-manager' || user?.role === 'qa' || user?.role === 'developer'
                ? user.role
                : 'developer',
              assignedAt: existingMember?.assignedAt || new Date().toISOString(),
            };
          }),
        };

        await projectAPI.update(project.id, projectData);
        toast.success('Project updated successfully!');
      }
      
      handleClose();
      router.refresh();
    } catch {
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTeamMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId],
    }));
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto transition-all duration-300 ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-orange-600 px-5 py-3 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  {mode === 'create' ? (
                    <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
                  ) : (
                    <Folder className="w-4 h-4 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {mode === 'create' ? 'Create New Project' : 'Edit Project'}
                  </h2>
                  <p className="text-[10px] text-orange-100 mt-0.5">
                    {mode === 'create' ? 'Fill in the details below' : 'Update project information'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[calc(90vh-60px)]">
            <div className="space-y-3.5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., E-Commerce Platform"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the project goals and scope..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 text-black border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-none transition-all"
                  required
                />
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-3 gap-3">
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full text-black px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none appearance-none bg-white cursor-pointer transition-all"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      paddingRight: '2rem'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="flex items-center gap-1 text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                    <Calendar className="w-3 h-3" />
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full text-black px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="flex items-center gap-1 text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                    <Calendar className="w-3 h-3" />
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate}
                    className="w-full text-black px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Team Members */}
              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  <Users className="w-3 h-3" />
                  Team Members <span className="text-gray-400">(Optional)</span>
                </label>
                <p className="text-[10px] text-gray-500 mb-2">Select team members for this project</p>
                
                <div className="border-2 border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="text-xs text-gray-500">Loading users...</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allUsers.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.teamMembers.includes(user.id)}
                            onChange={() => toggleTeamMember(user.id)}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-[10px]">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                              <p className="text-[10px] text-gray-600 capitalize">{user.role}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              user.role === 'project-manager' 
                                ? 'bg-purple-100 text-purple-700'
                                : user.role === 'qa'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {formData.teamMembers.length > 0 && (
                  <p className="text-[10px] text-gray-600 mt-2">
                    {formData.teamMembers.length} member{formData.teamMembers.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2.5 mt-5 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {mode === 'create' ? 'Create Project' : 'Update Project'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

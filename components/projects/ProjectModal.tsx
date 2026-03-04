'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Folder, Calendar, Users } from 'lucide-react';
import { projectAPI, userAPI, type Project, type User } from '@/lib/api';
import BaseModal from '@/components/ui/BaseModal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useForm } from '@/hooks/useForm';
import { handleApiError } from '@/utils/errorHandler';
import { API_CONSTANTS } from '@/constants';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  mode: 'create' | 'edit';
}

export default function ProjectModal({ isOpen, onClose, project, mode }: ProjectModalProps) {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users when modal opens (uses cached data)
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const response = await userAPI.getAll({ limit: API_CONSTANTS.DEFAULT_PAGE_SIZE });
          const filteredUsers = response.users.filter(user => user.role !== 'admin');
          setAllUsers(filteredUsers);
        } catch (error) {
          handleApiError(error);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const form = useForm({
    initialValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || ('active' as 'active' | 'completed' | 'archived'),
      startDate: project?.startDate.split('T')[0] || '',
      endDate: project?.endDate ? project.endDate.split('T')[0] : '',
      teamMembers: project?.teamMembers.map(m => m.userId) || ([] as string[]),
    },
    onSubmit: async (values) => {
      if (mode === 'create') {
        const projectData = {
          name: values.name.trim(),
          description: values.description.trim(),
          status: values.status,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          teamMembers: values.teamMembers.map(userId => {
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
        const projectData = {
          name: values.name.trim(),
          description: values.description.trim(),
          status: values.status,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          teamMembers: values.teamMembers.map(userId => {
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
      
      onClose();
      router.refresh();
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name.trim()) errors.name = 'Project name is required';
      if (!values.description.trim()) errors.description = 'Description is required';
      if (!values.startDate) errors.startDate = 'Start date is required';
      return errors;
    },
  });

  // Reset form when project changes
  useEffect(() => {
    if (isOpen) {
      form.setValues({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'active',
        startDate: project?.startDate.split('T')[0] || '',
        endDate: project?.endDate ? project.endDate.split('T')[0] : '',
        teamMembers: project?.teamMembers.map(m => m.userId) || [],
      });
    }
  }, [project, isOpen]);

  const toggleTeamMember = (userId: string) => {
    const currentMembers = form.values.teamMembers;
    form.handleChange(
      'teamMembers',
      currentMembers.includes(userId)
        ? currentMembers.filter(id => id !== userId)
        : [...currentMembers, userId]
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Project' : 'Edit Project'}
      subtitle={mode === 'create' ? 'Fill in the details below' : 'Update project information'}
      icon={Folder}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={form.isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit} loading={form.isSubmitting}>
            {mode === 'create' ? 'Create Project' : 'Update Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit} className="space-y-4">
        <FormField.Input
          label="Project Name"
          value={form.values.name}
          onChange={(e) => form.handleChange('name', e.target.value)}
          onBlur={() => form.handleBlur('name')}
          error={form.touched.name ? form.errors.name : undefined}
          placeholder="e.g., E-Commerce Platform"
          required
        />

        <FormField.Textarea
          label="Description"
          value={form.values.description}
          onChange={(e) => form.handleChange('description', e.target.value)}
          onBlur={() => form.handleBlur('description')}
          error={form.touched.description ? form.errors.description : undefined}
          placeholder="Describe the project goals and scope..."
          rows={3}
          required
        />

        <div className="grid grid-cols-3 gap-3">
          <FormField.Select
            label="Status"
            value={form.values.status}
            onChange={(e) => form.handleChange('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </FormField.Select>

          <FormField.Input
            label="Start Date"
            icon={Calendar}
            type="date"
            value={form.values.startDate}
            onChange={(e) => form.handleChange('startDate', e.target.value)}
            onBlur={() => form.handleBlur('startDate')}
            error={form.touched.startDate ? form.errors.startDate : undefined}
            required
          />

          <FormField.Input
            label="End Date"
            icon={Calendar}
            type="date"
            value={form.values.endDate}
            onChange={(e) => form.handleChange('endDate', e.target.value)}
            min={form.values.startDate}
          />
        </div>

        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            <Users className="w-3 h-3" />
            Team Members <span className="text-slate-400">(Optional)</span>
          </label>
          <p className="text-xs text-slate-500 mb-2">Select team members for this project</p>
          
          <div className="border-2 border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="text-xs text-slate-500">Loading users...</div>
              </div>
            ) : (
              <div className="space-y-2">
                {allUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.values.teamMembers.includes(user.id)}
                      onChange={() => toggleTeamMember(user.id)}
                      className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-[10px]">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-600 capitalize">{user.role}</p>
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
          
          {form.values.teamMembers.length > 0 && (
            <p className="text-xs text-slate-600 mt-2">
              {form.values.teamMembers.length} member{form.values.teamMembers.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      </form>
    </BaseModal>
  );
}



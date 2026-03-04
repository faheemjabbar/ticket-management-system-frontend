'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import type { Sprint, CreateSprintDto, UpdateSprintDto } from '@/types/sprint.types';
import { Zap, Calendar, Target } from 'lucide-react';
import BaseModal from '@/components/ui/BaseModal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useForm } from '@/hooks/useForm';

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSprintDto | UpdateSprintDto) => Promise<void>;
  sprint?: Sprint | null;
  projectId?: string;
}

export default function SprintModal({ isOpen, onClose, onSubmit, sprint, projectId }: SprintModalProps) {
  const { projects, fetchProjects } = useProjects();
  const [error, setError] = useState('');

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, fetchProjects]);

  const form = useForm({
    initialValues: {
      name: sprint?.name || '',
      goal: sprint?.goal || '',
      projectId: sprint?.projectId || projectId || '',
      startDate: sprint?.startDate.split('T')[0] || '',
      endDate: sprint?.endDate.split('T')[0] || '',
      capacity: sprint?.capacity || 40,
      status: sprint?.status || ('planning' as 'planning' | 'active' | 'completed'),
    },
    onSubmit: async (values) => {
      setError('');
      try {
        if (sprint) {
          await onSubmit({
            name: values.name,
            goal: values.goal,
            startDate: values.startDate,
            endDate: values.endDate,
            capacity: values.capacity,
            status: values.status,
          });
        } else {
          await onSubmit({
            name: values.name,
            goal: values.goal,
            projectId: values.projectId,
            startDate: values.startDate,
            endDate: values.endDate,
            capacity: values.capacity,
          });
        }
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to save sprint');
      }
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name.trim()) errors.name = 'Sprint name is required';
      if (!values.goal.trim()) errors.goal = 'Sprint goal is required';
      if (!sprint && !values.projectId) errors.projectId = 'Project is required';
      if (!values.startDate) errors.startDate = 'Start date is required';
      if (!values.endDate) errors.endDate = 'End date is required';
      if (values.capacity < 0) errors.capacity = 'Capacity must be positive';
      return errors;
    },
  });

  // Reset form when sprint changes
  useEffect(() => {
    if (isOpen) {
      form.setValues({
        name: sprint?.name || '',
        goal: sprint?.goal || '',
        projectId: sprint?.projectId || projectId || '',
        startDate: sprint?.startDate.split('T')[0] || '',
        endDate: sprint?.endDate.split('T')[0] || '',
        capacity: sprint?.capacity || 40,
        status: sprint?.status || 'planning',
      });
      setError('');
    }
  }, [sprint, projectId, isOpen]);
  

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={sprint ? 'Edit Sprint' : 'Create Sprint'}
      icon={Zap}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={form.isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit} loading={form.isSubmitting}>
            {sprint ? 'Update Sprint' : 'Create Sprint'}
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="space-y-6">
        <FormField.Input
          label="Sprint Name"
          value={form.values.name}
          onChange={(e) => form.handleChange('name', e.target.value)}
          onBlur={() => form.handleBlur('name')}
          error={form.touched.name ? form.errors.name : undefined}
          placeholder="Sprint 23"
          required
        />

        <FormField.Textarea
          label="Sprint Goal"
          icon={Target}
          value={form.values.goal}
          onChange={(e) => form.handleChange('goal', e.target.value)}
          onBlur={() => form.handleBlur('goal')}
          error={form.touched.goal ? form.errors.goal : undefined}
          placeholder="Complete user authentication system"
          rows={3}
          required
        />

        {!sprint && (
          <FormField.Select
            label="Project"
            value={form.values.projectId}
            onChange={(e) => form.handleChange('projectId', e.target.value)}
            onBlur={() => form.handleBlur('projectId')}
            error={form.touched.projectId ? form.errors.projectId : undefined}
            required
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </FormField.Select>
        )}

        <div className="grid grid-cols-2 gap-4">
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
            onBlur={() => form.handleBlur('endDate')}
            error={form.touched.endDate ? form.errors.endDate : undefined}
            required
          />
        </div>

        <FormField.Input
          label="Capacity (Story Points)"
          type="number"
          value={form.values.capacity}
          onChange={(e) => form.handleChange('capacity', parseInt(e.target.value) || 0)}
          onBlur={() => form.handleBlur('capacity')}
          error={form.touched.capacity ? form.errors.capacity : undefined}
          min={0}
          required
        />

        {sprint && (
          <FormField.Select
            label="Status"
            value={form.values.status}
            onChange={(e) => form.handleChange('status', e.target.value)}
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </FormField.Select>
        )}
      </form>
    </BaseModal>
  );
}

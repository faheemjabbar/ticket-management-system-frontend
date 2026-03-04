'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { LABEL_COLORS, LABEL_CATEGORY_LABELS } from '@/types/label.types';
import type { Label, CreateLabelDto, UpdateLabelDto } from '@/types/label.types';
import { Tag, Palette, Eye } from 'lucide-react';
import BaseModal from '@/components/ui/BaseModal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useForm } from '@/hooks/useForm';

interface LabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLabelDto | UpdateLabelDto) => Promise<void>;
  label?: Label | null;
  projectId?: string;
}

export default function LabelModal({ isOpen, onClose, onSubmit, label, projectId }: LabelModalProps) {
  const { projects, fetchProjects } = useProjects();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, fetchProjects]);

  const form = useForm({
    initialValues: {
      name: label?.name || '',
      color: label?.color || '#3B82F6',
      description: label?.description || '',
      projectId: label?.projectId || projectId || '',
      category: label?.category || 'general',
    },
    onSubmit: async (values) => {
      setError('');
      try {
        if (label) {
          await onSubmit({
            name: values.name,
            color: values.color,
            description: values.description,
            category: values.category,
          });
        } else {
          await onSubmit({
            name: values.name,
            color: values.color,
            description: values.description,
            projectId: values.projectId,
            category: values.category,
          });
        }
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to save label');
      }
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name.trim()) errors.name = 'Label name is required';
      if (!values.color.match(/^#[0-9A-Fa-f]{6}$/)) errors.color = 'Invalid color format';
      if (!label && !values.projectId) errors.projectId = 'Project is required';
      return errors;
    },
  });

  // Reset form when label changes
  useEffect(() => {
    if (isOpen) {
      form.setValues({
        name: label?.name || '',
        color: label?.color || '#3B82F6',
        description: label?.description || '',
        projectId: label?.projectId || projectId || '',
        category: label?.category || 'general',
      });
      setError('');
    }
  }, [label, projectId, isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={label ? 'Edit Label' : 'Create Label'}
      icon={Tag}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={form.isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit} loading={form.isSubmitting}>
            {label ? 'Update Label' : 'Create Label'}
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
          label="Label Name"
          value={form.values.name}
          onChange={(e) => form.handleChange('name', e.target.value)}
          onBlur={() => form.handleBlur('name')}
          error={form.touched.name ? form.errors.name : undefined}
          placeholder="Frontend"
          required
        />

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Palette className="w-3 h-3" />
            Color
          </label>
          <div className="grid grid-cols-9 gap-2 mb-3">
            {Object.entries(LABEL_COLORS).map(([name, color]) => (
              <button
                key={name}
                type="button"
                onClick={() => form.handleChange('color', color)}
                className={`w-9 h-9 rounded-lg border-2 transition-all hover:scale-110 ${
                  form.values.color === color ? 'border-slate-900 scale-110 shadow-md' : 'border-slate-200'
                }`}
                style={{ backgroundColor: color }}
                title={name}
              />
            ))}
          </div>
          <FormField.Input
            value={form.values.color}
            onChange={(e) => form.handleChange('color', e.target.value)}
            onBlur={() => form.handleBlur('color')}
            error={form.touched.color ? form.errors.color : undefined}
            placeholder="#3B82F6"
            pattern="^#[0-9A-Fa-f]{6}$"
            className="font-mono"
            required
          />
        </div>

        <FormField.Textarea
          label="Description"
          value={form.values.description}
          onChange={(e) => form.handleChange('description', e.target.value)}
          placeholder="Optional description"
          rows={2}
        />

        {!label && (
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

        <FormField.Select
          label="Category"
          value={form.values.category}
          onChange={(e) => form.handleChange('category', e.target.value)}
          required
        >
          {Object.entries(LABEL_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FormField.Select>

        {/* Preview */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            Preview
          </label>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
              style={{
                backgroundColor: `${form.values.color}20`,
                color: form.values.color,
                border: `1px solid ${form.values.color}40`,
              }}
            >
              {form.values.name || 'Label Name'}
            </span>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}

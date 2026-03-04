'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Briefcase, FileText } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import BaseModal from '@/components/ui/BaseModal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useForm } from '@/hooks/useForm';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateUserModalProps) {
  const { user: currentUser } = useAuth();
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'developer' as 'developer' | 'qa',
      bio: '',
    },
    onSubmit: async (values) => {
      setError('');

      // Validate that project manager has organizationId
      if (!currentUser?.organization?.id) {
        setError('Unable to create user: Organization information missing');
        return;
      }

      try {
        await userAPI.create({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password.trim(),
          role: values.role,
          organizationId: currentUser.organization.id,
          bio: values.bio.trim() || undefined,
        });
        
        toast.success(`User "${values.name}" created successfully!`);
        onSuccess();
        onClose();
      } catch (error: any) {
        if (error.response?.status === 400) {
          const message = error.response.data.message;
          if (Array.isArray(message)) {
            setError(message.join(', '));
          } else if (message.includes('email')) {
            setError('This email is already in use. Please use a different email.');
          } else {
            setError(message || 'Validation failed. Please check your inputs.');
          }
        } else if (error.response?.status === 403) {
          setError('You do not have permission to create users.');
        } else {
          setError('Failed to create user. Please try again.');
        }
      }
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name.trim()) errors.name = 'Name is required';
      if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
      if (!values.email.trim()) errors.email = 'Email is required';
      if (!values.password.trim()) errors.password = 'Password is required';
      if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
      return errors;
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.resetForm();
      setError('');
    }
  }, [isOpen]);

  // Only project managers can create users
  if (currentUser?.role !== 'project-manager') {
    return null;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New User"
      subtitle="Add a new team member to your organization"
      icon={User}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={form.isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit} loading={form.isSubmitting}>
            Create User
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="space-y-4">
        <FormField.Input
          label="Full Name"
          icon={User}
          value={form.values.name}
          onChange={(e) => form.handleChange('name', e.target.value)}
          onBlur={() => form.handleBlur('name')}
          error={form.touched.name ? form.errors.name : undefined}
          placeholder="e.g., John Doe"
          required
          minLength={2}
        />

        <FormField.Input
          label="Email Address"
          icon={Mail}
          type="email"
          value={form.values.email}
          onChange={(e) => form.handleChange('email', e.target.value)}
          onBlur={() => form.handleBlur('email')}
          error={form.touched.email ? form.errors.email : undefined}
          placeholder="user@example.com"
          required
        />

        <FormField.Input
          label="Password"
          icon={Lock}
          type="password"
          value={form.values.password}
          onChange={(e) => form.handleChange('password', e.target.value)}
          onBlur={() => form.handleBlur('password')}
          error={form.touched.password ? form.errors.password : undefined}
          placeholder="Minimum 6 characters"
          hint="Password must be at least 6 characters"
          required
          minLength={6}
        />

        <FormField.Select
          label="Role"
          icon={Briefcase}
          value={form.values.role}
          onChange={(e) => form.handleChange('role', e.target.value)}
          hint="Project Manager can only create Developer or QA roles"
          required
        >
          <option value="developer">Developer</option>
          <option value="qa">QA</option>
        </FormField.Select>

        <FormField.Textarea
          label="Bio"
          icon={FileText}
          value={form.values.bio}
          onChange={(e) => form.handleChange('bio', e.target.value)}
          placeholder="Brief description about the user..."
          rows={3}
          hint={`${form.values.bio.length}/500 characters`}
          maxLength={500}
        />
      </form>
    </BaseModal>
  );
}

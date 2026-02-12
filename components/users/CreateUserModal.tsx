'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, User, CheckCircle2, Mail, Lock, Briefcase, FileText } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer' as 'developer' | 'qa',
    bio: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'developer',
        bio: '',
      });
    }
  }, [isOpen]);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsAnimating(true), 10);
      setTimeout(() => nameInputRef.current?.focus(), 200);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.password.trim()) {
      toast.error('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate that admin has organizationId
      if (!currentUser?.organization?.id) {
        toast.error('Unable to create user: Organization information missing');
        setIsSubmitting(false);
        return;
      }

      // Admin creates users - include organizationId from current user
      const createdUser = await userAPI.create({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        role: formData.role,
        organizationId: currentUser.organization.id, // Required by backend
        bio: formData.bio.trim() || undefined,
      });
      
      console.log('User created successfully:', createdUser);
      toast.success(`User "${formData.name}" created successfully!`);
      
      // Wait for the list to reload before closing modal
      console.log('Calling onSuccess to reload users...');
      await onSuccess();
      console.log('Users reloaded, closing modal...');
      handleClose();
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (Array.isArray(message)) {
          // Validation errors
          toast.error(message.join(', '));
        } else if (message.includes('email')) {
          toast.error('This email is already in use. Please use a different email.');
        } else {
          toast.error(message || 'Validation failed. Please check your inputs.');
        }
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to create users.');
      } else {
        toast.error('Failed to create user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only admins can create users
  if (currentUser?.role !== 'admin') {
    return null;
  }

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
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto transition-all duration-300 ${
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
                  <User className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Create New User
                  </h2>
                  <p className="text-[10px] text-orange-100 mt-0.5">
                    Add a new team member to your organization
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
          <form onSubmit={handleSubmit} className="p-5">
            <div className="space-y-3.5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., John Doe"
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-[9px] text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'developer' | 'qa' }))}
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      paddingRight: '2rem'
                    }}
                  >
                    <option value="developer">Developer</option>
                    <option value="qa">QA</option>
                  </select>
                </div>
                <p className="text-[9px] text-gray-500 mt-1">Admin can only create Developer or QA roles</p>
              </div>

              {/* Bio (Optional) */}
              <div>
                <label htmlFor="bio" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                  Bio <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Brief description about the user..."
                    rows={3}
                    maxLength={500}
                    className="w-full pl-9 pr-3 py-2 border-2 text-black border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-none transition-all"
                  />
                </div>
                <p className="text-[9px] text-gray-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
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
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Create User
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

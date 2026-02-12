'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Building2, CheckCircle2, User } from 'lucide-react';
import { organizationAPI, type Organization } from '@/lib/api';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization | null;
  onSuccess: () => void;
}

export default function OrganizationModal({ 
  isOpen, 
  onClose, 
  organization, 
  onSuccess 
}: OrganizationModalProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // Admin user fields (only for create mode)
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        description: organization.description || '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
    }
  }, [organization]);

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
      toast.error('Organization name is required');
      return;
    }

    // Additional validation for create mode (admin user required)
    if (!organization) {
      if (!formData.adminName.trim()) {
        toast.error('Admin name is required');
        return;
      }
      if (!formData.adminEmail.trim()) {
        toast.error('Admin email is required');
        return;
      }
      if (!formData.adminPassword.trim()) {
        toast.error('Admin password is required');
        return;
      }
      if (formData.adminPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (organization) {
        // Edit mode - only update organization
        await organizationAPI.update(organization.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        toast.success('Organization updated successfully!');
      } else {
        // Create mode - use atomic endpoint
        const result = await organizationAPI.createWithAdmin({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          adminUser: {
            name: formData.adminName.trim(),
            email: formData.adminEmail.trim(),
            password: formData.adminPassword.trim(),
          },
        });
        
        toast.success(
          `Organization "${result.organization.name}" created with admin "${result.admin.name}"!`
        );
      }
      
      handleClose();
      onSuccess();
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (Array.isArray(message)) {
          // Validation errors
          toast.error(message.join(', '));
        } else if (message === 'Email already exists') {
          toast.error('This email is already in use. Please use a different email.');
        } else {
          toast.error(message || 'Validation failed. Please check your inputs.');
        }
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to create organizations.');
      } else {
        toast.error('Failed to save organization. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
                  <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {organization ? 'Edit Organization' : 'Create Organization'}
                  </h2>
                  <p className="text-[10px] text-orange-100 mt-0.5">
                    {organization ? 'Update organization details' : 'Add a new organization'}
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
              {/* Organization Section */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Organization Details</h3>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the organization..."
                    rows={3}
                    className="w-full px-3 py-2 border-2 text-black border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-none transition-all"
                  />
                </div>
              </div>

              {/* Admin User Section - Only show in create mode */}
              {!organization && (
                <div className="space-y-3.5 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 pb-2">
                    <User className="w-4 h-4 text-orange-600" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Admin User</h3>
                  </div>
                  <p className="text-[10px] text-gray-600">Create an admin user for this organization</p>

                  {/* Admin Name */}
                  <div>
                    <label htmlFor="adminName" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                      Admin Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="adminName"
                      value={formData.adminName}
                      onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                      placeholder="e.g., John Doe"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all"
                      required={!organization}
                    />
                  </div>

                  {/* Admin Email */}
                  <div>
                    <label htmlFor="adminEmail" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                      Admin Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="adminEmail"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                      placeholder="admin@example.com"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all"
                      required={!organization}
                    />
                  </div>

                  {/* Admin Password */}
                  <div>
                    <label htmlFor="adminPassword" className="block text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                      Admin Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="adminPassword"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-black transition-all"
                      required={!organization}
                      minLength={6}
                    />
                    <p className="text-[9px] text-gray-500 mt-1">Password must be at least 6 characters</p>
                  </div>
                </div>
              )}
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
                    {organization ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {organization ? 'Update Organization' : 'Create Organization'}
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

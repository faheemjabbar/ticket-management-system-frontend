'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: LucideIcon;
  className?: string;
}

interface InputProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'datetime-local' | 'url' | 'tel';
}

interface TextareaProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

interface SelectProps extends BaseFieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  children: ReactNode;
}

const labelClasses = 'block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3';
const inputBaseClasses = 'w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
const errorClasses = 'border-red-300 focus:ring-red-500';
const hintClasses = 'text-xs text-slate-500 mt-1';
const errorTextClasses = 'text-xs text-red-600 mt-1';

export function Input({ label, error, hint, required, icon: Icon, className, ...props }: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className={cn(labelClasses, Icon && 'flex items-center gap-1.5')}>
          {Icon && <Icon className="w-3 h-3" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={cn(inputBaseClasses, error && errorClasses)}
        {...props}
      />
      {hint && !error && <p className={hintClasses}>{hint}</p>}
      {error && <p className={errorTextClasses}>{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, required, icon: Icon, className, ...props }: TextareaProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className={cn(labelClasses, Icon && 'flex items-center gap-1.5')}>
          {Icon && <Icon className="w-3 h-3" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        className={cn(inputBaseClasses, 'resize-none', error && errorClasses)}
        {...props}
      />
      {hint && !error && <p className={hintClasses}>{hint}</p>}
      {error && <p className={errorTextClasses}>{error}</p>}
    </div>
  );
}

export function Select({ label, error, hint, required, icon: Icon, className, children, ...props }: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className={cn(labelClasses, Icon && 'flex items-center gap-1.5')}>
          {Icon && <Icon className="w-3 h-3" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        className={cn(inputBaseClasses, 'bg-white', error && errorClasses)}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className={hintClasses}>{hint}</p>}
      {error && <p className={errorTextClasses}>{error}</p>}
    </div>
  );
}

// Export as FormField namespace
const FormField = {
  Input,
  Textarea,
  Select,
};

export default FormField;

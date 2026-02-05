"use client"

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', data);
      toast.success(response.data.message);
      setEmailSent(true);
    } catch (err: any) {
      // Error already handled by axios interceptor
    }
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex flex-col">
      {/* Header */}
      <header className="px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#F97316] rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-white text-xl font-bold">
            Tick<span className="text-[#F97316]">Flo</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
          {!emailSent ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#F97316]/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#F97316]" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-[#F97316] text-2xl font-bold text-center mb-1">Forgot Password?</h1>
              <p className="text-gray-600 text-sm text-center mb-4">
                No worries, we'll send you reset instructions
              </p>

              {/* Form */}
              <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-black text-sm"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-0.5">{errors.email.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-2.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>

                {/* Back to Login */}
                <Link 
                  href="/login" 
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#F97316] mt-4 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-green-600 text-2xl font-bold text-center mb-1">Check Your Email</h1>
              <p className="text-gray-600 text-sm text-center mb-6">
                We've sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Didn't receive the email?</strong>
                  <br />
                  Check your spam folder or try again in a few minutes.
                </p>
              </div>

              {/* Back to Login */}
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#F97316] transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2"></div>
        <div className="text-gray-400 text-sm">
          <span>© 2026 TickFlo</span>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;

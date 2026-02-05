"use client"

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema)
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Invalid reset link');
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordInputs) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword
      });
      
      toast.success(response.data.message);
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
          {!resetSuccess ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#F97316]/10 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-[#F97316]" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-[#F97316] text-2xl font-bold text-center mb-1">Reset Password</h1>
              <p className="text-gray-600 text-sm text-center mb-4">
                Enter your new password below
              </p>

              {/* Form */}
              <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("newPassword")}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-black text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-[10px] mt-0.5">{errors.newPassword.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-black text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-0.5">{errors.confirmPassword.message}</p>}
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                  <p className="font-semibold mb-1">Password must contain:</p>
                  <ul className="space-y-0.5 ml-4 list-disc">
                    <li>At least 6 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !token}
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-2.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
                >
                  {isSubmitting ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-green-600 text-2xl font-bold text-center mb-1">Password Reset!</h1>
              <p className="text-gray-600 text-sm text-center mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 text-center">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>

              {/* Manual Login Link */}
              <Link 
                href="/login" 
                className="block text-center text-sm text-[#F97316] hover:underline font-semibold"
              >
                Go to Login Now
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
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#2C3E50] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

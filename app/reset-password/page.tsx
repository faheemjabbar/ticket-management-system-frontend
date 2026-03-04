"use client"

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import DottedBackground from '@/components/ui/DottedBackground';

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

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const newPasswordValue = watch("newPassword", "");

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
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {}
  };

  // Helper for password requirements checklist
  const requirements = [
    { label: "6+ characters", met: newPasswordValue.length >= 6 },
    { label: "Uppercase & Lowercase", met: /[A-Z]/.test(newPasswordValue) && /[a-z]/.test(newPasswordValue) },
    { label: "At least one number", met: /[0-9]/.test(newPasswordValue) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Side: Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <DottedBackground opacity="opacity-[0.07]" size="200px" />
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-12">
             <div className="w-12 h-12 bg-orange-600 rounded-2xl rotate-6 flex items-center justify-center text-white font-black text-2xl shadow-xl">T</div>
             <span className="text-white text-4xl font-black tracking-tight">Tick<span className="text-orange-500">Flo</span></span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-10 shadow-2xl text-left">
            <ShieldCheck className="text-orange-500 w-12 h-12 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Secure your account.</h2>
            <p className="text-slate-400 text-lg">Almost there! Choose a strong password to ensure your admin dashboard stays protected.</p>
          </div>
        </div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Right Side: Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
              <span className="text-2xl font-black text-slate-900">Tick<span className="text-orange-600">Flo</span></span>
            </div>
          </div>

          {!resetSuccess ? (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">New Password</h1>
                <p className="text-slate-500 font-medium">Create a new, strong password for your account.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("newPassword")}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-900 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-900 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.confirmPassword.message}</p>}
                </div>

                {/* Requirements Checklist */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Requirements</p>
                  <div className="grid grid-cols-1 gap-2">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-medium">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-green-100' : 'bg-slate-200'}`}>
                          <CheckCircle2 size={12} className={req.met ? 'text-green-600' : 'text-slate-400'} />
                        </div>
                        <span className={req.met ? 'text-slate-700' : 'text-slate-400'}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !token}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                >
                  {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Updating...</> : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Password Updated!</h1>
              <p className="text-slate-500 font-medium mb-8">Your account is now secure. We are redirecting you to the login page.</p>
              
              <div className="bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl border border-blue-100 inline-flex items-center gap-3">
                <Loader2 className="animate-spin" size={18} />
                <span className="font-bold text-sm">Redirecting in 3s...</span>
              </div>

              <Link href="/login" className="block mt-8 text-orange-600 font-black hover:text-orange-700 flex items-center justify-center gap-2">
                Go to Login Now <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl animate-bounce flex items-center justify-center text-white font-black text-xl">T</div>
          <div className="text-slate-400 font-bold animate-pulse tracking-widest text-xs uppercase">Loading Security...</div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
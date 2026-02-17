"use client"

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, ShieldQuestion, Send, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

// Reusable Background Pattern
const DottedBackground = ({ opacity = "opacity-[0.1]", size = "150px" }) => (
  <div 
    className={`absolute inset-0 ${opacity} pointer-events-none z-0`}
    style={{ 
      backgroundImage: 'url("/dotted.jpg")', 
      backgroundRepeat: 'repeat',
      backgroundSize: size,
    }}
  />
);

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
      // Error handled by interceptor
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Side: Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <DottedBackground opacity="opacity-[0.07]" size="200px" />
        
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-12">
             <div className="w-12 h-12 bg-orange-600 rounded-2xl -rotate-3 flex items-center justify-center text-white font-black text-2xl shadow-xl">T</div>
             <span className="text-white text-4xl font-black tracking-tight">Tick<span className="text-orange-500">Flo</span></span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-10 shadow-2xl text-left">
            <ShieldQuestion className="text-orange-500 w-12 h-12 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Secure your <br />Admin Account.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Security is our top priority. We'll help you get back into your dashboard safely and quickly.
            </p>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Right Side: Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
              <span className="text-2xl font-black text-slate-900">Tick<span className="text-orange-600">Flo</span></span>
            </div>
          </div>

          {!emailSent ? (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Reset Password</h1>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                    <Mail size={16} className="text-slate-400" /> Work Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@tickflo.com"
                    {...register("email")}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 bg-slate-50/50"
                  />
                  {errors.email && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                >
                  {isSubmitting ? "Sending Link..." : <><Send size={18}/> Send Reset Link</>}
                </button>

                <Link 
                  href="/login" 
                  className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 mt-8 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </form>
            </>
          ) : (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Check your email</h1>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                We've sent password reset instructions to your inbox. Please follow the link to continue.
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-left">
                <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> 
                  Didn't receive the email?
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Check your spam or junk folder, or wait a few minutes before trying again.
                </p>
              </div>

              <Link 
                href="/login" 
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                <ArrowLeft size={18} />
                Return to Login
              </Link>
            </div>
          )}

          </div>
        </div>
      </div>
  );
};

export default ForgotPasswordPage;
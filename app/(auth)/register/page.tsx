"use client"

import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, UserPlus, Globe, CheckCircle2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from '@/schemas/auth';
import { authAPI } from '@/lib/api';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type RegisterFormInputs = z.infer<typeof registerSchema>;

// Reusable Background Pattern from Landing
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

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "admin"
    }
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const response = await authAPI.registerAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('Admin account created successfully!');
      router.push('/organizations');
    } catch (err: any) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Side: Branded Content (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <DottedBackground opacity="opacity-[0.07]" size="200px" />
        
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-12">
             <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">T</div>
             <span className="text-white text-3xl font-black tracking-tight">Tick<span className="text-orange-500">Flo</span></span>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            The power to manage <span className="text-orange-500">everything</span> from one place.
          </h2>
          
          <ul className="space-y-6">
            {[
              { icon: <ShieldCheck className="text-orange-500" />, text: "Full administrative control over tickets" },
              { icon: <Globe className="text-orange-500" />, text: "Manage multiple organizations seamlessly" },
              { icon: <CheckCircle2 className="text-orange-500" />, text: "Analyze performance and insights" }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-slate-300">
                <div className="bg-slate-800 p-2 rounded-lg">{item.icon}</div>
                <span className="text-lg">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative Gradient Blob */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-white">
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">T</div>
              <span className="text-2xl font-black text-slate-900">Tick<span className="text-orange-600">Flo</span></span>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Setup Admin Account</h1>
            <p className="text-slate-500">Start your journey as a system administrator.</p>
          </div>

          {/* Info Banner */}
          <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex gap-4 items-start">
            <span className="text-xl">🛡️</span>
            <div>
              <p className="font-bold text-blue-900 text-sm mb-1">System Administrator Access</p>
              <p className="text-blue-700/80 text-xs leading-relaxed">
                This is the root account. You will have full authority to create organizations and manage global ticket flows.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                {...register("name")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
              />
              {errors.name && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
              <input
                type="email"
                placeholder="admin@tickflo.com"
                {...register("email")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
              />
              {errors.email && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Confirm</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {isSubmitting ? "Creating..." : <><UserPlus size={20}/> Create Admin Account</>}
            </button>

            <p className="text-center text-slate-600 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-orange-600 font-bold hover:text-orange-700 transition-colors">
                Login here
              </Link>
            </p>
          </form>


        </div>
                  {/* Copyright Footer (Mobile only visible at bottom) */}
          <p className="text-center text-slate-400 text-xs mt-12 lg:absolute lg:bottom-0 lg:left-0 lg:w-full lg:mb-4">
            © 2026 TickFlo. All rights reserved.
          </p>
      </div>
    </div>
  );
};

export default RegisterPage;
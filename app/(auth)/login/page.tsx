"use client"

import { useState } from 'react';
import { Eye, EyeOff, LogIn, KeyRound, Mail, Sparkles } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormInputs } from '@/schemas/auth';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import DottedBackground from '@/components/ui/DottedBackground';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      // Error already handled by AuthContext and axios interceptor
    }
  };

  // Demo credentials for different roles
  const demoAccounts = [
    { role: 'Admin', email: 'admin@mail.com', password: '123456'},
    { role: 'Project Manager', email: 'pm@mail.com', password: '123456'},
    { role: 'QA', email: 'qa@mail.com', password: '123456'},
    { role: 'Developer', email: 'dev@mail.com', password: '123456'},
  ];

  // Fill demo credentials
  const fillDemoCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    setShowDemoDropdown(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Side: Brand Visual (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <DottedBackground opacity="opacity-[0.07]" size="200px" />
        
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-12">
             <div className="w-12 h-12 bg-orange-600 rounded-2xl rotate-3 flex items-center justify-center text-white font-black text-2xl shadow-xl">T</div>
             <span className="text-white text-4xl font-black tracking-tight">Tick<span className="text-orange-500">Flo</span></span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
            <Sparkles className="text-orange-500 w-10 h-10 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Welcome Back.
            </h2>
            <p className="text-slate-400 text-lg">
              Sign in to continue managing your support flow and resolving customer tickets.
            </p>
          </div>
        </div>

        {/* Decorative Ambient Light */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
              <span className="text-2xl font-black text-slate-900">Tick<span className="text-orange-600">Flo</span></span>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Login</h1>
            <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" /> Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                {...register("email")}
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={errors.email ? "true" : "false"}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 bg-slate-50/50"
              />
              {errors.email && <p id="email-error" className="text-red-500 text-xs font-semibold mt-1 ml-1" role="alert">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <KeyRound size={16} className="text-slate-400" /> Password
                </label>
                <Link href="/forgot-password" className="text-orange-600 hover:text-orange-700 text-xs font-bold transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={errors.password ? "true" : "false"}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="text-red-500 text-xs font-semibold mt-1 ml-1" role="alert">{errors.password.message}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 ml-1">
              <input 
                type="checkbox" 
                id="remember"
                className="w-5 h-5 accent-orange-600 rounded-md border-slate-300 focus:ring-orange-500 cursor-pointer" 
              />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                Stay signed in
              </label>
            </div>

            {/* Demo Credentials Dropdown */}
            <div className="relative mt-4">
              <button
                type="button"
                onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles size={16} className="text-orange-500" />
                Use Demo Credentials
              </button>

              {/* Dropdown Menu */}
              {showDemoDropdown && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDemoDropdown(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="absolute top-full mt-2 w-full bg-white border-2 border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {demoAccounts.map((account, index) => (
<button
  key={index}
  type="button"
  onClick={() => fillDemoCredentials(account.email, account.password)}
  className="w-full px-4 py-2 text-left hover:bg-orange-50 transition-colors border-b border-slate-100 last:border-b-0 group"
>
  <div className="flex items-center gap-2">
    <div className="flex-1">
      <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
        {account.role}
      </div>
      <div className="text-[10px] text-slate-500 mt-0.25">
        {account.email}
      </div>
    </div>
  </div>
</button>

                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-3 text-lg mt-6"
            >
              {isSubmitting ? "Signing in..." : <><LogIn size={20}/> Login to Dashboard</>}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-slate-600 mt-8 font-medium">
              Don't have an account yet?{' '}
              <Link href="/register" className="text-orange-600 font-black hover:text-orange-700 transition-colors">
                Create Account
              </Link>
            </p>
          </form>

          {/* Footer Branding */}
          <div className="mt-16 text-center lg:absolute lg:bottom-6 lg:left-0 lg:w-full">
            <p className="text-slate-400 text-xs font-medium">
              © 2026 TickFlo. Secure Admin Access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
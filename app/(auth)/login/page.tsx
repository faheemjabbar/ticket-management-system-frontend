"use client"

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormInputs } from '@/schemas/auth';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      // Error already handled by AuthContext and axios interceptor
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
          {/* Title */}
          <h1 className="text-[#F97316] text-2xl font-bold text-center mb-1">Login</h1>
          <p className="text-gray-600 text-sm text-center mb-4">Welcome back to TickFlo</p>

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

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
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
              {errors.password && <p className="text-red-500 text-sm mt-0.5">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-2.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </button>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm mt-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 text-[#F97316] border-gray-300 rounded focus:ring-[#F97316]" />
                <span className="text-gray-700">Remember Me</span>
              </label>
              <Link href="/forgot-password" className="text-[#F97316] hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#F97316] font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">

        </div>
        <div className="text-gray-400 text-sm">
          <span>© 2026 TickFlo</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;

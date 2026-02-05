'use client';

import React, { useEffect, useLayoutEffect } from "react"

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"
import { useRequest } from "@/hooks/use-request";
import { APIS } from "@/api/const";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast()
  const [isDoneChecking, setIsDoneChecking] = useState<boolean>(false);

  const { request: loginRequest, data: loginData, loading: loginLoading } = useRequest();
  const { request: profileRequest, data: profileData, loading: isProfileLoading } = useRequest({ hideToast: true });

  useLayoutEffect(() => {
    const token = localStorage.getItem('suntech-x-atk');
    if (token) {
      profileRequest(APIS.USER.PROFILE(), {
        method: 'GET',
      })
    }
  }, []);

  useLayoutEffect(() => {
    if (!isProfileLoading) {
      const timeout = setTimeout(() => {
        setIsDoneChecking(true);
      }, 299);
      return () => clearTimeout(timeout);
    }
  }, [isProfileLoading]);

  useLayoutEffect(() => {
    if (profileData) {
      window.location.replace('/admin');
    }
  }, [profileData]);

  useEffect(() => {
    if (loginData) {
      toast({
        variant: "default",
        title: "Success",
        description: "Login successful",
      });
      localStorage.setItem('suntech-x-atk', loginData.token);
      window.location.replace('/admin');
    }
  }, [loginData]);

  const handleFeatureUnderDevelopment = (e: React.MouseEvent) => {
    e.preventDefault()
    toast({
      description: "Comming soon...",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginRequest(APIS.AUTH.LOGIN(), {
      method: 'POST',
      body: {
        email: username,
        password,
      },
    });
  };

  return !isDoneChecking ? (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Loader2 className="animate-spin" />
    </div>
  ) : (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background accent elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-primary/5 to-transparent rounded-full translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-8">
          <img src="/favicon.png" alt="Logo" className="mx-auto mb-4 w-20" />
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username or Email
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-input border border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input border border-border text-foreground placeholder:text-muted-foreground pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-input cursor-pointer accent-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" onClick={handleFeatureUnderDevelopment} className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleFeatureUnderDevelopment} className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 6c3.313 0 6 2.686 6 6 0 3.313-2.687 6-6 6s-6-2.687-6-6c0-3.314 2.687-6 6-6zm9 12c0 .553-.447 1-1 1h-16c-.553 0-1-.447-1-1v-2h4v1h10v-1h4v2z" />
              </svg>
              SSO
            </button>
            <button onClick={handleFeatureUnderDevelopment} className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
              Help
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>© 2025 Suntech Admin Panel. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}

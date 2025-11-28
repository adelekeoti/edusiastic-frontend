// src/lib/hooks/useAuth.ts - Authentication Hook

import { useAuthStore } from '@/lib/store/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as authApi from '@/lib/api/auth';
import {
  LoginCredentials,
  RegisterStudentData,
  RegisterTeacherData,
  RegisterParentData
} from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, clearAuth, setLoading } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success('Login successful!');
        
        // Redirect based on role
        const role = response.data.user.role;
        if (role === 'STUDENT') {
          router.push('/student/browse');
        } else if (role === 'TEACHER') {
          router.push('/teacher/dashboard');
        } else if (role === 'PARENT') {
          router.push('/parent/dashboard');
        } else if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        }
      }
    },
    onError: () => {
      toast.error('Login failed. Please check your credentials.');
    }
  });

  // Register student mutation
  const registerStudentMutation = useMutation({
    mutationFn: authApi.registerStudent,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success('Registration successful! Please verify your email.');
        router.push('/student/browse');
      }
    }
  });

  // Register teacher mutation
  const registerTeacherMutation = useMutation({
    mutationFn: authApi.registerTeacher,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success('Registration successful! Please verify your email.');
        router.push('/teacher/profile/edit');
      }
    }
  });

  // Register parent mutation
  const registerParentMutation = useMutation({
    mutationFn: authApi.registerParent,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success('Registration successful! Please verify your email.');
        router.push('/parent/dashboard');
      }
    }
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/login');
    }
  });

  // Verify email
  const verifyEmailMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      toast.success('Email verified successfully!');
      router.push('/login');
    }
  });

  // Resend verification
  const resendVerificationMutation = useMutation({
    mutationFn: authApi.resendVerificationEmail,
    onSuccess: () => {
      toast.success('Verification email sent!');
    }
  });

  // Forgot password
  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset link sent to your email');
    }
  });

  // Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Password reset successful!');
      router.push('/login');
    }
  });

  return {
    user,
    token,
    isAuthenticated,
    isLoading: setLoading,
    login: loginMutation.mutate,
    registerStudent: registerStudentMutation.mutate,
    registerTeacher: registerTeacherMutation.mutate,
    registerParent: registerParentMutation.mutate,
    logout: logoutMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,
    resendVerification: resendVerificationMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerStudentMutation.isPending || registerTeacherMutation.isPending || registerParentMutation.isPending
  };
};
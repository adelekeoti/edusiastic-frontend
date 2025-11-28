// src/app/(auth)/register/page.tsx - Registration Role Selection

'use client';

import Link from 'next/link';
import { GraduationCap, BookOpen, Users, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const roles = [
    {
      title: 'Student',
      description: 'Learn from expert teachers and access premium resources',
      icon: BookOpen,
      href: '/register/student',
      color: 'from-blue-900 to-blue-700',
      benefits: ['Access to expert teachers', 'Premium study materials', 'Track your progress']
    },
    {
      title: 'Teacher',
      description: 'Share your knowledge and earn by teaching students',
      icon: GraduationCap,
      href: '/register/teacher',
      color: 'from-yellow-600 to-yellow-500',
      benefits: ['Earn from your expertise', 'Build your reputation', 'Flexible schedule']
    },
    {
      title: 'Parent',
      description: 'Monitor your children\'s learning and connect with teachers',
      icon: Home,
      href: '/register/parent',
      color: 'from-blue-900 to-blue-700',
      benefits: ['Track child progress', 'Connect with teachers', 'Manage subscriptions']
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Edusiastic
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Join Edusiastic Today
          </h1>
          <p className="text-lg text-gray-600">
            Choose your role to get started
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <Link key={role.title} href={role.href}>
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary">
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <role.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
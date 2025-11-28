// src/components/layout/MobileSidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Package, 
  MessageSquare, 
  FileText,
  Award,
  Settings,
  Home,
  Search,
  ShoppingBag,
  GraduationCap,
  ClipboardList,
  UserCircle,
  DollarSign,
  BarChart,
  X
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils/cn';
import { UserRole } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

const getNavigationItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case UserRole.STUDENT:
      return [
        { title: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { title: 'Browse', href: '/student/browse', icon: Search },
        { title: 'My Courses', href: '/student/my-courses', icon: BookOpen },
        { title: 'Assignments', href: '/student/assignments', icon: ClipboardList },
        { title: 'Groups', href: '/student/groups', icon: Users },
        { title: 'Discover', href: '/student/discover', icon: FileText },
        { title: 'Messages', href: '/messages', icon: MessageSquare },
        { title: 'AI Assistant', href: '/student/ai-assistant', icon: GraduationCap },
      ];

    case UserRole.TEACHER:
      return [
        { title: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
        { title: 'Profile', href: '/teacher/profile', icon: UserCircle },
        { title: 'Products', href: '/teacher/products', icon: Package },
        { title: 'Groups', href: '/teacher/groups', icon: Users },
        { title: 'Assignments', href: '/teacher/assignments', icon: ClipboardList },
        { title: 'Students', href: '/teacher/students', icon: Users },
        { title: 'Posts', href: '/teacher/posts', icon: FileText },
        { title: 'Messages', href: '/messages', icon: MessageSquare },
        { title: 'Earnings', href: '/teacher/earnings', icon: DollarSign },
        { title: 'Analytics', href: '/teacher/analytics', icon: BarChart },
      ];

    case UserRole.PARENT:
      return [
        { title: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
        { title: 'My Children', href: '/parent/children', icon: Users },
        { title: 'Browse', href: '/parent/browse', icon: Search },
        { title: 'Purchases', href: '/parent/purchases', icon: ShoppingBag },
        { title: 'Teachers', href: '/parent/teachers', icon: Award },
        { title: 'Messages', href: '/messages', icon: MessageSquare },
      ];

    case UserRole.ADMIN:
      return [
        { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'Users', href: '/admin/users', icon: Users },
        { title: 'Products', href: '/admin/products', icon: Package },
        { title: 'Verifications', href: '/admin/verifications', icon: Award },
        { title: 'Refunds', href: '/admin/refunds', icon: DollarSign },
        { title: 'Analytics', href: '/admin/analytics', icon: BarChart },
      ];

    default:
      return [];
  }
};

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  const navItems = getNavigationItems(user.role);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left">Navigation</SheetTitle>
        </SheetHeader>
        
        <div className="overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {/* Home Link */}
            <Link
              href="/"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'text-gray-700 hover:bg-gray-100 hover:text-primary'
              )}
            >
              <Home className="h-5 w-5" />
              Home
            </Link>

            {/* Divider */}
            <div className="my-4 border-t" />

            {/* Role-based Navigation */}
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-4 border-primary'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-4 border-t" />

            {/* Settings */}
            <Link
              href="/settings"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/settings'
                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-4 border-primary'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
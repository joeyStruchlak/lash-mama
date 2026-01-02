'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types/user';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Bell,
  UserCircle,
  ClipboardList,
  AlertCircle,
  Crown,
  TrendingUp,
  MessageSquare,
  FileText,
  Settings,
  BookOpen,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  roles: UserRole[];
}

interface DashboardSidebarProps {
  userRole: UserRole;
  unreadNotifications?: number;
  unreadMessages?: number;
}

export function DashboardSidebar({ 
  userRole, 
  unreadNotifications = 0,
  unreadMessages = 0 
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // Define all possible menu items with role permissions
  const menuItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: userRole === 'admin' ? '/admin' : userRole === 'manager' ? '/manager' : '/staff',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      label: 'Calendar',
      href: `/${userRole}/calendar`,
      icon: Calendar,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      label: 'Bookings',
      href: `/${userRole}/bookings`,
      icon: BookOpen,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Staff',
      href: `/${userRole}/staff`,
      icon: Users,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Notifications',
      href: `/${userRole}/notifications`,
      icon: Bell,
      badge: unreadNotifications,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Clients',
      href: `/${userRole}/clients`,
      icon: UserCircle,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Aftercare',
      href: `/${userRole}/aftercare`,
      icon: ClipboardList,
      roles: ['manager'],
    },
    {
      label: 'Allergy Forms',
      href: `/${userRole}/allergy-forms`,
      icon: AlertCircle,
      roles: ['manager'],
    },
    {
      label: 'VIP Program',
      href: `/${userRole}/vip-program`,
      icon: Crown,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      roles: ['admin'],
    },
    {
      label: 'Messages',
      href: `/${userRole}/messages`,
      icon: MessageSquare,
      badge: unreadMessages,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      label: 'My Notes',
      href: '/staff/notes',
      icon: FileText,
      roles: ['staff'],
    },
    {
      label: 'Settings',
      href: `/${userRole}/settings`,
      icon: Settings,
      roles: ['admin', 'manager'],
    },
  ];

  // Filter menu items based on user role
  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-[#C9A871] text-white shadow-md' 
                  : 'text-[#3D3D3D] hover:bg-[#F5F2EF] hover:text-[#2A2A2A]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} strokeWidth={2} />
                <span className="font-medium">{item.label}</span>
              </div>
              
              {item.badge && item.badge > 0 && (
                <span className="bg-[#D4AF37] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
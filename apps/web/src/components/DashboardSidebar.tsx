'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types/user';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
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
      icon: '📊',
      roles: ['admin', 'manager', 'staff'],
    },
    {
      label: 'Calendar',
      href: `/${userRole}/calendar`,
      icon: '📅',
      roles: ['admin', 'manager', 'staff'],
    },
    {
      label: 'Staff',
      href: `/${userRole}/staff`,
      icon: '👥',
      roles: ['admin', 'manager'],
    },
    {
      label: 'Notifications',
      href: `/${userRole}/notifications`,
      icon: '🔔',
      badge: unreadNotifications,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Clients',
      href: `/${userRole}/clients`,
      icon: '👤',
      roles: ['admin', 'manager'],
    },
    {
      label: 'Aftercare',
      href: `/${userRole}/aftercare`,
      icon: '📋',
      roles: ['manager'],
    },
    {
      label: 'Allergy Forms',
      href: `/${userRole}/allergy-forms`,
      icon: '🏥',
      roles: ['manager'],
    },
    {
      label: 'VIP Program',
      href: `/${userRole}/vip-program`,
      icon: '💎',
      roles: ['admin', 'manager'],
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: '📈',
      roles: ['admin'],
    },
    {
      label: 'Messages',
      href: `/${userRole}/messages`,
      icon: '💬',
      badge: unreadMessages,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      label: 'My Notes',
      href: '/staff/notes',
      icon: '📝',
      roles: ['staff'],
    },
    {
      label: 'Settings',
      href: `/${userRole}/settings`,
      icon: '⚙️',
      roles: ['admin', 'manager'],
    },
  ];

  // Filter menu items based on user role
  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white border-r border-gold-200 min-h-screen p-6">
      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-gold-100 text-gold-700 font-semibold' 
                  : 'text-dark-secondary hover:bg-gold-50 hover:text-dark'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              
              {item.badge && item.badge > 0 && (
                <span className="bg-gold-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
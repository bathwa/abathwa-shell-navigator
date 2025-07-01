
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Home,
  TrendingUp,
  Users,
  Settings,
  PieChart,
  CreditCard,
  Eye,
  FileText,
  User,
  Building2,
  Briefcase,
  Shield,
  Target,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const ModernSidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const { t } = useLanguage();

  if (!user) return null;

  const getNavItems = () => {
    const role = user.role || user.user_metadata?.role || 'entrepreneur';
    
    switch (role) {
      case 'entrepreneur':
        return [
          { to: '/entrepreneur/dashboard', icon: Home, label: t('common.dashboard') },
          { to: '/entrepreneur/opportunities', icon: TrendingUp, label: t('nav.opportunities') },
          { to: '/entrepreneur/service-providers', icon: Users, label: t('nav.serviceProviders') },
          { to: '/entrepreneur/investments', icon: PieChart, label: t('nav.investments') },
          { to: '/entrepreneur/milestones', icon: Target, label: 'Milestones' },
          { to: '/entrepreneur/reports', icon: FileText, label: t('nav.reports') },
        ];
      case 'investor':
        return [
          { to: '/investor/dashboard', icon: Home, label: t('common.dashboard') },
          { to: '/investor/opportunities', icon: TrendingUp, label: t('nav.opportunities') },
          { to: '/investor/investments', icon: PieChart, label: t('nav.investments') },
          { to: '/investor/pools', icon: Users, label: t('nav.pools') },
          { to: '/investor/service-providers', icon: Briefcase, label: t('nav.serviceProviders') },
          { to: '/investor/reports', icon: FileText, label: t('nav.reports') },
        ];
      case 'service_provider':
        return [
          { to: '/service-provider/dashboard', icon: Home, label: t('common.dashboard') },
          { to: '/service-provider/requests', icon: FileText, label: 'Service Requests' },
          { to: '/service-provider/tasks', icon: Target, label: 'My Tasks' },
          { to: '/service-provider/payments', icon: CreditCard, label: 'Payments' },
        ];
      case 'admin':
      case 'super_admin':
        return [
          { to: '/admin/dashboard', icon: Home, label: t('common.dashboard') },
          { to: '/admin/users', icon: Users, label: t('nav.users') },
          { to: '/admin/opportunities', icon: Eye, label: t('nav.opportunities') },
          { to: '/admin/pools', icon: Building2, label: t('nav.pools') },
          { to: '/admin/escrow', icon: Shield, label: t('nav.escrow') },
          { to: '/admin/settings', icon: Settings, label: t('nav.settings') },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 h-full transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

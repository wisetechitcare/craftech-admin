import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, Settings, LogOut,
  Building2, Video, X, Users, MessageSquare,
  Image as ImageIcon, Home, Layers, Star, ChevronRight,
  Cpu, FileText, Briefcase, BookOpen, BarChart3, HelpCircle, Palette
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/home', icon: Home, label: 'Hero & Stats' },
      { to: '/admin/process', icon: Layers, label: 'Process Blueprint' },
      { to: '/admin/features', icon: Star, label: 'Why Features' },
      { to: '/admin/pillars', icon: Cpu, label: 'Core Pillars' },
      { to: '/admin/services', icon: Briefcase, label: 'Domain Specialization' },
    ],
  },
  {
    label: 'Projects & Media',
    items: [
      { to: '/admin/projects', icon: FolderOpen, label: 'Projects' },
      { to: '/admin/media-library', icon: ImageIcon, label: 'Media Library' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/admin/testimonials', icon: FileText, label: 'Testimonials' },
      { to: '/admin/clients', icon: Building2, label: 'Clients' },
      { to: '/admin/leads', icon: MessageSquare, label: 'Leads' },
    ],
  },
  {
    label: 'Growth & Analytics',
    items: [
      { to: '/admin/blog', icon: BookOpen, label: 'Blog' },
      { to: '/admin/team', icon: Users, label: 'Team' },
      { to: '/admin/faq', icon: HelpCircle, label: 'FAQs' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/appearance', icon: Palette, label: 'Appearance' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = admin?.name
    ? admin.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 lg:hidden bg-ink/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col bg-paper border-r border-line transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white tracking-wider">CT</span>
            </div>
            <div>
              <p className="font-display text-[0.95rem] font-bold text-ink leading-none">Craftech</p>
              <p className="text-[0.6rem] mt-1 font-semibold uppercase tracking-[0.14em] text-ink-faint">Engineering Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-ink-mute hover:text-ink hover:bg-raise transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 pl-3 pr-2 py-2 rounded-[10px] text-[0.83rem] transition-colors duration-150 relative ${
                        isActive
                          ? 'bg-accent/[0.07] text-ink font-semibold'
                          : 'text-ink-soft font-medium hover:bg-raise hover:text-ink'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Accent rail — carried over from the public site's
                            section marker, the one signature both UIs share. */}
                        {isActive && (
                          <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-accent" />
                        )}
                        <Icon className={`w-[17px] h-[17px] flex-shrink-0 ${isActive ? 'text-accent' : 'text-ink-faint group-hover:text-ink-mute'}`} />
                        <span className="flex-1 truncate">{label}</span>
                        {isActive && <ChevronRight className="w-3 h-3 text-accent/70" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="px-3 pb-3 pt-3 border-t border-line-2">
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-[10px] bg-raise mb-1">
            <div className="w-8 h-8 rounded-[10px] bg-navy flex items-center justify-center flex-shrink-0 text-[0.7rem] font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{admin?.name || 'Admin'}</p>
              <p className="text-[0.65rem] text-ink-mute truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2.5 py-2 rounded-[10px] text-[0.83rem] font-medium text-ink-mute hover:bg-danger/[0.06] hover:text-danger transition-colors"
          >
            <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

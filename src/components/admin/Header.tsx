import React, { useState, useEffect } from 'react';
import { Menu, Bell, ChevronRight, Home } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Crumb {
  label: string;
  href?: string;
}

const breadcrumbMap: Record<string, Crumb[]> = {
  '/admin': [{ label: 'Dashboard', href: '/admin' }],
  '/admin/home': [{ label: 'Dashboard', href: '/admin' }, { label: 'Hero & Stats' }],
  '/admin/process': [{ label: 'Dashboard', href: '/admin' }, { label: 'Process Blueprint' }],
  '/admin/features': [{ label: 'Dashboard', href: '/admin' }, { label: 'Why Features' }],
  '/admin/pillars': [{ label: 'Dashboard', href: '/admin' }, { label: 'Core Pillars' }],
  '/admin/services': [{ label: 'Dashboard', href: '/admin' }, { label: 'Domain Specialization' }],
  '/admin/projects': [{ label: 'Dashboard', href: '/admin' }, { label: 'Projects' }],
  '/admin/projects/new': [{ label: 'Dashboard', href: '/admin' }, { label: 'Projects', href: '/admin/projects' }, { label: 'New Project' }],
  '/admin/media': [{ label: 'Dashboard', href: '/admin' }, { label: 'Media Library' }],
  '/admin/testimonials': [{ label: 'Dashboard', href: '/admin' }, { label: 'Testimonials' }],
  '/admin/clients': [{ label: 'Dashboard', href: '/admin' }, { label: 'Clients' }],
  '/admin/leads': [{ label: 'Dashboard', href: '/admin' }, { label: 'Leads' }],
  '/admin/settings': [{ label: 'Dashboard', href: '/admin' }, { label: 'Settings' }],
};

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();
  const { admin } = useAuth();
  const [dateStr, setDateStr] = useState(formatDate());

  useEffect(() => {
    const t = setInterval(() => setDateStr(formatDate()), 60000);
    return () => clearInterval(t);
  }, []);

  const crumbs = pathname.startsWith('/admin/projects/') && pathname !== '/admin/projects/new'
    ? [{ label: 'Dashboard', href: '/admin' }, { label: 'Projects', href: '/admin/projects' }, { label: 'Edit Project' }]
    : (breadcrumbMap[pathname] || [{ label: 'Dashboard', href: '/admin' }, { label: 'Admin' }]);

  const pageTitle = crumbs[crumbs.length - 1]?.label || 'Admin';
  const initials = admin?.name
    ? admin.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3 bg-paper/85 backdrop-blur-xl border-b border-line">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 text-ink-soft hover:bg-raise transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex-1 flex items-center gap-1.5 min-w-0">
        <Home className="w-3.5 h-3.5 flex-shrink-0 text-ink-faint" />
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0 text-ink-faint" />}
            {crumb.href && i < crumbs.length - 1 ? (
              <Link to={crumb.href} className="text-xs text-ink-mute truncate hover:text-accent transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-xs font-semibold text-ink truncate" aria-current="page">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden sm:block text-xs text-ink-mute tabular-nums px-2.5 py-1.5 rounded-lg bg-raise border border-line-2">
          {dateStr}
        </span>

        <button
          className="w-9 h-9 rounded-[10px] flex items-center justify-center relative text-ink-soft hover:bg-raise transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent ring-2 ring-paper" />
        </button>

        <div
          className="w-9 h-9 rounded-[10px] bg-navy flex items-center justify-center text-[0.7rem] font-bold text-white select-none cursor-default"
          title={admin?.name}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

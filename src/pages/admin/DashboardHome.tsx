import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import {
  FolderOpen, MessageSquare, Image as ImageIcon, CheckCircle,
  ArrowRight, Plus, Video, Users, Globe, Database, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ label, value, icon: Icon, loading, accent }: any) => (
  <div className="relative bg-paper border border-line rounded-2xl p-5 overflow-hidden">
    {/* Accent rule — the public site's section marker, reused as the card's
        identity line. Only the primary metric gets the red one. */}
    <span className={`absolute top-0 left-5 w-8 h-[2px] ${accent ? 'bg-accent' : 'bg-line'}`} />
    <div className="flex items-center gap-2 mb-4 text-ink-mute">
      <Icon className="w-[18px] h-[18px]" />
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em]">{label}</span>
    </div>
    <p className="font-display text-[2.4rem] leading-none font-bold text-ink tabular-nums">
      {loading
        ? <span className="inline-block w-14 h-8 rounded bg-raise animate-pulse align-bottom" />
        : value}
    </p>
  </div>
);

const QuickAction = ({ to, icon: Icon, label, description, accent }: any) => (
  <Link
    to={to}
    className={`group flex items-center gap-3.5 p-3.5 rounded-xl border transition-colors ${
      accent
        ? 'bg-accent/[0.06] border-accent/25 hover:bg-accent/[0.11]'
        : 'bg-raise border-line hover:bg-line-2'
    }`}
  >
    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
      accent ? 'bg-accent text-white' : 'bg-paper border border-line text-ink-soft'
    }`}>
      <Icon className="w-[18px] h-[18px]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="text-xs mt-0.5 text-ink-mute truncate">{description}</p>
    </div>
    <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
      accent ? 'text-accent' : 'text-ink-faint'
    }`} />
  </Link>
);

const StatusItem = ({ icon: Icon, label, status }: any) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-line-2 last:border-0">
    <Icon className="w-4 h-4 flex-shrink-0 text-ink-faint" />
    <span className="flex-1 text-sm text-ink">{label}</span>
    <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ok">
      <span className="w-1.5 h-1.5 rounded-full bg-ok" />
      {status}
    </span>
  </div>
);

const Panel = ({ title, action, children }: any) => (
  <section className="bg-paper border border-line rounded-2xl">
    <header className="flex items-center justify-between px-5 py-3.5 border-b border-line-2">
      <h2 className="admin-eyebrow">{title}</h2>
      {action}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { admin } = useAuth();

  useEffect(() => {
    authApi.getStats()
      .then((res: any) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: 'Active leads', value: stats?.totalLeads || 0, icon: MessageSquare, accent: true },
    { label: 'Projects', value: stats?.totalProjects || 0, icon: FolderOpen },
    {
      label: 'Media assets',
      value: (stats?.totalImages || 0) + (stats?.totalProjectVideos || 0),
      icon: ImageIcon,
    },
    {
      label: 'CMS entries',
      value: (stats?.totalSteps || 0) + (stats?.totalFeatures || 0) + (stats?.totalTestimonials || 0),
      icon: CheckCircle,
    },
  ];

  const mediaBreakdown = [
    { icon: FolderOpen, label: 'Projects', value: stats?.totalProjects || 0 },
    { icon: ImageIcon, label: 'Images', value: stats?.totalImages || 0 },
    { icon: Video, label: 'Videos', value: stats?.totalProjectVideos || 0 },
    { icon: Users, label: 'Testimonials', value: stats?.totalTestimonials || 0 },
  ];

  return (
    <div className="space-y-5">

      {/* Page header — same eyebrow + display-serif pairing as the public site */}
      <header>
        <p className="admin-eyebrow mb-2.5">{greeting()}</p>
        <h1 className="font-display text-[1.9rem] leading-tight font-bold text-ink">
          {admin?.name || 'Admin'}
        </h1>
        <p className="text-sm text-ink-mute mt-1">
          Manage projects, content, and media for craftechengineers.com.
        </p>
      </header>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Quick actions">
          <div className="space-y-2.5">
            <QuickAction to="/admin/projects/new" icon={Plus} label="New project"
              description="Add a construction project with media" accent />
            <QuickAction to="/admin/leads" icon={MessageSquare} label="View leads"
              description="Review recent contact submissions" />
            <QuickAction to="/admin/media" icon={ImageIcon} label="Media library"
              description="Manage project images and videos" />
            <QuickAction to="/admin/home" icon={Globe} label="Edit homepage"
              description="Update hero slides and stats" />
          </div>
        </Panel>

        <Panel title="System status">
          <StatusItem icon={Globe} label="Backend API" status="Operational" />
          <StatusItem icon={Database} label="MongoDB Atlas" status="Connected" />
          <StatusItem icon={ImageIcon} label="Cloudinary CDN" status="Active" />
        </Panel>
      </div>

      <Panel
        title="Media overview"
        action={
          <Link to="/admin/media"
            className="flex items-center gap-1 text-xs font-semibold text-ink-mute hover:text-accent transition-colors">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line-2">
          {mediaBreakdown.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5 py-4 sm:py-1">
              <item.icon className="w-4 h-4 text-ink-faint" />
              <p className="font-display text-2xl font-bold text-ink tabular-nums leading-none">
                {loading ? '–' : item.value}
              </p>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-mute">{item.label}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

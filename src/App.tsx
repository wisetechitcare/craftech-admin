import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/admin/Login';
import AdminLayout from './components/admin/Layout';

import DashboardHome from './pages/admin/DashboardHome';
import ProjectsList from './pages/admin/projects/ProjectsList';
import ProjectForm from './pages/admin/projects/ProjectForm';
import MediaManager from './pages/admin/MediaManager';

import HeroCMS from './pages/admin/cms/HeroCMS';
import AboutCMS from './pages/admin/cms/AboutCMS';
import StatsCMS from './pages/admin/cms/StatsCMS';
import ProcessCMS from './pages/admin/cms/ProcessCMS';
import FeaturesCMS from './pages/admin/cms/FeaturesCMS';
import PillarsCMS from './pages/admin/cms/PillarsCMS';
import ServicesCMS from './pages/admin/cms/ServicesCMS';
import TestimonialsList from './pages/admin/cms/TestimonialsList';
import ClientsList from './pages/admin/cms/ClientsList';
import LeadsCRM from './pages/admin/LeadsCRM';
import Settings from './pages/admin/cms/Settings';
import Appearance from './pages/admin/cms/Appearance';
import CTACMS from './pages/admin/cms/CTACMS';
import AnalyticsDashboard from './pages/admin/analytics/Dashboard';
import BlogManager from './pages/admin/blog/BlogManager';
import BlogForm from './pages/admin/blog/BlogForm';
import TeamManager from './pages/admin/team/TeamManager';
import TeamForm from './pages/admin/team/TeamForm';
import FAQManager from './pages/admin/faq/FAQManager';
import FAQForm from './pages/admin/faq/FAQForm';
import MediaLibrary from './pages/admin/media/MediaLibrary';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#fff' },
      }} />
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin Auth */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="hero" element={<HeroCMS />} />
          <Route path="about" element={<AboutCMS />} />
          <Route path="stats" element={<StatsCMS />} />
          {/* The old combined page split into the three above; keep bookmarks working. */}
          <Route path="home" element={<Navigate to="/admin/hero" replace />} />
          <Route path="process" element={<ProcessCMS />} />
          <Route path="features" element={<FeaturesCMS />} />
          <Route path="pillars" element={<PillarsCMS />} />
          <Route path="services" element={<ServicesCMS />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectForm />} />
          <Route path="media" element={<MediaManager />} />
          <Route path="media-library" element={<MediaLibrary />} />
          <Route path="testimonials" element={<TestimonialsList />} />
          <Route path="clients" element={<ClientsList />} />
          <Route path="leads" element={<LeadsCRM />} />
          <Route path="ctas" element={<CTACMS />} />
          <Route path="settings" element={<Settings />} />
          <Route path="appearance" element={<Appearance />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="blog/new" element={<BlogForm />} />
          <Route path="blog/:id" element={<BlogForm />} />
          <Route path="team" element={<TeamManager />} />
          <Route path="team/new" element={<TeamForm />} />
          <Route path="team/:id" element={<TeamForm />} />
          <Route path="faq" element={<FAQManager />} />
          <Route path="faq/new" element={<FAQForm />} />
          <Route path="faq/:id" element={<FAQForm />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

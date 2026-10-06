import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/admin/Login";
import AcceptInvite from "./pages/admin/AcceptInvite";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Users from "./pages/admin/Users";
import AdminLayout from "./components/admin/Layout";

import DashboardHome from "./pages/admin/DashboardHome";
import ModuleHub from "./pages/admin/ModuleHub";
import ProjectsList from "./pages/admin/projects/ProjectsList";
import ProjectForm from "./pages/admin/projects/ProjectForm";
import MediaManager from "./pages/admin/MediaManager";

import HeroCMS from "./pages/admin/cms/HeroCMS";
import AboutCMS from "./pages/admin/cms/AboutCMS";
import StatsCMS from "./pages/admin/cms/StatsCMS";
import ProcessCMS from "./pages/admin/cms/ProcessCMS";
import FeaturesCMS from "./pages/admin/cms/FeaturesCMS";
import PillarsCMS from "./pages/admin/cms/PillarsCMS";
import ServicesCMS from "./pages/admin/cms/ServicesCMS";
import TestimonialsList from "./pages/admin/cms/TestimonialsList";
import ClientsManager from "./pages/admin/clients/ClientsManager";
import ClientForm from "./pages/admin/clients/ClientForm";
import LeadsCRM from "./pages/admin/LeadsCRM";
import Settings from "./pages/admin/cms/Settings";
import AppearanceStyle from "./pages/admin/appearance/AppearanceStyle";
import { PreviewSection } from "./components/admin/ui/SitePreview";
import SectionTabs from "./components/admin/ui/SectionTabs";
import { LEGACY_ADMIN_REDIRECTS } from "./lib/constants/sidebar";
import SiteIdentityLayout from "./pages/admin/site-identity/SiteIdentityLayout";
import SiteIdentityBranding from "./pages/admin/site-identity/SiteIdentityBranding";
import SiteIdentityCursor from "./pages/admin/site-identity/SiteIdentityCursor";
import SiteIdentityScrollProgress from "./pages/admin/site-identity/SiteIdentityScrollProgress";
import NavbarCMS from "./pages/admin/cms/NavbarCMS";
import CTACMS from "./pages/admin/cms/CTACMS";
import AnalyticsDashboard from "./pages/admin/analytics/Dashboard";
import BlogManager from "./pages/admin/blog/BlogManager";
import BlogForm from "./pages/admin/blog/BlogForm";
import TeamManager from "./pages/admin/team/TeamManager";
import TeamForm from "./pages/admin/team/TeamForm";
import FAQManager from "./pages/admin/faq/FAQManager";
import ContactCMS from "./pages/admin/cms/ContactCMS";
import FAQForm from "./pages/admin/faq/FAQForm";
import GalleryManager from "./pages/admin/gallery/GalleryManager";
import MediaLibrary from "./pages/admin/media/MediaLibrary";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1e293b", color: "#fff" },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin Auth */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<Users />} />
          <Route
            path="invitations"
            element={<Navigate to="/admin/users" replace />}
          />
          <Route path="home">
            <Route index element={<ModuleHub />} />
            {/* Sections with a style get Content / Appearance tabs; the key
                remounts the style form so it never shows the last section's value. */}
            <Route path="hero" element={<SectionTabs />}>
              <Route index element={<HeroCMS />} />
              <Route
                path="appearance"
                element={
                  <AppearanceStyle
                    key="hero"
                    field="heroVariant"
                    label="Hero Style"
                    section={PreviewSection.HERO}
                  />
                }
              />
            </Route>
            <Route path="services" element={<ServicesCMS />} />
            <Route path="gallery" element={<SectionTabs />}>
              <Route index element={<GalleryManager />} />
              <Route
                path="appearance"
                element={
                  <AppearanceStyle
                    key="gallery"
                    field="galleryVariant"
                    label="Gallery Style"
                    section={PreviewSection.GALLERY}
                    viewportHeight={1500}
                    note="One style for the homepage Gallery section and the /gallery page. The images and copy are edited on the Content tab."
                  />
                }
              />
            </Route>
            <Route path="faq" element={<SectionTabs />}>
              <Route index element={<FAQManager />} />
              <Route
                path="appearance"
                element={
                  <AppearanceStyle
                    key="faq"
                    field="faqVariant"
                    label="FAQ Style"
                    section={PreviewSection.FAQ}
                  />
                }
              />
            </Route>
            <Route path="faq/new" element={<FAQForm />} />
            <Route path="faq/:id" element={<FAQForm />} />
            <Route path="contact" element={<SectionTabs />}>
              <Route index element={<ContactCMS />} />
              <Route
                path="appearance"
                element={
                  <AppearanceStyle
                    key="contact"
                    field="contactVariant"
                    label="Contact Style"
                    section={PreviewSection.CONTACT}
                    viewportHeight={1200}
                  />
                }
              />
            </Route>
          </Route>
          <Route path="about" element={<SectionTabs />}>
            <Route index element={<AboutCMS />} />
            <Route
              path="appearance"
              element={
                <AppearanceStyle
                  key="about"
                  field="aboutVariant"
                  label="About Style"
                  section={PreviewSection.ABOUT}
                  viewportHeight={3200}
                />
              }
            />
          </Route>
          <Route path="clients">
            <Route element={<SectionTabs />}>
              <Route index element={<ClientsManager />} />
              <Route
                path="appearance"
                element={
                  <AppearanceStyle
                    key="clients"
                    field="clientsVariant"
                    label="Clients Style"
                    section={PreviewSection.CLIENTS}
                    viewportHeight={420}
                    note="Home and About clients sections follow the site theme. The global bottom strip always uses the scrolling logo band. Logo grid image options stay on the Content tab."
                  />
                }
              />
            </Route>
            <Route path="new" element={<ClientForm />} />
            <Route path=":id/edit" element={<ClientForm />} />
          </Route>
          <Route path="navbar" element={<SectionTabs />}>
            <Route index element={<NavbarCMS />} />
            <Route
              path="appearance"
              element={
                <AppearanceStyle
                  key="navbar"
                  field="navbarVariant"
                  label="Navbar Style"
                  section={PreviewSection.NAVBAR}
                  viewportHeight={340}
                  note="The navigation style applies globally on every page. Link labels and the call-to-action are edited on the Content tab."
                />
              }
            />
          </Route>
          {Object.entries(LEGACY_ADMIN_REDIRECTS).map(([from, to]) => (
            <Route
              key={from}
              path={from}
              element={<Navigate to={to} replace />}
            />
          ))}
          <Route path="features" element={<FeaturesCMS />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectForm />} />
          <Route path="media" element={<MediaManager />} />
          <Route path="media-library" element={<MediaLibrary />} />
          <Route path="testimonials" element={<TestimonialsList />} />
          <Route path="leads" element={<LeadsCRM />} />
          <Route path="ctas" element={<CTACMS />} />
          <Route path="settings" element={<Settings />} />
          <Route path="site-identity">
            <Route index element={<ModuleHub />} />
            <Route element={<SiteIdentityLayout />}>
              <Route path="branding" element={<SiteIdentityBranding />} />
              <Route
                path="theme"
                element={
                  <AppearanceStyle
                    key="site"
                    field="heroVariant"
                    label="Site Theme"
                    section={PreviewSection.SITE}
                    viewportHeight={5600}
                  />
                }
              />
              <Route path="cursor" element={<SiteIdentityCursor />} />
              <Route
                path="scroll-progress"
                element={<SiteIdentityScrollProgress />}
              />
            </Route>
          </Route>
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="blog/new" element={<BlogForm />} />
          <Route path="blog/:id" element={<BlogForm />} />
          <Route path="team" element={<TeamManager />} />
          <Route path="team/new" element={<TeamForm />} />
          <Route path="team/:id" element={<TeamForm />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

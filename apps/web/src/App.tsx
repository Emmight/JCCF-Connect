
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SiteBanner from "./components/SiteBanner";
import PageMeta from "./components/PageMeta";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProgrammesPage from "./pages/ProgrammesPage";
import LeadershipPage from "./pages/LeadershipPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import MediaPage from "./pages/MediaPage";
import BirthdaysPage from "./pages/BirthdaysPage";
import AdminLoginPage from "./pages/AdminLoginPage";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import ExecutivesPage from "./admin/ExecutivesPage";
import AdminMediaRequestsPage from "./admin/AdminMediaRequestsPage";
import AdminContentPage from "./admin/AdminContentPage";
import AdminMediaPage from "./admin/AdminMediaPage";
import AdminCatalogPage from "./admin/AdminCatalogPage";
import AdminSettingsPage from "./admin/AdminSettingsPage";
import AdminActivityPage from "./admin/AdminActivityPage";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="Page not found | JCCF Connect"
        description="The page you're looking for is not available on JCCF Connect."
      />
      <SiteBanner />
      <Navbar />
      <main className="relative isolate flex min-h-[65vh] items-center justify-center overflow-hidden px-5 py-20 text-center">
        <div aria-hidden="true" className="absolute -z-10 h-[28rem] w-[28rem] rounded-full bg-[#EAF4EE] blur-3xl" />
        <div className="max-w-xl">
          <p className="font-serif text-8xl font-semibold tracking-tight text-[#087443]">404</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#A07B12]">Page not found</p>
          <h1 className="mt-3 font-['Playfair_Display'] text-3xl font-semibold sm:text-4xl">This page isn’t in our story.</h1>
          <p className="mt-4 leading-7 text-[#647168]">The link may have changed, or the page may no longer be available.</p>
          <Link to="/" className="mt-8 inline-flex items-center justify-center rounded-full bg-[#087443] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#087443]/15 transition hover:-translate-y-0.5 hover:bg-[#063D29]">
            Return to JCCF Connect
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programmes" element={<ProgrammesPage />} />
          <Route path="/leadership" element={<LeadershipPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/birthdays" element={<BirthdaysPage />} />

          {/* Admin login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected administration dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="executives" element={<ExecutivesPage />} />
              <Route path="administrations" element={<AdminCatalogPage />} />
              <Route path="programmes" element={<AdminCatalogPage />} />
              <Route path="announcements" element={<AdminContentPage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route path="birthdays" element={<AdminContentPage />} />
              <Route path="media-requests" element={<AdminMediaRequestsPage />} />
              <Route path="activity" element={<AdminActivityPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

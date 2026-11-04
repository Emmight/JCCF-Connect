
import { useState } from "react";
import {
  Activity,
  Bell,
  Cake,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  Image,
  LogOut,
  Menu,
  Megaphone,
  Settings,
  Users,
  X,
  Inbox,
  Layers3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PageMeta from "../components/PageMeta";

type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigation: NavigationGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/admin", icon: Home, end: true },
    ],
  },
  {
    label: "CONTENT MANAGEMENT",
    items: [
      { label: "Executives", path: "/admin/executives", icon: Users },
      { label: "Administrations", path: "/admin/administrations", icon: Layers3 },
      { label: "Programmes", path: "/admin/programmes", icon: CalendarDays },
      { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
      { label: "Media vault", path: "/admin/media", icon: Image },
      { label: "Birthdays", path: "/admin/birthdays", icon: Cake },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      { label: "Media requests", path: "/admin/media-requests", icon: Inbox },
      { label: "Activity log", path: "/admin/activity", icon: Activity },
    ],
  },
  {
    label: "PREFERENCES",
    items: [
      { label: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  media_team: "Media Team",
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPage =
    navigation
      .flatMap((group) => group.items)
      .find((item) =>
        item.path === "/admin"
          ? location.pathname === "/admin"
          : location.pathname.startsWith(item.path)
      )?.label ?? "Admin";

  const fullName = user?.fullName || "Administrator";
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const role = user?.role
    ? roleLabels[user.role] ?? user.role
    : "Administrator";

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#17251d]">
      <PageMeta
        title={`${currentPage} | JCCF Administration`}
        description={`Manage JCCF University of Offa ${currentPage.toLowerCase()} records and website content.`}
      />
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#e8eee9] bg-white transition-all duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[82px]" : "lg:w-[260px]"}`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-[#edf0ed] px-5">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/images/jccf-logo.png"
              alt="JCCF"
              className="h-10 w-10 shrink-0 object-contain"
            />

            {!collapsed && (
              <div className="min-w-0">
                <p className="font-bold text-[#063d29]">JCCF Connect</p>
                <p className="text-[10px] text-gray-400">ADMINISTRATION</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {navigation.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.12em] text-gray-400">
                  {group.label}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end ?? false}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-[#eaf5ee] text-[#087443]"
                            : "text-gray-500 hover:bg-[#f5f8f5] hover:text-[#063d29]"
                        }`
                      }
                    >
                      <Icon size={19} className="shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#edf0ed] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden w-full items-center justify-center gap-2 rounded-xl p-3 text-sm text-gray-500 hover:bg-gray-100 lg:flex"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && "Collapse sidebar"}
          </button>

          {!collapsed && (
            <div className="mt-2 rounded-xl border border-[#e5eee7] bg-[#f3f7f3] p-3">
              <p className="text-xs font-semibold text-[#063d29]">
                Chapter administration
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Leadership &amp; stewardship
              </p>
            </div>
          )}
        </div>
      </aside>

      <div
        className={`min-h-screen transition-all duration-200 ${
          collapsed ? "lg:pl-[82px]" : "lg:pl-[260px]"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e8eee9] bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-sm font-semibold text-[#17251d]">
                {currentPage}
              </p>
              <p className="hidden text-xs text-gray-400 sm:block">
                JCCF University of Offa Chapter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="relative rounded-xl border border-[#e8eee9] p-2.5 text-gray-500 hover:bg-gray-50"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e44732]" />
            </button>

            <div className="flex items-center gap-2 border-l border-[#edf0ed] pl-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf5ee] text-sm font-bold text-[#087443]">
                {initials || "A"}
              </div>

              <div className="hidden sm:block">
                <p className="max-w-[160px] truncate text-xs font-semibold">
                  {fullName}
                </p>
                <p className="text-[10px] text-gray-400">{role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="flex items-center gap-2 rounded-xl border border-[#e8eee9] p-2.5 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              <span className="hidden text-xs font-medium sm:inline">
                Sign out
              </span>
            </button>
          </div>
        </header>

        <main className="admin-workspace mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Image,
  Megaphone,
  Users,
  Clock3,
  Activity,
  Cake,
} from "lucide-react";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type DashboardData = {
  counts: {
    administrations: number;
    publishedProgrammes: number;
    publishedAnnouncements: number;
    mediaAssets: number;
    birthdayRecords: number;
    pendingMediaRequests: number;
  };
  currentAdministration: { name: string; startDate: string | null; endDate: string | null } | null;
  recentActivity: Array<{
    id: number;
    action: string;
    entityType: string;
    details: string | null;
    createdAt: string;
    actorName: string | null;
  }>;
};

type DashboardResponse = { success: boolean; data: DashboardData };

const quickActions = [
  { label: "New announcement", icon: Megaphone, href: "/admin/announcements" },
  { label: "Add programme", icon: CalendarDays, href: "/admin/programmes" },
  { label: "Add executive", icon: Users, href: "/admin/executives" },
  { label: "Upload media", icon: Image, href: "/admin/media" },
];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<DashboardResponse>("/dashboard", { token })
      .then((response) => setData(response.data))
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard."));
  }, [token]);

  const stats = [
    { label: "Published programmes", value: data?.counts.publishedProgrammes ?? "—", note: "Live records", icon: CalendarDays },
    { label: "Published announcements", value: data?.counts.publishedAnnouncements ?? "—", note: "Live records", icon: Megaphone },
    { label: "Media assets", value: data?.counts.mediaAssets ?? "—", note: "Uploaded files", icon: Image },
    { label: "Pending media requests", value: data?.counts.pendingMediaRequests ?? "—", note: "Needs review", icon: Users },
  ];

  return (
    <div className="space-y-8">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#063d29] via-[#075b35] to-[#087443] px-6 py-8 text-white shadow-xl shadow-[#063d29]/10 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full border border-white/10 bg-white/[0.04]" />
        <div aria-hidden="true" className="absolute -bottom-36 right-28 -z-10 h-72 w-72 rounded-full border border-[#f7d94a]/20" />
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f7d94a]">
            JCCF CONNECT / ADMINISTRATION
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Dashboard overview
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Manage your fellowship website and keep everything organised.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[#f7d94a] shadow-[0_0_0_4px_rgba(247,217,74,0.14)]" />
          {data?.currentAdministration?.name ?? "No current administration"}
        </span>
        </div>
      </section>

      <div className="rounded-2xl border border-[#e8eee9] bg-gradient-to-br from-white to-[#f7faf7] p-5 shadow-sm shadow-[#063d29]/[0.03] sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Current administration</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#063d29]">
              {data?.currentAdministration?.name ?? "Not set"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Update the current tenure's information, activities and records.
            </p>
          </div>
          <div className="rounded-xl bg-[#f2f7f3] p-4 sm:min-w-36">
            <p className="text-xs text-gray-500">Administration status</p>
              <p className="mt-1 font-semibold text-[#087443]">{data?.currentAdministration ? "Current" : "Not set"}</p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-[#17251d]">Website overview</h2>
          <span className="text-xs text-gray-400">Live database records</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-sm shadow-[#063d29]/[0.025] transition duration-200 hover:-translate-y-1 hover:border-[#c8ddcf] hover:shadow-lg hover:shadow-[#063d29]/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{stat.label}</span>
                  <span className="rounded-xl bg-[#edf6f0] p-2.5 text-[#087443] transition duration-200 group-hover:bg-[#087443] group-hover:text-white">
                    <Icon size={19} />
                  </span>
                </div>
                <p className="mt-5 text-3xl font-bold text-[#17251d]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-gray-400">{stat.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-[#e8eee9] bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#17251d]">Recent activity</h2>
              <p className="mt-1 text-xs text-gray-400">
                A quick look at recent website updates
              </p>
            </div>
            <Activity size={20} className="text-[#087443]" />
          </div>

          <div className="space-y-5">
            {data?.recentActivity.length ? data.recentActivity.map((activity) => {
              const Icon = activity.entityType.includes("announcement") ? Megaphone : activity.entityType.includes("programme") ? CalendarDays : Image;
              const title = `${activity.action.charAt(0).toUpperCase()}${activity.action.slice(1)} ${activity.entityType.replace(/s$/, "")}`;
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="h-fit rounded-xl bg-[#edf6f0] p-3 text-[#087443]">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#17251d]">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {activity.details ?? activity.actorName ?? "Administrative update"}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-gray-400">
                    {new Intl.DateTimeFormat("en", { dateStyle: "short", timeStyle: "short" }).format(new Date(activity.createdAt))}
                  </span>
                </div>
              );
            }) : <p className="py-4 text-sm text-gray-500">No recent administrative activity.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8eee9] bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-[#17251d]">Quick actions</h2>
          <p className="mt-1 text-xs text-gray-400">
            Common tasks you may want to perform
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-[#e8eee9] p-4 transition hover:border-[#087443] hover:bg-[#f7faf7]"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-[#26372c]">
                    <Icon size={18} className="text-[#087443]" />
                    {action.label}
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-gray-400 transition group-hover:text-[#087443]"
                  />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-[#e8eee9] bg-white p-5">
          <div className="rounded-xl bg-[#fff7e1] p-3 text-[#a87508]">
            <Cake size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#17251d]">Birthday reminders</p>
            <p className="mt-1 text-sm text-gray-500">
              {data?.counts.birthdayRecords ?? 0} member birthday records are available.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#e8eee9] bg-white p-5">
          <div className="rounded-xl bg-[#edf6f0] p-3 text-[#087443]">
            <Clock3 size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#17251d]">Keep your website updated</p>
            <p className="mt-1 text-sm text-gray-500">
              Review announcements, programmes and media regularly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

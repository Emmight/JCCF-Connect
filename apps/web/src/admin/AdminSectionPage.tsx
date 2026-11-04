
import { useMemo, useState } from "react";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const sectionCatalog: Record<
  string,
  {
    title: string;
    description: string;
    items: Array<{ name: string; status: string; owner: string; updated: string }>;
  }
> = {
  executives: {
    title: "Executive management",
    description: "Current leadership, office assignments, and approval status for each executive profile.",
    items: [
      { name: "President", status: "Active", owner: "Admin team", updated: "Today" },
      { name: "Vice President", status: "Pending review", owner: "Leadership", updated: "2 days ago" },
      { name: "PR & Media", status: "Active", owner: "Media desk", updated: "This week" },
    ],
  },
  administrations: {
    title: "Administration management",
    description: "Track active, incoming and historical administrations without promoting records prematurely.",
    items: [
      { name: "Supernatural Speed", status: "Current", owner: "Fellowship admin", updated: "Today" },
      { name: "Incoming administration", status: "Upcoming", owner: "Executive board", updated: "Awaiting approval" },
      { name: "Archive review", status: "Historical", owner: "Records office", updated: "This month" },
    ],
  },
  programmes: {
    title: "Programme management",
    description: "Upcoming events, programme visibility, and status updates for the fellowship calendar.",
    items: [
      { name: "Bible Study Friday", status: "Published", owner: "Programmes desk", updated: "Today" },
      { name: "Campus Revival Night", status: "Draft", owner: "Media team", updated: "2 days ago" },
      { name: "Prayer Breakfast", status: "Scheduled", owner: "Admin team", updated: "This week" },
    ],
  },
  announcements: {
    title: "Announcements",
    description: "Publication states, pinned updates, and administrative coordination for fellowship communication.",
    items: [
      { name: "Week of prayer", status: "Published", owner: "Chaplaincy", updated: "Today" },
      { name: "Member update", status: "Draft", owner: "Admin team", updated: "1 day ago" },
      { name: "Semester reminder", status: "Archived", owner: "Communications", updated: "Last week" },
    ],
  },
  media: {
    title: "Media vault",
    description: "Review uploads, visibility, category labels and approval status for fellowship media assets.",
    items: [
      { name: "Campus worship banner", status: "Approved", owner: "Media desk", updated: "Today" },
      { name: "Leadership photo pack", status: "Pending review", owner: "Executive support", updated: "2 days ago" },
      { name: "Flyer archive", status: "Archived", owner: "Design team", updated: "This month" },
    ],
  },
  birthdays: {
    title: "Birthday management",
    description: "Track public visibility, privacy preferences and upcoming member celebrations.",
    items: [
      { name: "This month birthdays", status: "Published", owner: "Admin team", updated: "Today" },
      { name: "Member privacy review", status: "Review", owner: "Records office", updated: "3 days ago" },
      { name: "Executive celebration list", status: "Approved", owner: "Leadership", updated: "This week" },
    ],
  },
  "media-requests": {
    title: "Media requests",
    description: "Manage incoming requests, task assignments, deadlines and final design approvals.",
    items: [
      { name: "Prayer walk flyer", status: "In progress", owner: "Media coordinator", updated: "Today" },
      { name: "Event photography", status: "Awaiting revision", owner: "Media worker", updated: "1 day ago" },
      { name: "Poster design", status: "Approved", owner: "Design team", updated: "This week" },
    ],
  },
  activity: {
    title: "Activity log",
    description: "Monitor administrative actions and maintain a reliable record of recent updates and decisions.",
    items: [
      { name: "Programme published", status: "Logged", owner: "System", updated: "Today" },
      { name: "Announcement edited", status: "Logged", owner: "Admin", updated: "Yesterday" },
      { name: "Media asset archived", status: "Logged", owner: "Media team", updated: "Last week" },
    ],
  },
  settings: {
    title: "Website settings",
    description: "General fellowship information, public contact details and platform configuration.",
    items: [
      { name: "Public profile", status: "Configured", owner: "Admin team", updated: "Today" },
      { name: "Contact information", status: "Needs review", owner: "Office desk", updated: "2 days ago" },
      { name: "Security settings", status: "Active", owner: "System", updated: "This week" },
    ],
  },
};

export default function AdminSectionPage() {
  const location = useLocation();
  const section = location.pathname.split("/").filter(Boolean).pop() ?? "";
  const details = sectionCatalog[section] ?? {
    title: "Section overview",
    description: "This admin section is ready for future record management modules and API-backed workflows.",
    items: [],
  };

  const [query, setQuery] = useState("");
  const filteredItems = useMemo(() => {
    if (!query.trim()) return details.items;
    return details.items.filter((item) =>
      `${item.name} ${item.status} ${item.owner}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [details.items, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-[#e8eee9] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#087443]">
              <ShieldCheck size={26} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#087443]">JCCF CONNECT ADMIN</p>
              <h1 className="mt-2 text-2xl font-bold text-[#063d29] sm:text-3xl">{details.title}</h1>
            </div>
          </div>

          <Link
            to="/admin"
            className="inline-flex rounded-xl bg-[#087443] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#063d29]"
          >
            Back to dashboard
          </Link>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-600">{details.description}</p>
      </div>

      <div className="rounded-2xl border border-[#e8eee9] bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[#17251d]">Current records</h2>
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search records..."
              className="w-full rounded-xl border border-[#e8eee9] bg-[#f8faf8] py-2.5 pl-9 pr-3 text-sm text-[#17251d] outline-none transition focus:border-[#087443]"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#eef0ee]">
          <table className="min-w-full divide-y divide-[#edf0ee] text-left text-sm">
            <thead className="bg-[#f7faf7] text-[#4a5d52]">
              <tr>
                <th className="px-4 py-3 font-semibold">Record</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ee] bg-white">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={`${item.name}-${item.owner}`} className="hover:bg-[#f9fbf9]">
                    <td className="px-4 py-3 font-medium text-[#17251d]">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#edf6f0] px-2.5 py-1 text-xs font-semibold text-[#087443]">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.owner}</td>
                    <td className="px-4 py-3 text-gray-500">{item.updated}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#087443]">
          <span>Ready for API-backed implementation</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}

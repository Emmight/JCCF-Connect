import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type Activity = {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string | null;
  createdAt: string;
  actorName: string | null;
};

export default function AdminActivityPage() {
  const { token } = useAuth();
  const [activity, setActivity] = useState<Activity[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ success: boolean; data: { recentActivity: Activity[] } }>("/dashboard", { token })
      .then((response) => setActivity(response.data.recentActivity))
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load activity."));
  }, [token]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? activity.filter((item) => `${item.action} ${item.entityType} ${item.details ?? ""} ${item.actorName ?? ""}`.toLowerCase().includes(term)) : activity;
  }, [activity, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header><p className="mb-2 text-xs font-bold tracking-widest text-[#087443]">COMMUNICATION</p><h1 className="text-2xl font-bold text-[#17251d] sm:text-3xl">Activity log</h1><p className="mt-2 text-sm text-gray-500">Recent successful administrative changes and sign-ins.</p></header>
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <section className="overflow-hidden rounded-lg border border-[#e8eee9] bg-white">
        <div className="border-b border-[#edf0ed] p-5"><label className="relative block w-full sm:max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity" className="w-full rounded-md border border-[#dfe8e1] py-2.5 pl-9 pr-3 text-sm" /></label></div>
        <div className="divide-y divide-[#edf0ed]">
          {filtered.length ? filtered.map((item) => <article key={item.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-semibold capitalize text-[#17251d]">{item.action} {item.entityType}{item.entityId ? ` #${item.entityId}` : ""}</p><p className="mt-1 break-all text-xs text-gray-500">{item.actorName ?? "Unknown admin"} · {item.details}</p></div>
            <time className="shrink-0 text-xs text-gray-500">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time>
          </article>) : <p className="px-5 py-12 text-center text-sm text-gray-500">No matching activity records.</p>}
        </div>
      </section>
    </div>
  );
}
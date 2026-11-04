import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type Administration = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "upcoming" | "current" | "past";
  isFeatured: boolean;
};

type Programme = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  imageUrl: string | null;
  registrationUrl: string | null;
  status: "draft" | "published" | "cancelled" | "completed";
  isFeatured: boolean;
};

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export default function AdminCatalogPage() {
  const { token, user } = useAuth();
  const location = useLocation();
  const isProgrammes = location.pathname.endsWith("/programmes");
  const endpoint = isProgrammes ? "/programmes" : "/administrations";
  const [administrations, setAdministrations] = useState<Administration[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Administration | Programme | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadRecords() {
    setError("");
    try {
      const path = `${endpoint}/admin/all`;
      const response = await apiRequest<ApiEnvelope<Administration[] | Programme[]>>(path, { token });
      if (isProgrammes) setProgrammes(response.data as Programme[]);
      else setAdministrations(response.data as Administration[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void loadRecords();
  }, [token, endpoint]);

  const rows = useMemo(() => {
    const records = isProgrammes
      ? programmes.map((record) => ({ id: record.id, name: record.title, detail: record.startDate, status: record.status, search: `${record.title} ${record.category} ${record.status}` }))
      : administrations.map((record) => ({ id: record.id, name: record.name, detail: record.startDate ? `${record.startDate}${record.endDate ? ` to ${record.endDate}` : ""}` : "Dates not set", status: record.status, search: `${record.name} ${record.status}` }));
    const term = query.trim().toLowerCase();
    return term ? records.filter((row) => row.search.toLowerCase().includes(term)) : records;
  }, [administrations, programmes, isProgrammes, query]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(id: number) {
    setEditing(isProgrammes ? programmes.find((record) => record.id === id) ?? null : administrations.find((record) => record.id === id) ?? null);
    setModalOpen(true);
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = isProgrammes
      ? {
          title: String(data.get("title") ?? "").trim(),
          description: String(data.get("description") ?? "").trim() || null,
          category: String(data.get("category")),
          startDate: String(data.get("startDate")),
          endDate: String(data.get("endDate") ?? "") || null,
          startTime: String(data.get("startTime") ?? "") || null,
          endTime: String(data.get("endTime") ?? "") || null,
          venue: String(data.get("venue") ?? "").trim() || null,
          imageUrl: String(data.get("imageUrl") ?? "").trim() || null,
          registrationUrl: String(data.get("registrationUrl") ?? "").trim() || null,
          status: String(data.get("status")),
          isFeatured: data.get("isFeatured") === "on",
        }
      : {
          name: String(data.get("name") ?? "").trim(),
          description: String(data.get("description") ?? "").trim() || null,
          startDate: String(data.get("startDate") ?? "") || null,
          endDate: String(data.get("endDate") ?? "") || null,
          status: String(data.get("status")),
          isFeatured: data.get("isFeatured") === "on",
        };

    setSaving(true);
    setError("");
    try {
      await apiRequest(editing ? `${endpoint}/${editing.id}` : endpoint, {
        method: editing ? "PATCH" : "POST",
        token,
        body: JSON.stringify(payload),
      });
      setModalOpen(false);
      setEditing(null);
      await loadRecords();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save record.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveRecord(id: number) {
    if (!window.confirm("Archive this record?")) return;
    setError("");
    try {
      await apiRequest(`${endpoint}/${id}`, { method: "DELETE", token });
      await loadRecords();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Unable to archive record.");
    }
  }

  const title = isProgrammes ? "Programme management" : "Administration management";
  const adminOnly = user?.role === "super_admin";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-[#087443]">CONTENT MANAGEMENT</p>
          <h1 className="text-2xl font-bold text-[#17251d] sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">{isProgrammes ? "Create and publish fellowship events." : "Manage current, upcoming, and archived leadership terms."}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#087443] px-4 py-3 text-sm font-semibold text-white"><Plus size={17} /> Add {isProgrammes ? "programme" : "administration"}</button>
      </header>
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <section className="overflow-hidden rounded-lg border border-[#e8eee9] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#edf0ed] p-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-[#17251d]">{rows.length} records</span>
          <label className="relative w-full sm:max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="w-full rounded-md border border-[#dfe8e1] py-2.5 pl-9 pr-3 text-sm" /></label>
        </div>
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
          <thead className="bg-[#f7faf7] text-xs uppercase text-[#65756b]"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">{isProgrammes ? "Start date" : "Tenure"}</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#edf0ed]">
            {loading ? <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">Loading records…</td></tr> : rows.length ? rows.map((row) => <tr key={row.id}>
              <td className="px-5 py-4 font-medium text-[#17251d]">{row.name}</td><td className="px-5 py-4 text-gray-600">{row.detail}</td><td className="px-5 py-4"><span className="rounded-full bg-[#edf6f0] px-2.5 py-1 text-xs font-semibold capitalize text-[#087443]">{row.status}</span></td>
              <td className="px-5 py-3"><div className="flex justify-end gap-2"><button onClick={() => openEdit(row.id)} className="rounded-md border border-[#dfe8e1] px-3 py-2 text-xs font-semibold">Edit</button>{adminOnly && <button onClick={() => void archiveRecord(row.id)} aria-label={`Archive ${row.name}`} className="rounded-md border border-[#dfe8e1] px-2.5 text-gray-500 hover:text-red-600"><Trash2 size={15} /></button>}</div></td>
            </tr>) : <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">No records found.</td></tr>}
          </tbody>
        </table></div>
      </section>

      {modalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
        <section className="my-auto w-full max-w-2xl rounded-lg bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4"><h2 className="font-semibold text-[#17251d]">{editing ? "Edit" : "Add"} {isProgrammes ? "programme" : "administration"}</h2><button onClick={() => setModalOpen(false)} aria-label="Close" className="rounded-md p-2 text-gray-500"><X size={18} /></button></header>
          <form key={`${isProgrammes ? "programme" : "administration"}-${editing?.id ?? "new"}`} onSubmit={(event) => void saveRecord(event)} className="grid gap-4 p-5 sm:grid-cols-2">
            {isProgrammes ? <>
              <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Title<input name="title" required minLength={3} maxLength={200} defaultValue={(editing as Programme | null)?.title ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600">Category<select name="category" defaultValue={(editing as Programme | null)?.category ?? "other"} className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm font-normal">{["worship", "prayer", "bible_study", "conference", "seminar", "outreach", "fellowship", "other"].map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}</select></label>
              <label className="text-xs font-semibold text-gray-600">Status<select name="status" defaultValue={(editing as Programme | null)?.status ?? "draft"} className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm font-normal">{["draft", "published", "cancelled", "completed"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="text-xs font-semibold text-gray-600">Start date<input name="startDate" type="date" required defaultValue={(editing as Programme | null)?.startDate ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600">End date<input name="endDate" type="date" defaultValue={(editing as Programme | null)?.endDate ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600">Start time<input name="startTime" type="time" defaultValue={(editing as Programme | null)?.startTime ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600">End time<input name="endTime" type="time" defaultValue={(editing as Programme | null)?.endTime ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600">Venue<input name="venue" maxLength={255} defaultValue={(editing as Programme | null)?.venue ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600">Image URL<input name="imageUrl" type="url" defaultValue={(editing as Programme | null)?.imageUrl ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Description<textarea name="description" maxLength={10000} defaultValue={(editing as Programme | null)?.description ?? ""} rows={4} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2"><input type="checkbox" name="isFeatured" defaultChecked={(editing as Programme | null)?.isFeatured ?? false} /> Feature programme</label>
            </> : <>
              <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Administration name<input name="name" required minLength={2} maxLength={150} defaultValue={(editing as Administration | null)?.name ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600">Status<select name="status" defaultValue={(editing as Administration | null)?.status ?? "upcoming"} className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm font-normal">{["upcoming", "current", "past"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="text-xs font-semibold text-gray-600">Start date<input name="startDate" type="date" defaultValue={(editing as Administration | null)?.startDate ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600">End date<input name="endDate" type="date" defaultValue={(editing as Administration | null)?.endDate ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Description<textarea name="description" maxLength={5000} defaultValue={(editing as Administration | null)?.description ?? ""} rows={4} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
              <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2"><input type="checkbox" name="isFeatured" defaultChecked={(editing as Administration | null)?.isFeatured ?? false} /> Feature administration</label>
            </>}
            <div className="flex justify-end gap-3 border-t border-[#edf0ed] pt-4 sm:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-[#dfe8e1] px-4 py-2.5 text-sm">Cancel</button><button disabled={saving} className="rounded-md bg-[#087443] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save record"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}
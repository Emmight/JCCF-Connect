import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type Announcement = {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  category: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  publishedAt: string | null;
};

type Birthday = {
  id: number;
  fullName: string;
  month: number;
  day: number;
  visibility: "public" | "executive" | "private";
  isOptedOut: boolean;
  notes: string | null;
};

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };
type EditableRecord = Announcement | Birthday;

function monthName(month: number) {
  return new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2024, month - 1, 1));
}

export default function AdminContentPage() {
  const { token } = useAuth();
  const location = useLocation();
  const isBirthday = location.pathname.endsWith("/birthdays");
  const endpoint = isBirthday ? "/birthdays" : "/announcements";
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditableRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadRecords() {
    setError("");
    try {
      const path = isBirthday ? "/birthdays/admin/all" : "/announcements/admin/all";
      const response = await apiRequest<ApiEnvelope<Announcement[] | Birthday[]>>(path, { token });
      if (isBirthday) setBirthdays(response.data as Birthday[]);
      else setAnnouncements(response.data as Announcement[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void loadRecords();
  }, [token, isBirthday]);

  const rows = useMemo(() => {
    const records = isBirthday
      ? birthdays.map((record) => ({
          id: record.id,
          title: record.fullName,
          detail: `${monthName(record.month)} ${record.day}`,
          status: record.isOptedOut ? "Opted out" : record.visibility,
          searchText: `${record.fullName} ${record.visibility} ${record.month} ${record.day}`,
        }))
      : announcements.map((record) => ({
          id: record.id,
          title: record.title,
          detail: record.category,
          status: record.status,
          searchText: `${record.title} ${record.category} ${record.summary ?? ""}`,
        }));
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? records.filter((record) => record.searchText.toLowerCase().includes(normalizedQuery))
      : records;
  }, [announcements, birthdays, isBirthday, query]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(id: number) {
    setEditing(isBirthday ? birthdays.find((record) => record.id === id) ?? null : announcements.find((record) => record.id === id) ?? null);
    setModalOpen(true);
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = isBirthday
      ? {
          fullName: String(data.get("fullName") ?? "").trim(),
          month: Number(data.get("month")),
          day: Number(data.get("day")),
          visibility: String(data.get("visibility")),
          isOptedOut: data.get("isOptedOut") === "on",
          notes: String(data.get("notes") ?? "").trim() || null,
        }
      : {
          title: String(data.get("title") ?? "").trim(),
          summary: String(data.get("summary") ?? "").trim() || null,
          content: String(data.get("content") ?? "").trim(),
          category: String(data.get("category") ?? "announcement").trim(),
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

  async function removeRecord(id: number) {
    const action = isBirthday ? "permanently delete this birthday record" : "archive this announcement";
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    setError("");
    try {
      await apiRequest(`${endpoint}/${id}`, { method: "DELETE", token });
      await loadRecords();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to update record.");
    }
  }

  const title = isBirthday ? "Birthday management" : "Announcements";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-[#087443]">CONTENT MANAGEMENT</p>
          <h1 className="text-2xl font-bold text-[#17251d] sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {isBirthday ? "Manage member celebrations and privacy preferences." : "Draft, publish, and archive fellowship updates."}
          </p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#087443] px-4 py-3 text-sm font-semibold text-white hover:bg-[#063d29]">
          <Plus size={17} /> Add {isBirthday ? "birthday" : "announcement"}
        </button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="overflow-hidden rounded-lg border border-[#e8eee9] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#edf0ed] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#17251d]">{rows.length} records</p>
          <label className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="w-full rounded-md border border-[#dfe8e1] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#087443]" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f7faf7] text-xs uppercase text-[#65756b]"><tr><th className="px-5 py-3">Record</th><th className="px-5 py-3">{isBirthday ? "Birthday" : "Category"}</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-[#edf0ed]">
              {loading ? <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">Loading records…</td></tr> : rows.length ? rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#f9fbf9]">
                  <td className="max-w-[22rem] truncate px-5 py-4 font-medium text-[#17251d]">{row.title}</td>
                  <td className="px-5 py-4 text-gray-600">{row.detail}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-[#edf6f0] px-2.5 py-1 text-xs font-semibold capitalize text-[#087443]">{row.status}</span></td>
                  <td className="px-5 py-3"><div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(row.id)} className="rounded-md border border-[#dfe8e1] px-3 py-2 text-xs font-semibold text-[#345143] hover:border-[#087443]">Edit</button>
                    <button onClick={() => void removeRecord(row.id)} aria-label={`${isBirthday ? "Delete" : "Archive"} ${row.title}`} className="rounded-md border border-[#dfe8e1] px-2.5 text-gray-500 hover:border-red-200 hover:text-red-600"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">No matching records.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="my-auto w-full max-w-2xl rounded-lg bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4">
              <h2 className="font-semibold text-[#17251d]">{editing ? "Edit" : "Add"} {isBirthday ? "birthday record" : "announcement"}</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Close" className="rounded-md p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </header>
            <form key={`${isBirthday ? "birthday" : "announcement"}-${editing?.id ?? "new"}`} onSubmit={(event) => void saveRecord(event)} className="grid gap-4 p-5 sm:grid-cols-2">
              {isBirthday ? (
                <>
                  <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Full name<input name="fullName" required minLength={2} maxLength={150} defaultValue={(editing as Birthday | null)?.fullName ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-semibold text-gray-600">Month<select name="month" required defaultValue={(editing as Birthday | null)?.month ?? 1} className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm font-normal">{Array.from({ length: 12 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{monthName(month)}</option>)}</select></label>
                  <label className="text-xs font-semibold text-gray-600">Day<input name="day" type="number" required min={1} max={31} defaultValue={(editing as Birthday | null)?.day ?? 1} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-semibold text-gray-600">Visibility<select name="visibility" defaultValue={(editing as Birthday | null)?.visibility ?? "public"} className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm font-normal"><option value="public">Public</option><option value="executive">Executive</option><option value="private">Private</option></select></label>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-600"><input type="checkbox" name="isOptedOut" defaultChecked={(editing as Birthday | null)?.isOptedOut ?? false} /> Opted out of public greetings</label>
                  <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Notes<textarea name="notes" maxLength={500} defaultValue={(editing as Birthday | null)?.notes ?? ""} rows={3} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
                </>
              ) : (
                <>
                  <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Title<input name="title" required minLength={3} maxLength={200} defaultValue={(editing as Announcement | null)?.title ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-semibold text-gray-600">Category<input name="category" required minLength={2} maxLength={80} defaultValue={(editing as Announcement | null)?.category ?? "announcement"} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-semibold text-gray-600">Status<select name="status" defaultValue={(editing as Announcement | null)?.status ?? "draft"} className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm font-normal"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
                  <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Summary<input name="summary" maxLength={1000} defaultValue={(editing as Announcement | null)?.summary ?? ""} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Content<textarea name="content" required minLength={10} maxLength={20000} defaultValue={(editing as Announcement | null)?.content ?? ""} rows={6} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2"><input type="checkbox" name="isFeatured" defaultChecked={(editing as Announcement | null)?.isFeatured ?? false} /> Feature this announcement</label>
                </>
              )}
              <div className="flex justify-end gap-3 border-t border-[#edf0ed] pt-4 sm:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-[#dfe8e1] px-4 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
                <button disabled={saving} className="rounded-md bg-[#087443] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save record"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
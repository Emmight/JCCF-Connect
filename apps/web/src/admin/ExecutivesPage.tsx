
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  UserRound,
  Crown,
} from "lucide-react";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type Executive = {
  id: number;
  administrationId: number;
  name: string;
  position: string;
  administration: string;
  status: "Current" | "Former";
  photo: string;
  email: string;
};

type Administration = { id: number; name: string };
type ExecutiveRecord = {
  id: number;
  administrationId: number;
  fullName: string;
  position: string;
  email: string | null;
  photoUrl: string | null;
  status: "active" | "inactive";
  administrationName: string;
};
type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

const positions = [
  "President",
  "Vice President",
  "General Secretary",
  "Assistant General Secretary",
  "Financial Secretary",
  "Treasurer",
  "Public Relations Officer",
  "Welfare Secretary",
  "Prayer Secretary",
  "Choir Coordinator",
  "Media Coordinator",
  "Evangelism Coordinator",
  "Other",
];

const emptyForm = {
  name: "",
  position: "President",
  administrationId: 0,
  status: "Current" as Executive["status"],
  email: "",
  photo: "",
};

export default function ExecutivesPage() {
  const { token, user } = useAuth();
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [administrationRecords, setAdministrationRecords] = useState<Administration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadExecutives() {
    setError("");
    try {
      const [executiveResponse, administrationResponse] = await Promise.all([
        apiRequest<ApiEnvelope<ExecutiveRecord[]>>("/executives/admin/all", { token }),
        apiRequest<ApiEnvelope<Administration[]>>("/administrations", { token }),
      ]);
      setExecutives(executiveResponse.data.map((record) => ({
        id: record.id,
        administrationId: record.administrationId,
        name: record.fullName,
        position: record.position,
        administration: record.administrationName,
        status: record.status === "active" ? "Current" : "Former",
        photo: record.photoUrl ?? "",
        email: record.email ?? "",
      })));
      setAdministrationRecords(administrationResponse.data.map(({ id, name }) => ({ id, name })));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load executives.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadExecutives();
  }, [token]);

  const filteredExecutives = useMemo(() => {
    return executives.filter((executive) => {
      const matchesSearch =
        executive.name.toLowerCase().includes(search.toLowerCase()) ||
        executive.position.toLowerCase().includes(search.toLowerCase()) ||
        executive.administration.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        (filter === "Current" && executive.status === "Current") ||
        (filter === "Former" && executive.status === "Former") ||
        executive.administration === filter;

      return matchesSearch && matchesFilter;
    });
  }, [executives, search, filter]);

  const currentCount = executives.filter(
    (executive) => executive.status === "Current"
  ).length;

  const formerCount = executives.filter(
    (executive) => executive.status === "Former"
  ).length;

  function openAddModal() {
    setEditingId(null);
    setForm({ ...emptyForm, administrationId: administrationRecords[0]?.id ?? 0 });
    setModalOpen(true);
  }

  function openEditModal(executive: Executive) {
    setEditingId(executive.id);
    setForm({
      name: executive.name === "Name to be added" ? "" : executive.name,
      position: executive.position,
      administrationId: executive.administrationId,
      status: executive.status,
      email: executive.email,
      photo: executive.photo,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter the executive's name.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        administrationId: form.administrationId,
        fullName: form.name.trim(),
        position: form.position,
        email: form.email.trim() || null,
        photoUrl: form.photo.trim() || null,
        status: form.status === "Current" ? "active" : "inactive",
      };
      await apiRequest(editingId !== null ? `/executives/${editingId}` : "/executives", {
        method: editingId !== null ? "PATCH" : "POST",
        token,
        body: JSON.stringify(payload),
      });
      await loadExecutives();
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save executive.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteExecutive(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this executive?"
    );

    if (!confirmed) return;

    setError("");
    try {
      await apiRequest(`/executives/${id}`, { method: "DELETE", token });
      await loadExecutives();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to deactivate executive.");
    }
  }

  return (
    <div className="space-y-7">
      {/* Heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-[#087443]">
            CONTENT MANAGEMENT
          </p>
          <h1 className="text-2xl font-bold text-[#17251d] sm:text-3xl">
            Executive management
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage fellowship leaders, their positions and administration records.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087443] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#063d29]"
        >
          <Plus size={18} />
          Add executive
        </button>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total executives",
            value: executives.length,
            icon: Users,
          },
          {
            label: "Current executives",
            value: currentCount,
            icon: Crown,
          },
          {
            label: "Former executives",
            value: formerCount,
            icon: UserRound,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e8eee9] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{item.label}</p>
                <span className="rounded-xl bg-[#edf6f0] p-2.5 text-[#087443]">
                  <Icon size={19} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[#17251d]">
                {item.value}
              </p>
            </div>
          );
        })}
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {/* Directory */}
      <section className="overflow-hidden rounded-2xl border border-[#e8eee9] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#edf0ed] p-5 sm:p-6">
          <div>
            <h2 className="font-semibold text-[#17251d]">
              Executive directory
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              View and manage all executive profiles.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, position or administration..."
                className="w-full rounded-xl border border-[#e5eae6] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#087443]"
              />
            </div>

            <div className="relative sm:w-52">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-[#e5eae6] bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#087443]"
              >
                <option value="All">All executives</option>
                <option value="Current">Current executives</option>
                <option value="Former">Former executives</option>
                {administrationRecords.map((administration) => (
                  <option key={administration.id} value={administration.name}>
                    {administration.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-gray-500">Loading executive records…</div>
        ) : filteredExecutives.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Users size={35} className="mx-auto text-gray-300" />
            <h3 className="mt-4 font-semibold text-[#17251d]">
              No executives found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another search or add a new executive.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {filteredExecutives.map((executive) => (
              <article
                key={executive.id}
                className="group rounded-2xl border border-[#e8eee9] p-4 transition hover:border-[#b8d6c2] hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {executive.photo ? (
                      <img
                        src={executive.photo}
                        alt={executive.name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#087443]">
                        <UserRound size={25} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#17251d]">
                        {executive.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#087443]">
                        {executive.position}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      executive.status === "Current"
                        ? "bg-[#eaf5ee] text-[#087443]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {executive.status}
                  </span>
                </div>

                <div className="mt-5 border-t border-[#edf0ed] pt-4">
                  <p className="text-[11px] text-gray-400">Administration</p>
                  <p className="mt-1 text-xs font-medium text-gray-600">
                    {executive.administration}
                  </p>

                  {executive.email && (
                    <p className="mt-2 truncate text-xs text-gray-400">
                      {executive.email}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEditModal(executive)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5eae6] py-2.5 text-xs font-semibold text-gray-600 transition hover:border-[#087443] hover:text-[#087443]"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  {user?.role === "super_admin" && (
                    <button
                      onClick={() => void deleteExecutive(executive.id)}
                      aria-label={`Deactivate ${executive.name}`}
                      title="Deactivate executive"
                      className="rounded-lg border border-[#e5eae6] px-3 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="border-t border-[#edf0ed] px-5 py-4 text-xs text-gray-400">
          Showing {filteredExecutives.length} of {executives.length} executives
        </div>
      </section>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-5 sm:px-7">
              <div>
                <h2 className="font-semibold text-[#17251d]">
                  {editingId ? "Edit executive" : "Add new executive"}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Enter the executive's information below.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Profile photo URL</label>
                <input
                  type="url"
                  value={form.photo}
                  onChange={(event) => setForm({ ...form, photo: event.target.value })}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-[#e5eae6] px-4 py-3 text-sm outline-none focus:border-[#087443]"
                />
              </div>

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-[#e5eae6] px-4 py-3 text-sm outline-none focus:border-[#087443]"
                />
              </div>

              {/* Position */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Executive position *
                </label>
                <select
                  value={form.position}
                  onChange={(event) =>
                    setForm({ ...form, position: event.target.value })
                  }
                  className="w-full rounded-xl border border-[#e5eae6] bg-white px-4 py-3 text-sm outline-none focus:border-[#087443]"
                >
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Administration */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Administration *
                </label>
                <select
                  required
                  value={form.administrationId}
                  onChange={(event) =>
                    setForm({ ...form, administrationId: Number(event.target.value) })
                  }
                  className="w-full rounded-xl border border-[#e5eae6] bg-white px-4 py-3 text-sm outline-none focus:border-[#087443]"
                >
                  <option value={0} disabled>Select an administration</option>
                  {administrationRecords.map((administration) => (
                    <option key={administration.id} value={administration.id}>
                      {administration.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-[#e5eae6] px-4 py-3 text-sm outline-none focus:border-[#087443]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Executive status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as Executive["status"],
                    })
                  }
                  className="w-full rounded-xl border border-[#e5eae6] bg-white px-4 py-3 text-sm outline-none focus:border-[#087443]"
                >
                  <option value="Current">Current executive</option>
                  <option value="Former">Former executive</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#edf0ed] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#e5eae6] px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || administrationRecords.length === 0}
                  className="rounded-xl bg-[#087443] px-6 py-3 text-sm font-semibold text-white hover:bg-[#063d29] disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add executive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

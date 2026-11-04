import { useEffect, useState, type FormEvent } from "react";
import { ClipboardList, LoaderCircle, RefreshCw, Send } from "lucide-react";

import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type MediaTask = {
  id: number;
  title: string;
  assigneeName: string | null;
  deadline: string | null;
  status: string;
};

type MediaRequest = {
  id: number;
  requesterName: string;
  requesterEmail: string | null;
  requestType: string;
  programmeName: string | null;
  description: string;
  deadline: string | null;
  status: string;
  createdAt: string;
  tasks: MediaTask[];
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

const requestStatuses = [
  "pending",
  "in_review",
  "assigned",
  "approved",
  "rejected",
  "completed",
];

const taskStatuses = ["pending", "in_progress", "submitted", "approved", "rejected", "archived"];

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default function AdminMediaRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  async function loadRequests() {
    setError("");
    try {
      const response = await apiRequest<ApiResponse<MediaRequest[]>>("/media-requests/admin/all", { token });
      setRequests(response.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load media requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, [token]);

  async function updateRequestStatus(requestId: number, status: string) {
    setBusyKey(`request-${requestId}`);
    setError("");
    try {
      await apiRequest(`/media-requests/${requestId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      await loadRequests();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update request.");
    } finally {
      setBusyKey("");
    }
  }

  async function assignTask(event: FormEvent<HTMLFormElement>, requestId: number) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      assigneeName: String(formData.get("assigneeName") ?? "").trim() || null,
      deadline: String(formData.get("deadline") ?? "") || null,
    };

    setBusyKey(`task-${requestId}`);
    setError("");
    try {
      await apiRequest(`/media-requests/${requestId}/tasks`, {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
      form.reset();
      await loadRequests();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Unable to assign task.");
    } finally {
      setBusyKey("");
    }
  }

  async function updateTaskStatus(taskId: number, status: string) {
    setBusyKey(`task-status-${taskId}`);
    setError("");
    try {
      await apiRequest(`/media-requests/tasks/${taskId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      await loadRequests();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update task.");
    } finally {
      setBusyKey("");
    }
  }

  const openCount = requests.filter((request) => !["completed", "rejected"].includes(request.status)).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-[#087443]">COMMUNICATION</p>
          <h1 className="text-2xl font-bold text-[#17251d] sm:text-3xl">Media requests</h1>
          <p className="mt-2 text-sm text-gray-500">Review incoming requests, set a status, and assign production tasks.</p>
        </div>
        <button
          type="button"
          onClick={() => { setLoading(true); void loadRequests(); }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#dfe8e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#345143] hover:bg-[#f5f8f5]"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[#e8eee9] bg-white p-5">
          <p className="text-sm text-gray-500">All requests</p>
          <p className="mt-3 text-3xl font-bold text-[#17251d]">{requests.length}</p>
        </div>
        <div className="rounded-lg border border-[#e8eee9] bg-white p-5">
          <p className="text-sm text-gray-500">Open requests</p>
          <p className="mt-3 text-3xl font-bold text-[#087443]">{openCount}</p>
        </div>
      </section>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500">
          <LoaderCircle size={18} className="animate-spin" /> Loading requests
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d8e1d9] bg-white px-6 py-16 text-center">
          <ClipboardList size={30} className="mx-auto text-[#8fa196]" />
          <h2 className="mt-4 font-semibold text-[#17251d]">No media requests yet</h2>
          <p className="mt-2 text-sm text-gray-500">New submissions will appear here for review and assignment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="rounded-lg border border-[#e8eee9] bg-white p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#087443]">{label(request.requestType)}</span>
                    <span className="text-xs text-gray-400">#{request.id}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-[#17251d]">{request.programmeName || request.requestType}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">{request.description}</p>
                  <p className="mt-4 text-xs text-gray-500">
                    {request.requesterName}{request.requesterEmail ? ` · ${request.requesterEmail}` : ""}
                    {` · Submitted ${formatDate(request.createdAt)}`}
                    {` · Deadline ${formatDate(request.deadline)}`}
                  </p>
                </div>
                <label className="w-full text-xs font-semibold text-gray-500 lg:w-48">
                  Request status
                  <select
                    value={request.status}
                    disabled={busyKey === `request-${request.id}`}
                    onChange={(event) => void updateRequestStatus(request.id, event.target.value)}
                    className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm text-[#17251d] outline-none focus:border-[#087443]"
                  >
                    {requestStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
                  </select>
                </label>
              </div>

              {request.tasks.length > 0 && (
                <div className="mt-5 border-t border-[#edf0ed] pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-[#17251d]">Assigned tasks</h3>
                  <div className="space-y-2">
                    {request.tasks.map((task) => (
                      <div key={task.id} className="flex flex-col justify-between gap-3 rounded-md bg-[#f7faf7] px-3 py-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-sm font-medium text-[#17251d]">{task.title}</p>
                          <p className="mt-1 text-xs text-gray-500">{task.assigneeName || "Unassigned"} · Due {formatDate(task.deadline)}</p>
                        </div>
                        <select
                          value={task.status}
                          disabled={busyKey === `task-status-${task.id}`}
                          onChange={(event) => void updateTaskStatus(task.id, event.target.value)}
                          aria-label={`Status for ${task.title}`}
                          className="rounded-md border border-[#dfe8e1] bg-white px-3 py-2 text-xs font-medium text-[#345143]"
                        >
                          {taskStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={(event) => void assignTask(event, request.id)} className="mt-5 grid gap-3 border-t border-[#edf0ed] pt-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_auto] lg:items-end">
                <label className="text-xs font-semibold text-gray-500">
                  Task
                  <input name="title" required minLength={3} maxLength={200} placeholder="e.g. Design event flyer" className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                  Assign to
                  <input name="assigneeName" maxLength={150} placeholder="Team member name" className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                  Due date
                  <input name="deadline" type="date" className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" />
                </label>
                <button disabled={busyKey === `task-${request.id}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#087443] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#063d29] disabled:opacity-60">
                  {busyKey === `task-${request.id}` ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={15} />}
                  Assign
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Upload } from "lucide-react";

import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type MediaAsset = {
  id: number;
  title: string;
  category: string;
  status: "draft" | "approved" | "archived";
  visibility: "private" | "pending" | "published" | "archived";
  fileUrl: string;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
};

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminMediaPage() {
  const { token, user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canPublish = user?.role !== "media_team";

  async function loadAssets() {
    setError("");
    try {
      const response = await apiRequest<ApiEnvelope<MediaAsset[]>>("/media/admin/all", { token });
      setAssets(response.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load media assets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, [token]);

  async function uploadAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setUploading(true);
    setError("");
    setMessage("");
    try {
      await apiRequest("/media/upload", { method: "POST", token, body: formData });
      form.reset();
      setMessage("Uploaded as a private draft. Review and publish it when ready.");
      await loadAssets();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload media.");
    } finally {
      setUploading(false);
    }
  }

  async function updateAsset(id: number, patch: Partial<Pick<MediaAsset, "status" | "visibility">>) {
    setError("");
    try {
      await apiRequest(`/media/${id}`, { method: "PATCH", token, body: JSON.stringify(patch) });
      await loadAssets();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update media asset.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-[#087443]">CONTENT MANAGEMENT</p>
          <h1 className="text-2xl font-bold text-[#17251d] sm:text-3xl">Media vault</h1>
          <p className="mt-2 text-sm text-gray-500">Uploads are private drafts until explicitly approved and published.</p>
        </div>
        <button type="button" onClick={() => { setLoading(true); void loadAssets(); }} className="inline-flex items-center gap-2 rounded-md border border-[#dfe8e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#345143]"><RefreshCw size={16} /> Refresh</button>
      </header>

      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>}

      <form ref={formRef} onSubmit={(event) => void uploadAsset(event)} className="grid gap-4 rounded-lg border border-[#e8eee9] bg-white p-5 sm:grid-cols-[1fr_0.7fr_1.2fr_auto] sm:items-end">
        <label className="text-xs font-semibold text-gray-600">Title<input name="title" required minLength={2} maxLength={200} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal" /></label>
        <label className="text-xs font-semibold text-gray-600">Category<select name="category" className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm font-normal"><option value="image">Image</option><option value="flyer">Flyer</option><option value="logo">Logo</option><option value="other">Other</option></select></label>
        <label className="text-xs font-semibold text-gray-600">Image (JPEG, PNG, WebP; up to 8 MB)<input name="file" type="file" required accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#edf6f0] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#087443]" /></label>
        <button disabled={uploading} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#087443] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />} Upload</button>
      </form>

      <section className="overflow-hidden rounded-lg border border-[#e8eee9] bg-white">
        <div className="border-b border-[#edf0ed] px-5 py-4 text-sm font-semibold text-[#17251d]">{assets.length} assets</div>
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm text-gray-500"><LoaderCircle size={17} className="animate-spin" /> Loading media</div> : assets.length ? (
          <div className="divide-y divide-[#edf0ed]">
            {assets.map((asset) => (
              <article key={asset.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#edf6f0] text-[#087443]"><ImagePlus size={19} /></span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-[#17251d]">{asset.title}</h2>
                    <p className="mt-1 text-xs text-gray-500">{label(asset.category)} · {asset.mimeType ?? "File"} · {asset.fileSize ? `${Math.ceil(asset.fileSize / 1024)} KB` : "Sample asset"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Review status<select disabled={user?.role === "media_team"} value={asset.status} onChange={(event) => void updateAsset(asset.id, { status: event.target.value as MediaAsset["status"] })} className="mt-1 block rounded-md border border-[#dfe8e1] bg-white px-2.5 py-2 text-xs text-[#17251d] disabled:bg-gray-100"><option value="draft">Draft</option><option value="approved">Approved</option><option value="archived">Archived</option></select></label>
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Visibility<select disabled={!canPublish} value={asset.visibility} onChange={(event) => void updateAsset(asset.id, { visibility: event.target.value as MediaAsset["visibility"] })} className="mt-1 block rounded-md border border-[#dfe8e1] bg-white px-2.5 py-2 text-xs text-[#17251d] disabled:bg-gray-100"><option value="private">Private</option><option value="pending">Pending</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="px-5 py-14 text-center text-sm text-gray-500">No uploaded media yet.</div>}
      </section>
    </div>
  );
}
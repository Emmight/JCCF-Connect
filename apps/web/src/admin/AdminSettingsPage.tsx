import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";

import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type Settings = {
  fellowshipName: string;
  chapterName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
};

const emptySettings: Settings = {
  fellowshipName: "",
  chapterName: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  instagramUrl: "",
  facebookUrl: "",
};

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiRequest<{ success: boolean; data: Partial<Settings> }>("/settings", { token })
      .then((response) => setSettings({ ...emptySettings, ...response.data }))
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load settings."))
      .finally(() => setLoading(false));
  }, [token]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await apiRequest<{ success: boolean; data: Settings }>("/settings", {
        method: "PATCH",
        token,
        body: JSON.stringify(settings),
      });
      setSettings(response.data);
      setMessage("Settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  const fields: Array<{ key: keyof Settings; label: string; type?: string }> = [
    { key: "fellowshipName", label: "Fellowship name" },
    { key: "chapterName", label: "Chapter or institution" },
    { key: "contactEmail", label: "Public contact email", type: "email" },
    { key: "contactPhone", label: "Public phone number", type: "tel" },
    { key: "address", label: "Address or meeting location" },
    { key: "instagramUrl", label: "Instagram URL", type: "url" },
    { key: "facebookUrl", label: "Facebook URL", type: "url" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header><p className="mb-2 text-xs font-bold tracking-widest text-[#087443]">PREFERENCES</p><h1 className="text-2xl font-bold text-[#17251d] sm:text-3xl">Website settings</h1><p className="mt-2 text-sm text-gray-500">Manage fellowship details displayed across public pages.</p></header>
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>}
      <form onSubmit={(event) => void saveSettings(event)} className="space-y-5 rounded-lg border border-[#e8eee9] bg-white p-5 sm:p-7">
        {loading ? <p className="py-8 text-sm text-gray-500">Loading settings…</p> : <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => <label key={field.key} className="text-xs font-semibold text-gray-600">{field.label}<input type={field.type ?? "text"} maxLength={field.key === "address" ? 500 : 255} value={settings[field.key]} onChange={(event) => setSettings((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-2.5 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" /></label>)}
        </div>}
        <div className="flex justify-end border-t border-[#edf0ed] pt-5"><button disabled={saving || loading} className="inline-flex items-center gap-2 rounded-md bg-[#087443] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} />{saving ? "Saving…" : "Save settings"}</button></div>
      </form>
    </div>
  );
}
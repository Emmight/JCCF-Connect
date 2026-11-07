import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Crown,
  Users,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";
import { apiRequest } from "../api/client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Administration = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "upcoming" | "current" | "past";
};

type Executive = {
  id: number;
  administrationId: number;
  fullName: string;
  position: string;
  photoUrl: string | null;
  biography: string | null;
  administrationName: string;
  administrationSlug: string;
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const serif = "font-['Playfair_Display',Georgia,serif]";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D94A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#063D29]";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "Date not set";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Accepts absolute URLs (https://...), root paths (/uploads/...), data URIs
 * and bare paths (uploads/...). If your photos are stored on the API server
 * rather than the website, set VITE_ASSET_BASE_URL (e.g. https://api.example.com)
 * and relative paths will be prefixed with it.
 */
function resolveMedia(url: string | null | undefined) {
  if (!url) return null;
  const value = url.trim();
  if (!value) return null;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  const base = (import.meta.env.VITE_ASSET_BASE_URL as string | undefined) ?? "";
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${base.replace(/\/$/, "")}${path}`;
}

function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={`h-[2px] w-8 rounded-full ${light ? "bg-[#F7D94A]" : "bg-[#087443]"}`}
      />
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? "text-[#F7D94A]" : "text-[#087443]"}`}
      >
        {children}
      </span>
    </div>
  );
}

/** Shows the real photo. Falls back to initials only if there is no photo or it fails to load. */
function LeaderPhoto({
  executive,
  className = "",
  initialsSize = "text-5xl",
}: {
  executive: Executive;
  className?: string;
  initialsSize?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = resolveMedia(executive.photoUrl);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`Portrait of ${executive.fullName}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className} object-cover object-top`}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-[#087443] to-[#063D29] ${serif} ${initialsSize} font-semibold text-[#F7D94A]`}
      aria-label={executive.fullName}
    >
      {initials(executive.fullName)}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Executive detail dialog                                                    */
/* -------------------------------------------------------------------------- */

function ExecutiveDialog({
  executive,
  onClose,
}: {
  executive: Executive;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#042D20]/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={executive.fullName}
        onClick={(event) => event.stopPropagation()}
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px] md:grid-cols-[0.9fr_1.1fr]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#173A26] shadow transition hover:bg-[#F7D94A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]"
        >
          <X size={18} />
        </button>

        <LeaderPhoto
          executive={executive}
          className="h-72 w-full md:h-full md:min-h-[460px]"
          initialsSize="text-7xl"
        />

        <div className="overflow-y-auto p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087443]">
            {executive.position}
          </p>
          <h3 className={`${serif} mt-3 text-3xl font-semibold text-[#173A26]`}>
            {executive.fullName}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {executive.administrationName}
          </p>

          <div className="my-6 h-[2px] w-12 rounded-full bg-[#E44732]" />

          {executive.biography ? (
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {executive.biography}
            </p>
          ) : (
            <p className="text-sm leading-7 text-slate-500">
              A full biography has not been published yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

function LeadershipPage() {
  const [administrations, setAdministrations] = useState<Administration[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<Executive | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<{ success: boolean; data: Administration[] }>("/administrations"),
      apiRequest<{ success: boolean; data: Executive[] }>("/executives"),
    ])
      .then(([administrationResponse, executiveResponse]) => {
        if (!active) return;
        setAdministrations(administrationResponse.data ?? []);
        setExecutives(executiveResponse.data ?? []);
      })
      .catch((error: unknown) =>
        setLoadError(
          error instanceof Error ? error.message : "Unable to load leadership records.",
        ),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const currentAdministration =
    administrations.find((administration) => administration.status === "current") ?? null;
  const pastAdministrations = administrations.filter(
    (administration) => administration.status === "past",
  );

  const currentExecutives = useMemo(
    () =>
      executives.filter(
        (executive) => executive.administrationId === currentAdministration?.id,
      ),
    [executives, currentAdministration?.id],
  );

  const executivesByAdministration = useMemo(() => {
    const map = new Map<number, Executive[]>();
    for (const executive of executives) {
      const list = map.get(executive.administrationId) ?? [];
      list.push(executive);
      map.set(executive.administrationId, list);
    }
    return map;
  }, [executives]);

  const tenure = currentAdministration?.startDate
    ? `${formatDate(currentAdministration.startDate)} – ${
        currentAdministration.endDate ? formatDate(currentAdministration.endDate) : "Present"
      }`
    : "Dates not set";

  return (
    <main className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="Leadership | JCCF Unioffa"
        description="Meet current JCCF University of Offa leaders and explore the fellowship's administration archive."
      />
      <SiteBanner />
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-[#063D29] px-5 py-24 text-white sm:px-8 lg:px-10 lg:py-32">
        <div className="absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-24 h-[350px] w-[350px] rounded-full border border-[#F7D94A]/20" />
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#087443] via-[#F7D94A] to-[#E44732]" />

        <div className="relative mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-white/55"
          >
            <a href="/" className="transition hover:text-white">
              Home
            </a>
            <ChevronRight size={14} aria-hidden="true" />
            <span className="text-[#F7D94A]" aria-current="page">
              Leadership
            </span>
          </nav>

          <div className="mt-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]">
              <Users size={15} className="text-[#F7D94A]" />
              Our leadership
            </div>

            <h1
              className={`${serif} mt-7 text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl`}
            >
              People called{" "}
              <span className="italic text-[#F7D94A]">to serve.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Meet the people entrusted with serving the JCCF University of Offa
              community, and explore the administrations that have shaped our
              fellowship's journey.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#current-administration"
              className={`inline-flex items-center justify-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#173A26] transition hover:bg-white ${focusRing}`}
            >
              Meet the current team <ArrowDown size={17} />
            </a>
            <a
              href="#archives"
              className={`inline-flex items-center justify-center gap-3 rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10 ${focusRing}`}
            >
              Browse past administrations
            </a>
          </div>

          {!loading && !loadError && (
            <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-5 border-t border-white/20 pt-7">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Serving now
                </dt>
                <dd className="mt-1.5 font-semibold text-white">
                  {currentExecutives.length}{" "}
                  {currentExecutives.length === 1 ? "executive" : "executives"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Past administrations
                </dt>
                <dd className="mt-1.5 font-semibold text-white">
                  {pastAdministrations.length} on record
                </dd>
              </div>
              {currentAdministration && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    Current tenure
                  </dt>
                  <dd className="mt-1.5 font-semibold text-[#F7D94A]">
                    {currentAdministration.name}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Current administration                                              */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="current-administration"
        className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel>Current administration</SectionLabel>
              <h2
                className={`${serif} text-4xl font-semibold tracking-tight text-[#173A26] sm:text-5xl`}
              >
                {currentAdministration?.name ?? "Current administration not published"}
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                The team currently serving the Joint Christian Campus
                Fellowship, University of Offa Chapter.
              </p>
            </div>

            {currentAdministration && (
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#CFE5D5] bg-[#EAF5EE] px-4 py-2.5 text-xs font-bold text-[#087443] md:self-auto">
                <span className="h-2 w-2 rounded-full bg-[#087443]" />
                Current tenure
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-[1.3fr_0.7fr]">
            <div className="relative overflow-hidden rounded-[28px] bg-[#063D29] p-8 text-white sm:p-10">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7D94A] text-[#173A26]">
                  <Crown size={23} />
                </div>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  Administration theme
                </p>
                <h3
                  className={`${serif} mt-3 text-4xl font-semibold text-[#F7D94A] sm:text-5xl`}
                >
                  {currentAdministration?.name ?? "Administration details pending"}
                </h3>
                <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">
                  {currentAdministration?.description ??
                    "Details about the current administration will appear here once they are confirmed."}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[28px] border border-[#E5ECE6] bg-white p-8">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5EE] text-[#087443]">
                  <CalendarDays size={22} />
                </div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.17em] text-slate-400">
                  Tenure period
                </p>
                <p className="mt-3 text-xl font-bold text-[#173A26]">{tenure}</p>
              </div>
              <p className="mt-8 text-sm leading-6 text-slate-500">
                {currentAdministration
                  ? `${currentExecutives.length} ${currentExecutives.length === 1 ? "executive" : "executives"} currently serving.`
                  : "Official tenure dates have not been published."}
              </p>
            </div>
          </div>

          {/* Executive directory */}
          <div className="mt-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <SectionLabel>The people behind the service</SectionLabel>
                <h3 className={`${serif} text-3xl font-semibold text-[#173A26] sm:text-4xl`}>
                  Meet the executives
                </h3>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-500">
                Select any card to read the full profile.
              </p>
            </div>

            {loadError && (
              <p role="alert" className="mt-5 text-sm text-red-700">
                {loadError}
              </p>
            )}

            {loading ? (
              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
                {[0, 1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="aspect-[4/5] animate-pulse rounded-[22px] bg-[#E4EFE6]"
                  />
                ))}
              </div>
            ) : currentExecutives.length ? (
              <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {currentExecutives.map((executive) => (
                  <button
                    key={executive.id}
                    type="button"
                    onClick={() => setSelected(executive)}
                    className="group relative overflow-hidden rounded-[22px] bg-[#063D29] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#075B35]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
                  >
                    <LeaderPhoto
                      executive={executive}
                      className="aspect-[4/5] w-full transition duration-500 group-hover:scale-[1.03]"
                      initialsSize="text-6xl"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#042D20] via-[#042D20]/20 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F7D94A]">
                        {executive.position}
                      </p>
                      <h4 className={`${serif} mt-1.5 text-xl font-semibold leading-snug text-white`}>
                        {executive.fullName}
                      </h4>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 transition group-hover:text-white">
                        View profile <ArrowRight size={14} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-xl border border-dashed border-[#DFE9E1] bg-white p-8 text-sm text-slate-500">
                No current executives have been published.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Past administrations                                                */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="archives"
        className="scroll-mt-24 bg-[#F0F5F1] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <SectionLabel>Our history</SectionLabel>
            <h2
              className={`${serif} text-4xl font-semibold tracking-tight text-[#173A26] sm:text-5xl`}
            >
              Every administration leaves a legacy.
            </h2>
            <p className="mt-5 leading-8 text-slate-500">
              JCCF is bigger than any single tenure. This archive preserves the
              people, leadership and contributions of previous administrations.
            </p>
          </div>

          {pastAdministrations.length ? (
            <div className="mt-12 grid items-start gap-5 md:grid-cols-2">
              {pastAdministrations.map((administration) => {
                const team = executivesByAdministration.get(administration.id) ?? [];
                const period = administration.startDate
                  ? `${formatDate(administration.startDate)}${
                      administration.endDate ? ` – ${formatDate(administration.endDate)}` : ""
                    }`
                  : "Dates not set";

                return (
                  <details
                    key={administration.id}
                    className="group rounded-2xl border border-[#DFE9E1] bg-white open:border-[#B7D9C2] open:shadow-lg open:shadow-[#075B35]/[0.05]"
                  >
                    <summary className="flex cursor-pointer list-none items-start gap-4 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] [&::-webkit-details-marker]:hidden">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF5EE] text-[#087443]">
                        <CalendarDays size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-[#173A26]">
                          {administration.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{period}</p>
                        <p className="mt-1 text-xs font-semibold text-[#087443]">
                          {team.length
                            ? `${team.length} ${team.length === 1 ? "executive" : "executives"} on record`
                            : "No executives published"}
                        </p>
                      </div>
                      <ChevronDown
                        size={20}
                        className="mt-1 shrink-0 text-[#087443] transition-transform group-open:rotate-180"
                      />
                    </summary>

                    <div className="border-t border-[#EEF2EE] px-6 pb-6 pt-5">
                      {administration.description && (
                        <p className="mb-5 text-sm leading-7 text-slate-500">
                          {administration.description}
                        </p>
                      )}

                      {team.length > 0 && (
                        <ul className="space-y-1">
                          {team.map((executive) => (
                            <li key={executive.id}>
                              <button
                                type="button"
                                onClick={() => setSelected(executive)}
                                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left transition hover:bg-[#F0F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]"
                              >
                                <LeaderPhoto
                                  executive={executive}
                                  className="h-12 w-12 shrink-0 rounded-full"
                                  initialsSize="text-base"
                                />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-bold text-[#173A26]">
                                    {executive.fullName}
                                  </span>
                                  <span className="block truncate text-xs text-slate-500">
                                    {executive.position}
                                  </span>
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <p className="mt-10 rounded-xl border border-dashed border-[#DFE9E1] bg-white p-8 text-sm text-slate-500">
              No previous administration records have been published.
            </p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[28px] bg-[#063D29] p-8 text-white sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F7D94A]">
              JCCF Connect
            </p>
            <h2 className={`${serif} mt-4 max-w-2xl text-3xl font-semibold sm:text-4xl`}>
              Be part of the fellowship story.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
              Discover our community, activities and opportunities to serve
              alongside the people on this page.
            </p>
          </div>

          <a
            href="/programmes"
            className={`inline-flex shrink-0 items-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#173A26] transition hover:bg-white ${focusRing}`}
          >
            Explore JCCF <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <Footer />

      {selected && (
        <ExecutiveDialog executive={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

export default LeadershipPage;
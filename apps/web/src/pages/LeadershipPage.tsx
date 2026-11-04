
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Crown,
  Users,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";
import { apiRequest } from "../api/client";

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

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "Date not set";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function LeadershipPage() {
  const [administrations, setAdministrations] = useState<Administration[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "Unable to load leadership records."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const currentAdministration = administrations.find((administration) => administration.status === "current") ?? null;
  const pastAdministrations = administrations.filter((administration) => administration.status === "past");
  const currentExecutives = useMemo(
    () => executives.filter((executive) => executive.administrationId === currentAdministration?.id),
    [executives, currentAdministration?.id]
  );

  return (
    <main className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="Leadership | JCCF Unioffa"
        description="Meet current JCCF University of Offa leaders and explore the fellowship's administration archive."
      />
      <SiteBanner />
      <Navbar />

      {/* Page hero */}
      <section className="relative overflow-hidden bg-[#063D29] px-5 py-24 text-white sm:px-8 lg:px-10 lg:py-32">
        <div className="absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-24 h-[350px] w-[350px] rounded-full border border-[#F7D94A]/20" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/55">
            <a href="/" className="transition hover:text-white">Home</a>
            <ChevronRight size={14} />
            <span className="text-[#F7D94A]">Leadership</span>
          </div>

          <div className="mt-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em]">
              <Users size={15} className="text-[#F7D94A]" />
              Our leadership
            </div>

            <h1 className="mt-7 text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              People called
              <span className="mt-2 block font-serif font-medium italic text-[#F7D94A]">
                to serve.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Meet the people entrusted with serving the JCCF University
              of Offa community, and explore the administrations that
              have contributed to our fellowship's journey.
            </p>
          </div>

          <a
            href="#current-administration"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#173A26] transition hover:bg-white"
          >
            Meet the current team <ArrowDown size={17} />
          </a>
        </div>
      </section>

      {/* Current administration */}
      <section
        id="current-administration"
        className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087443]">
                Current administration
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#173A26] sm:text-5xl">
                {currentAdministration?.name ?? "Current administration not published"}
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                The team currently serving the Joint Christian Campus
                Fellowship, University of Offa Chapter.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#CFE5D5] bg-[#EAF5EE] px-4 py-2.5 text-xs font-bold text-[#087443] md:self-auto">
              <span className="h-2 w-2 rounded-full bg-[#087443]" />
              Current tenure
            </div>
          </div>

          {/* Tenure information */}
          <div className="mt-10 grid gap-5 md:grid-cols-[1.3fr_0.7fr]">
            <div className="relative overflow-hidden rounded-[28px] bg-[#063D29] p-8 text-white sm:p-10">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7D94A] text-[#173A26]">
                  <Crown size={23} />
                </div>

                <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                  Administration theme
                </p>

                <h3 className="mt-3 font-serif text-4xl font-semibold text-[#F7D94A] sm:text-5xl">
                  {currentAdministration?.name ?? "Administration details pending"}
                </h3>

                <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">
                  {currentAdministration?.description ?? "Details about the current administration will appear here once they are confirmed."}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[28px] border border-[#E5ECE6] bg-white p-8">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5EE] text-[#087443]">
                  <CalendarDays size={22} />
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.17em] text-slate-400">
                  Tenure period
                </p>

                <p className="mt-3 text-xl font-bold text-[#173A26]">
                  {currentAdministration?.startDate ? `${formatDate(currentAdministration.startDate)} – ${currentAdministration.endDate ? formatDate(currentAdministration.endDate) : "Present"}` : "Dates not set"}
                </p>
              </div>

              <p className="mt-8 text-sm leading-6 text-slate-500">
                {currentAdministration ? "Current administration tenure." : "Official tenure dates have not been published."}
              </p>
            </div>
          </div>

          {/* Executive directory */}
          <div className="mt-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087443]">
                  The people behind the service
                </p>
                <h3 className="mt-3 text-3xl font-bold text-[#173A26]">
                  Meet the executives
                </h3>
              </div>

              <p className="max-w-sm text-sm leading-6 text-slate-500">Current executive directory</p>
            </div>

            {loadError && <p role="alert" className="mt-5 text-sm text-red-700">{loadError}</p>}
            {loading ? <p className="mt-8 text-sm text-slate-500">Loading leadership records…</p> : currentExecutives.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {currentExecutives.map((executive, index) => (
                <article
                  key={executive.id}
                  className="group overflow-hidden rounded-[22px] border border-[#E5ECE6] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#075B35]/[0.06]"
                >
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#EAF2EC]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#EAF5EE] via-[#E4EFE6] to-[#D6E8DA]" />

                    {executive.photoUrl ? <img src={executive.photoUrl} alt={executive.fullName} className="relative h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg" /> : <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#087443] text-2xl font-bold text-white shadow-lg">{initials(executive.fullName)}</div>}

                    <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#087443] backdrop-blur">
                      Executive {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#087443]">
                      {executive.position}
                    </p>

                    <h4 className="mt-3 text-lg font-bold text-[#173A26]">
                      {executive.fullName}
                    </h4>

                    {executive.biography && <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{executive.biography}</p>}
                  </div>
                </article>
              ))}
            </div> : <p className="mt-8 rounded-xl border border-dashed border-[#DFE9E1] bg-white p-8 text-sm text-slate-500">No current executives have been published.</p>}
          </div>
        </div>
      </section>

      {/* Previous administrations */}
      <section
        id="archives"
        className="scroll-mt-24 bg-[#F0F5F1] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087443]">
              Our history
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#173A26] sm:text-5xl">
              Every administration leaves a legacy.
            </h2>

            <p className="mt-5 leading-8 text-slate-500">
              JCCF is bigger than any single tenure. This archive will
              preserve the people, leadership and contributions of
              previous administrations.
            </p>
          </div>

          {pastAdministrations.length ? <div className="mt-12 grid gap-4 md:grid-cols-2">{pastAdministrations.map((administration) => <article key={administration.id} className="rounded-xl border border-[#DFE9E1] bg-white p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#087443]"><CalendarDays size={22} /></div><div><h3 className="text-lg font-bold text-[#173A26]">{administration.name}</h3><p className="mt-1 text-xs capitalize text-[#087443]">Previous administration</p><p className="mt-3 text-sm text-slate-500">{administration.startDate ? formatDate(administration.startDate) : "Dates not set"}{administration.endDate ? ` – ${formatDate(administration.endDate)}` : ""}</p>{administration.description && <p className="mt-3 text-sm leading-6 text-slate-500">{administration.description}</p>}</div></div></article>)}</div> : <p className="mt-10 rounded-xl border border-dashed border-[#DFE9E1] bg-white p-8 text-sm text-slate-500">No previous administration records have been published.</p>}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[28px] bg-[#063D29] p-8 text-white sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F7D94A]">
              JCCF Connect
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">
              Be part of the fellowship story.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Discover our community, activities and opportunities to serve.
            </p>
          </div>

          <a
            href="/programmes"
            className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#173A26] transition hover:bg-white"
          >
            Explore JCCF <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default LeadershipPage;

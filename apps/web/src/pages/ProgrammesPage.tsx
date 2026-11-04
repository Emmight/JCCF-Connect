
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Heart,
  Mic2,
  Music2,
  Sparkles,
  Users,
} from "lucide-react";

import { apiRequest } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";

type ProgrammeRecord = {
  id: number;
  title: string;
  category: string;
  description?: string | null;
  startDate?: string | null;
  venue?: string | null;
  imageUrl?: string | null;
  status?: string;
};

type ProgrammeCard = {
  number: string;
  title: string;
  category: string;
  description: string;
  startDate: string | null;
  venue: string | null;
  icon: typeof BookOpen;
  accent: string;
};

const iconByCategory: Record<string, typeof BookOpen> = {
  worship: Music2,
  prayer: Heart,
  bible_study: BookOpen,
  conference: Mic2,
  seminar: Mic2,
  outreach: Sparkles,
  fellowship: Users,
  other: BookOpen,
};

const accentByCategory: Record<string, string> = {
  worship: "bg-[#FFF8DB] text-[#9A7410]",
  prayer: "bg-[#FFF0EC] text-[#E44732]",
  bible_study: "bg-[#EAF4EE] text-[#087443]",
  conference: "bg-[#F3ECFA] text-[#8054A6]",
  seminar: "bg-[#F3ECFA] text-[#8054A6]",
  outreach: "bg-[#EAF4EE] text-[#087443]",
  fellowship: "bg-[#EEF1FA] text-[#475A9A]",
  other: "bg-[#EAF4EE] text-[#087443]",
};

function formatCategory(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatProgrammeDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-[2px] w-8 bg-[#087443]" />
      <span className="text-xs font-bold tracking-[0.2em] text-[#087443]">
        {children}
      </span>
    </div>
  );
}

export default function ProgrammesPage() {
  const [programmeCards, setProgrammeCards] = useState<ProgrammeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProgrammes() {
      try {
        const response = await apiRequest<{ success: boolean; data: ProgrammeRecord[] }>(
          "/programmes"
        );

        if (!active) return;

        const liveProgrammes: ProgrammeCard[] = response.data.map((programme, index) => {
          const category = programme.category || "other";
          const Icon = iconByCategory[category] ?? BookOpen;

          return {
            number: String(index + 1).padStart(2, "0"),
            title: programme.title,
            category: formatCategory(category),
            description:
              programme.description ||
              "Further programme details will be shared by the fellowship.",
            startDate: programme.startDate ?? null,
            venue: programme.venue ?? null,
            icon: Icon,
            accent: accentByCategory[category] ?? "bg-[#EAF4EE] text-[#087443]",
          };
        });

        setProgrammeCards(liveProgrammes);
      } catch (error) {
        console.warn("Unable to load programmes from API.", error);
        if (active) setLoadError("Programmes are temporarily unavailable. Please try again later.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProgrammes();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(() => programmeCards, [programmeCards]);

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="Programmes & Events | JCCF Unioffa"
        description="Explore fellowship activities, programmes and upcoming events at Joint Christian Campus Fellowship, University of Offa."
      />
      <SiteBanner />
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#052F21] px-5 py-20 text-white sm:py-28">
          <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-14 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex items-center gap-2 text-sm text-white/60">
              <a href="/" className="transition hover:text-white">
                Home
              </a>
              <span>/</span>
              <span className="text-white">Our programmes</span>
            </div>

            <div className="max-w-3xl">
              <SectionLabel>GROWING TOGETHER IN CHRIST</SectionLabel>

              <h1 className="font-['Playfair_Display'] text-5xl font-semibold leading-[1.12] sm:text-6xl lg:text-7xl">
                Faith in action.
                <br />
                <span className="italic text-[#F7D94A]">
                  Purpose in every gathering.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Every gathering is an opportunity to grow, connect, worship
                and become more grounded in Christ. Discover the activities
                that shape our fellowship life.
              </p>

              <a
                href="#programmes"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#063D29] transition hover:bg-white"
              >
                Explore our programmes
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="px-5 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <SectionLabel>MORE THAN MEETINGS</SectionLabel>
              <h2 className="font-['Playfair_Display'] text-4xl font-semibold leading-tight sm:text-5xl">
                A community built on{" "}
                <span className="italic text-[#087443]">faith and fellowship.</span>
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-8 text-[#647168]">
              JCCF is a place to encounter God, learn His Word, develop
              meaningful friendships and discover your purpose. Through our
              programmes, we create opportunities for students to grow
              spiritually and make a positive impact on campus.
            </p>
          </div>
        </section>

        {/* PROGRAMME CARDS */}
        <section id="programmes" className="scroll-mt-24 px-5 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <SectionLabel>WHAT WE DO</SectionLabel>
                <h2 className="font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
                  Our programmes
                </h2>
              </div>

              <p className="max-w-md text-sm leading-7 text-[#647168]">
                Different expressions of one shared commitment: knowing
                Christ and making Him known.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((programme) => {
                const Icon = programme.icon;

                return (
                  <article
                    key={programme.number}
                    className="group flex min-h-[300px] flex-col rounded-[24px] border border-[#E8ECE8] bg-white p-7 shadow-[0_12px_36px_-30px_rgba(6,61,41,0.42)] transition duration-300 hover:-translate-y-1 hover:border-[#087443]/30 hover:shadow-xl hover:shadow-[#063D29]/5 sm:p-8"
                  >
                    <div className="mb-8 flex items-center justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${programme.accent}`}
                      >
                        <Icon size={25} strokeWidth={1.8} />
                      </div>

                      <span className="text-sm font-semibold text-[#B5BDB7]">
                        {programme.number}
                      </span>
                    </div>

                    <p className="mb-3 text-[10px] font-bold tracking-[0.17em] text-[#087443]">
                      {programme.category}
                    </p>

                    <h3 className="font-['Playfair_Display'] text-2xl font-semibold">
                      {programme.title}
                    </h3>

                    <p className="mt-4 flex-1 text-sm leading-7 text-[#718078]">
                      {programme.description}
                    </p>

                    <div className="mt-7 flex items-center justify-between border-t border-[#EEF0ED] pt-5">
                      <span className="flex flex-col gap-1 text-xs font-semibold text-[#087443]">
                        {formatProgrammeDate(programme.startDate) && (
                          <span>{formatProgrammeDate(programme.startDate)}</span>
                        )}
                        {programme.venue && (
                          <span className="font-medium text-[#718078]">{programme.venue}</span>
                        )}
                        {!programme.startDate && !programme.venue && "Programme details"}
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="text-[#087443] transition group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>
                  </article>
                );
              })}
            </div>

            {loading && cards.length === 0 && (
              <div className="col-span-full rounded-3xl border border-[#E8ECE8] bg-white px-6 py-16 text-center" role="status">
                <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#D9E7DC] border-t-[#087443]" />
                <p className="mt-4 text-sm text-[#718078]">Loading fellowship programmes…</p>
              </div>
            )}
            {!loading && loadError && (
              <div className="col-span-full rounded-3xl border border-[#E8ECE8] bg-white px-6 py-16 text-center" role="alert">
                <CalendarDays size={30} className="mx-auto mb-5 text-[#A5AEA7]" />
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold">Programmes unavailable</h3>
                <p className="mt-3 text-sm text-[#718078]">{loadError}</p>
              </div>
            )}
            {!loading && !loadError && cards.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-[#D8E1D9] bg-white px-6 py-16 text-center">
                <CalendarDays size={30} className="mx-auto mb-5 text-[#A5AEA7]" />
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold">No programmes published yet</h3>
                <p className="mt-3 text-sm text-[#718078]">Confirmed fellowship programmes will appear here as soon as they are announced.</p>
              </div>
            )}
          </div>
        </section>

        {/* EVENTS NOTICE */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#EAF4EE]">
            <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#087443]">
                  <CalendarDays size={22} />
                </div>

                <p className="mb-3 text-xs font-bold tracking-[0.18em] text-[#087443]">
                  STAY CONNECTED
                </p>

                <h2 className="font-['Playfair_Display'] text-3xl font-semibold sm:text-4xl">
                  Don't miss what is happening.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#647168]">
                  Keep up with fellowship announcements, special programmes
                  and upcoming events through our updates page.
                </p>
              </div>

              <a
                href="/announcements"
                className="inline-flex w-fit items-center gap-3 rounded-full bg-[#087443] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#063D29]"
              >
                View announcements
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

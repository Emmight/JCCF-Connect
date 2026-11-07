import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Search,
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

type AnnouncementRecord = {
  id: number;
  title: string;
  summary?: string | null;
  content?: string | null;
  category?: string | null;
  status?: string;
  isFeatured?: boolean;
  publishedAt?: string | null;
  // Optional cover image fields, used if your API provides any of them.
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  photoUrl?: string | null;
};

type Update = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  featured: boolean;
  image: string | null;
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const serif = "font-['Playfair_Display',Georgia,serif]";

const defaultCategories = ["All updates", "Announcements", "Events", "News", "Notices"];

const categoryLabels: Record<string, string> = {
  announcement: "Announcements",
  event: "Events",
  news: "News",
  notice: "Notices",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D94A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#052F21]";

function formatAnnouncementDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Supports absolute URLs, root paths and bare paths. Set VITE_ASSET_BASE_URL if images live on the API server. */
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
    <div className="mb-5 flex items-center gap-3">
      <span className={`h-[2px] w-8 ${light ? "bg-[#F7D94A]" : "bg-[#087443]"}`} />
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? "text-[#F7D94A]" : "text-[#087443]"}`}
      >
        {children}
      </span>
    </div>
  );
}

/** Real cover image when available; otherwise an on-brand panel with the JCCF emblem. */
function Cover({ src, className = "" }: { src: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#087443] via-[#063D29] to-[#042D20]`}
      aria-hidden="true"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" />
      <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full border border-[#F7D94A]/20" />
      <img
        src="/images/jccf-logo.png"
        alt=""
        className="relative h-24 w-24 object-contain opacity-90"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Detail dialog                                                              */
/* -------------------------------------------------------------------------- */

function UpdateDialog({ item, onClose }: { item: Update; onClose: () => void }) {
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#042D20]/80 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#173A26] shadow transition hover:bg-[#F7D94A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]"
        >
          <X size={18} />
        </button>

        <Cover src={item.image} className="h-52 w-full shrink-0 sm:h-64" />

        <div className="overflow-y-auto p-8 sm:p-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#087443]">
            <span className="rounded-full bg-[#EAF4EE] px-3 py-1">{item.category}</span>
            {item.date && <span className="text-slate-500">{item.date}</span>}
          </div>
          <h3 className={`${serif} mt-5 text-3xl font-semibold leading-tight text-[#173A26]`}>
            {item.title}
          </h3>
          <div className="my-6 h-[2px] w-12 rounded-full bg-[#E44732]" />
          <p className="whitespace-pre-line text-sm leading-8 text-slate-600">
            {item.content || item.excerpt}
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AnnouncementsPage() {
  const [activeCategory, setActiveCategory] = useState("All updates");
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<Update | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAnnouncements() {
      try {
        const response = await apiRequest<{ success: boolean; data: AnnouncementRecord[] }>(
          "/announcements",
        );
        if (!active) return;

        const live: Update[] = (response.data ?? []).map((item) => {
          const body = item.content?.trim() ?? "";
          return {
            id: item.id,
            category: item.category
              ? (categoryLabels[item.category.toLowerCase()] ?? item.category)
              : "Announcements",
            title: item.title,
            excerpt: item.summary || body || "A fellowship update from JCCF.",
            content: body,
            date: formatAnnouncementDate(item.publishedAt),
            featured: Boolean(item.isFeatured),
            image: resolveMedia(item.imageUrl ?? item.coverImageUrl ?? item.photoUrl),
          };
        });

        setAnnouncements(live);
      } catch (error) {
        console.warn("Unable to load announcements from API.", error);
        if (active) setLoadError("Updates are temporarily unavailable. Please try again later.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnnouncements();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const extra = announcements
      .map((item) => item.category)
      .filter((category) => !defaultCategories.includes(category));
    return [...defaultCategories, ...Array.from(new Set(extra))];
  }, [announcements]);

  const filtersActive = search.trim() !== "" || activeCategory !== "All updates";
  const featured = announcements.find((item) => item.featured) ?? null;

  const filteredAnnouncements = useMemo(() => {
    const term = search.trim().toLowerCase();
    return announcements.filter((item) => {
      const matchesCategory = activeCategory === "All updates" || item.category === activeCategory;
      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.excerpt.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, announcements, search]);

  // The featured update sits above the grid. While filtering, it joins the grid like any other update.
  const gridItems =
    filtersActive || !featured
      ? filteredAnnouncements
      : filteredAnnouncements.filter((item) => item.id !== featured.id);

  const showFeatured = Boolean(featured) && !filtersActive;

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="Fellowship Updates | JCCF Unioffa"
        description="Read official announcements, notices, event updates and news from JCCF at the University of Offa."
      />
      <SiteBanner />
      <Navbar />

      <main>
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                              */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-[#052F21] px-5 py-24 text-white sm:py-28">
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-5 h-64 w-64 rounded-full border border-[#F7D94A]/15" />
          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#087443] via-[#F7D94A] to-[#E44732]" />

          <div className="relative mx-auto max-w-7xl">
            <nav
              aria-label="Breadcrumb"
              className="mb-10 flex items-center gap-2 text-sm text-white/60"
            >
              <a href="/" className="transition hover:text-white">
                Home
              </a>
              <span aria-hidden="true">/</span>
              <span className="text-white" aria-current="page">
                Announcements
              </span>
            </nav>

            <div className="max-w-3xl">
              <SectionLabel light>What's happening</SectionLabel>

              <h1
                className={`${serif} text-5xl font-semibold leading-[1.12] sm:text-6xl lg:text-7xl`}
              >
                The latest from
                <br />
                <span className="italic text-[#F7D94A]">our fellowship.</span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Official announcements, important notices, event updates and
                stories from the JCCF University of Offa community, all in one
                place.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#updates"
                  className={`inline-flex items-center justify-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#063D29] transition hover:bg-white ${focusRing}`}
                >
                  Read the updates <ArrowRight size={17} />
                </a>
                <a
                  href="/programmes"
                  className={`inline-flex items-center justify-center gap-3 rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10 ${focusRing}`}
                >
                  See programmes
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Featured                                                          */}
        {/* ---------------------------------------------------------------- */}
        {showFeatured && featured && (
          <section className="px-5 pt-16 sm:pt-20">
            <div className="mx-auto max-w-7xl">
              <SectionLabel>Featured update</SectionLabel>

              <article className="grid overflow-hidden rounded-3xl border border-[#E8ECE8] bg-white shadow-xl shadow-[#063D29]/[0.04] md:grid-cols-2">
                <div className="relative min-h-[280px] overflow-hidden md:min-h-[440px]">
                  <Cover src={featured.image} className="absolute inset-0 h-full w-full" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#052F21]/50 to-transparent" />
                  <span className="absolute left-6 top-6 rounded-full bg-[#F7D94A] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#063D29]">
                    Featured
                  </span>
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#087443]">
                    <span className="rounded-full bg-[#EAF4EE] px-3 py-1">{featured.category}</span>
                    {featured.date && <span className="text-slate-500">{featured.date}</span>}
                  </div>

                  <h2 className={`${serif} mt-6 text-3xl font-semibold leading-tight sm:text-4xl`}>
                    {featured.title}
                  </h2>

                  <p className="mt-5 line-clamp-5 text-sm leading-8 text-[#718078]">
                    {featured.excerpt}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelected(featured)}
                    className="mt-8 inline-flex w-fit items-center gap-3 text-sm font-bold text-[#087443] transition hover:text-[#E44732] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
                  >
                    Read the full update
                    <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Updates board                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section id="updates" className="scroll-mt-24 px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <SectionLabel>The update board</SectionLabel>
                <h2 className={`${serif} text-4xl font-semibold sm:text-5xl`}>Latest updates</h2>
                <p className="mt-4 text-sm text-[#718078]">
                  News, information and notices from JCCF.
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#89948C]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search updates..."
                  aria-label="Search updates"
                  className="w-full rounded-full border border-[#E2E8E2] bg-white py-3.5 pl-11 pr-5 text-sm outline-none transition focus:border-[#087443] focus:ring-2 focus:ring-[#087443]/15"
                />
              </div>
            </div>

            {/* Category filters */}
            <div
              className="mb-10 flex gap-2 overflow-x-auto pb-3"
              role="group"
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                  className={`shrink-0 rounded-full px-5 py-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 ${
                    activeCategory === category
                      ? "bg-[#087443] text-white"
                      : "border border-[#E2E8E2] bg-white text-[#647168] hover:border-[#087443] hover:text-[#087443]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Cards */}
            {loading ? (
              <div
                className="rounded-3xl border border-[#E8ECE8] bg-white px-6 py-16 text-center"
                role="status"
              >
                <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#D9E7DC] border-t-[#087443]" />
                <p className="mt-4 text-sm text-[#718078]">Loading fellowship updates…</p>
              </div>
            ) : loadError ? (
              <div
                className="rounded-3xl border border-[#E8ECE8] bg-white px-6 py-16 text-center"
                role="alert"
              >
                <Bell size={30} className="mx-auto mb-5 text-[#A5AEA7]" />
                <h3 className={`${serif} text-2xl font-semibold`}>Updates unavailable</h3>
                <p className="mt-3 text-sm text-[#718078]">{loadError}</p>
              </div>
            ) : gridItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridItems.map((item) => (
                  <article
                    key={item.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8ECE8] bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#063D29]/5"
                  >
                    <div className="relative h-56 overflow-hidden bg-[#EAF4EE]">
                      <Cover
                        src={item.image}
                        className="h-full w-full transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#087443]">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-7">
                      {item.date && (
                        <div className="flex items-center gap-2 text-xs text-[#89948C]">
                          <CalendarDays size={14} />
                          {item.date}
                        </div>
                      )}

                      <h3
                        className={`${serif} ${item.date ? "mt-5" : ""} text-2xl font-semibold leading-snug`}
                      >
                        {item.title}
                      </h3>

                      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-7 text-[#718078]">
                        {item.excerpt}
                      </p>

                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="mt-7 flex items-center justify-between border-t border-[#EEF0ED] pt-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]"
                      >
                        <span className="text-xs font-semibold text-[#087443]">Read more</span>
                        <ArrowUpRight
                          size={18}
                          className="text-[#087443] transition group-hover:text-[#E44732]"
                        />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : filtersActive || announcements.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#D8E1D9] bg-white px-6 py-16 text-center">
                <Search size={30} className="mx-auto mb-5 text-[#A5AEA7]" />
                <h3 className={`${serif} text-2xl font-semibold`}>
                  {announcements.length ? "No updates found" : "No updates published yet"}
                </h3>
                <p className="mt-3 text-sm text-[#718078]">
                  {announcements.length
                    ? "Try another search term or select a different category."
                    : "Official fellowship news and notices will appear here when they are published."}
                </p>
                {announcements.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All updates");
                    }}
                    className="mt-6 text-sm font-bold text-[#087443] transition hover:text-[#E44732]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-[#D8E1D9] bg-white px-6 py-10 text-center text-sm text-[#718078]">
                The featured update above is the only one published right now. New updates will
                appear here.
              </p>
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CTA                                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-5 pb-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl bg-[#EAF4EE] p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#087443]">
                <Bell size={25} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087443]">
                  Stay in the loop
                </p>
                <h2 className={`${serif} mt-2 text-3xl font-semibold`}>
                  There's more to come.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#647168]">
                  Check back regularly for important fellowship information and
                  upcoming activities. New notices are posted here first.
                </p>
              </div>
            </div>

            <a
              href="/programmes"
              className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-[#087443] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#063D29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
            >
              Explore programmes
              <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>

      <Footer />

      {selected && <UpdateDialog item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
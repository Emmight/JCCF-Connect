
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Search,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";
import { apiRequest } from "../api/client";

type AnnouncementRecord = {
  id: number;
  title: string;
  summary?: string | null;
  content?: string;
  category?: string;
  status?: string;
  isFeatured?: boolean;
  publishedAt?: string | null;
};

const categories = [
  "All updates",
  "Announcements",
  "Events",
  "News",
  "Notices",
];

function formatAnnouncementDate(value?: string | null) {
  if (!value) return "Upcoming";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Upcoming";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

export default function AnnouncementsPage() {
  const [activeCategory, setActiveCategory] = useState("All updates");
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState<
    Array<{
      id: number;
      category: string;
      title: string;
      excerpt: string;
      date: string;
      featured: boolean;
      image: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnnouncements() {
      try {
        const response = await apiRequest<{ success: boolean; data: AnnouncementRecord[] }>(
          "/announcements"
        );

        if (!active) return;

        const liveAnnouncements = response.data.map((item) => ({
          id: item.id,
          category: item.category
            ? ({
                announcement: "Announcements",
                event: "Events",
                news: "News",
                notice: "Notices",
              }[item.category.toLowerCase()] ?? item.category)
            : "Announcements",
          title: item.title,
          excerpt: item.summary || item.content || "A fellowship update from JCCF.",
          date: formatAnnouncementDate(item.publishedAt),
          featured: Boolean(item.isFeatured),
          image:
            "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85",
        }));

        setAnnouncements(liveAnnouncements);
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

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchesCategory =
        activeCategory === "All updates" ||
        item.category === activeCategory;

      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, announcements, search]);

  const featured = announcements.find((item) => item.featured);

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="Fellowship Updates | JCCF Unioffa"
        description="Read official announcements, notices, event updates and news from JCCF at the University of Offa."
      />
      <SiteBanner />
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#052F21] px-5 py-20 text-white sm:py-24">
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-5 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex items-center gap-2 text-sm text-white/60">
              <a href="/" className="transition hover:text-white">
                Home
              </a>
              <span>/</span>
              <span className="text-white">Announcements</span>
            </div>

            <div className="max-w-3xl">
              <SectionLabel>WHAT'S HAPPENING</SectionLabel>

              <h1 className="font-['Playfair_Display'] text-5xl font-semibold leading-[1.12] sm:text-6xl lg:text-7xl">
                The latest from
                <br />
                <span className="italic text-[#F7D94A]">
                  our fellowship.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Stay informed about JCCF activities, important notices,
                special programmes and stories from our community.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURED ANNOUNCEMENT */}
        {featured && (
          <section className="px-5 pt-16 sm:pt-20">
            <div className="mx-auto max-w-7xl">
              <SectionLabel>FEATURED UPDATE</SectionLabel>

              <article className="grid overflow-hidden rounded-3xl border border-[#E8ECE8] bg-white md:grid-cols-2">
                <div className="relative min-h-[280px] overflow-hidden md:min-h-[420px]">
                  <img
                    src={featured.image}
                    alt="Fellowship community"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#052F21]/50 to-transparent" />
                  <span className="absolute left-6 top-6 rounded-full bg-[#F7D94A] px-4 py-2 text-[10px] font-bold tracking-widest text-[#063D29]">
                    FEATURED
                  </span>
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#087443]">
                    <span>{featured.category}</span>
                    <span className="h-1 w-1 rounded-full bg-[#A5AEA7]" />
                    <span>{featured.date}</span>
                  </div>

                  <h2 className="mt-6 font-['Playfair_Display'] text-3xl font-semibold leading-tight sm:text-4xl">
                    {featured.title}
                  </h2>

                  <p className="mt-5 text-sm leading-8 text-[#718078]">
                    {featured.excerpt}
                  </p>

                  <span className="mt-8 inline-flex items-center gap-3 text-sm font-bold text-[#087443]">
                    Read the latest updates
                    <ArrowRight size={17} />
                  </span>
                </div>
              </article>
            </div>
          </section>
        )}

        {/* ANNOUNCEMENTS LIST */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <SectionLabel>THE UPDATE BOARD</SectionLabel>
                <h2 className="font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
                  Latest updates
                </h2>
                <p className="mt-4 text-sm text-[#718078]">
                  News, information and notices from JCCF.
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#89948C]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search updates..."
                  className="w-full rounded-full border border-[#E2E8E2] bg-white py-3.5 pl-11 pr-5 text-sm outline-none transition focus:border-[#087443]"
                />
              </div>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="mb-10 flex gap-2 overflow-x-auto pb-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-5 py-3 text-xs font-bold transition ${
                    activeCategory === category
                      ? "bg-[#087443] text-white"
                      : "border border-[#E2E8E2] bg-white text-[#647168] hover:border-[#087443] hover:text-[#087443]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* CARDS */}
            {loading ? (
              <div className="rounded-3xl border border-[#E8ECE8] bg-white px-6 py-16 text-center" role="status">
                <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#D9E7DC] border-t-[#087443]" />
                <p className="mt-4 text-sm text-[#718078]">Loading fellowship updates…</p>
              </div>
            ) : loadError ? (
              <div className="rounded-3xl border border-[#E8ECE8] bg-white px-6 py-16 text-center" role="alert">
                <Bell size={30} className="mx-auto mb-5 text-[#A5AEA7]" />
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold">Updates unavailable</h3>
                <p className="mt-3 text-sm text-[#718078]">{loadError}</p>
              </div>
            ) : filteredAnnouncements.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAnnouncements
                  .filter((item) => !item.featured)
                  .map((item) => (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-2xl border border-[#E8ECE8] bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#063D29]/5"
                    >
                      <div className="relative h-56 overflow-hidden bg-[#EAF4EE]">
                        <img
                          src={item.image}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-[10px] font-bold tracking-wider text-[#087443]">
                          {item.category.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-7">
                        <div className="flex items-center gap-2 text-xs text-[#89948C]">
                          <CalendarDays size={14} />
                          {item.date}
                        </div>

                        <h3 className="mt-5 font-['Playfair_Display'] text-2xl font-semibold leading-snug">
                          {item.title}
                        </h3>

                        <p className="mt-4 text-sm leading-7 text-[#718078]">
                          {item.excerpt}
                        </p>

                        <div className="mt-7 flex items-center justify-between border-t border-[#EEF0ED] pt-5">
                          <span className="text-xs font-semibold text-[#087443]">
                            JCCF Connect
                          </span>
                          <ArrowUpRight
                            size={18}
                            className="text-[#087443]"
                          />
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#D8E1D9] bg-white px-6 py-16 text-center">
                <Search
                  size={30}
                  className="mx-auto mb-5 text-[#A5AEA7]"
                />
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold">
                  {announcements.length ? "No updates found" : "No updates published yet"}
                </h3>
                <p className="mt-3 text-sm text-[#718078]">
                  {announcements.length
                    ? "Try another search term or select a different category."
                    : "Official fellowship news and notices will appear here when they are published."}
                </p>
                {announcements.length > 0 && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All updates");
                    }}
                    className="mt-6 text-sm font-bold text-[#087443]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* NOTIFICATION CTA */}
        <section className="px-5 pb-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl bg-[#EAF4EE] p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#087443]">
                <Bell size={25} />
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#087443]">
                  STAY IN THE LOOP
                </p>
                <h2 className="mt-2 font-['Playfair_Display'] text-3xl font-semibold">
                  There's more to come.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#647168]">
                  Check back regularly for important fellowship information
                  and upcoming activities.
                </p>
              </div>
            </div>

            <a
              href="/programmes"
              className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-[#087443] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#063D29]"
            >
              Explore programmes
              <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

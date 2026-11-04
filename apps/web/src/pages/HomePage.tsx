
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Heart,
  Music2,
  Sparkles,
  Users,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";
import { apiRequest } from "../api/client";

type ProgrammeRecord = { id: number; title: string; category: string; description: string | null; startDate: string };
type AdministrationRecord = { name: string; description: string | null };
type AnnouncementRecord = { id: number; title: string; summary: string | null; publishedAt: string | null };

const iconByCategory: Record<string, typeof BookOpen> = {
  bible_study: BookOpen,
  worship: Music2,
  prayer: Heart,
  fellowship: Users,
  outreach: Sparkles,
  conference: CalendarDays,
  seminar: CalendarDays,
  other: Users,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-[2px] w-8 rounded-full bg-[#16834B]" />
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#16834B]">
        {children}
      </span>
    </div>
  );
}

function HomePage() {
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [currentAdministration, setCurrentAdministration] = useState<AdministrationRecord | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<{ data: ProgrammeRecord[] }>("/programmes?period=upcoming").catch(() => ({ data: [] })),
      apiRequest<{ data: AnnouncementRecord[] }>("/announcements").catch(() => ({ data: [] })),
      apiRequest<{ data: AdministrationRecord }>("/administrations/current").catch(() => ({ data: null })),
    ]).then(([programmeResponse, announcementResponse, administrationResponse]) => {
      if (!active) return;
      setProgrammes(programmeResponse.data ?? []);
      setAnnouncements(announcementResponse.data ?? []);
      setCurrentAdministration(administrationResponse.data);
    });
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="JCCF Connect | University of Offa Chapter"
        description="Discover Joint Christian Campus Fellowship at the University of Offa: our community, programmes, leadership and fellowship updates."
      />

      {/* Announcement */}
      <SiteBanner />

      {/* Navigation */}
   <Navbar />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#063D29]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=2200&q=85')",
          }}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#042D20]/95 via-[#06442D]/85 to-[#06442D]/45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#042D20]/60 to-transparent" />

        <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:min-h-[700px] lg:grid-cols-[1.2fr_0.8fr] lg:px-10">

          <div className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              <Sparkles size={14} className="text-[#F7D94A]" />
              Joint Christian Campus Fellowship
            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Raising a generation
              <span className="mt-2 block font-serif font-medium italic text-[#F7D94A]">
                rooted in Christ.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              A family of believers at the University of Offa, growing in
              faith, building meaningful relationships and making a
              difference for Christ on campus and beyond.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#173A26] transition hover:bg-white"
              >
                Discover JCCF <ArrowRight size={17} />
              </a>

              <a
                href="#programmes"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/40 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Explore our activities
              </a>
            </div>

            <div className="mt-14 flex flex-wrap gap-x-9 gap-y-5 border-t border-white/20 pt-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Our chapter
                </p>
                <p className="mt-1.5 font-semibold text-white">
                  University of Offa
                </p>
              </div>

              <div className="hidden h-9 w-px bg-white/20 sm:block" />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Current administration
                </p>
                <p className="mt-1.5 font-semibold text-[#F7D94A]">
                  {currentAdministration?.name ?? "Not currently published"}
                </p>
              </div>
            </div>
          </div>

          {/* Official emblem */}
          <div className="hidden items-center justify-center lg:flex">
            <div className="relative flex h-[390px] w-[390px] items-center justify-center rounded-full border border-white/20 bg-white/[0.07] p-10 shadow-2xl backdrop-blur-md">
              <div className="absolute inset-5 rounded-full border border-[#F7D94A]/30" />
              <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl" />
              <img
                src="/images/jccf-logo.png"
                alt="JCCF University of Offa official emblem"
                className="relative z-10 h-full w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#087443] via-[#F7D94A] to-[#E44732]" />
      </section>

      {/* Values strip */}
      <section className="border-b border-[#E8EDE8] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 md:grid-cols-3 lg:px-10">
          {[
            { icon: Heart, title: "Christ at the centre" },
            { icon: Users, title: "One family in fellowship" },
            { icon: Sparkles, title: "Living with purpose" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5EE] text-[#087443]">
                  <Icon size={21} />
                </div>
                <p className="text-sm font-bold text-[#173A26]">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">

          <div className="relative">
            <div className="absolute -left-5 -top-5 h-28 w-28 rounded-tl-[45px] border-l-2 border-t-2 border-[#E44732]/50" />

            <div className="relative overflow-hidden rounded-[28px]">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=85"
                alt="Young people spending time together"
                className="h-[420px] w-full object-cover sm:h-[510px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#063D29]/35 to-transparent" />
            </div>

            <div className="absolute -bottom-7 -right-2 max-w-[250px] rounded-2xl border border-[#E5EEE7] bg-white p-6 shadow-xl sm:-right-7">
              <p className="font-serif text-3xl italic text-[#087443]">
                One family.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                United by faith, strengthened by fellowship.
              </p>
            </div>
          </div>

          <div className="lg:pl-4">
            <SectionLabel>Who we are</SectionLabel>

            <h2 className="text-4xl font-bold leading-tight tracking-tight text-[#173A26] sm:text-5xl">
              More than a fellowship.
              <span className="mt-1 block font-serif font-medium italic text-[#16834B]">
                We are family.
              </span>
            </h2>

            <p className="mt-7 leading-8 text-slate-600">
              The Joint Christian Campus Fellowship, University of Offa
              Chapter, is a community of students united by a shared faith
              in Jesus Christ. We are committed to spiritual growth,
              genuine Christian fellowship and making Christ known in our
              campus community.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              Through the Word, worship, prayer, service and meaningful
              relationships, we encourage one another to live out our
              faith with purpose.
            </p>

            <a
              href="#programmes"
              className="mt-8 inline-flex items-center gap-3 text-sm font-bold text-[#087443] transition hover:text-[#E44732]"
            >
              Discover what we do <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Current administration */}
      <section className="relative overflow-hidden bg-[#063D29] px-5 py-24 text-white sm:px-8 lg:px-10 lg:py-28">
        <div className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-16 h-[350px] w-[350px] rounded-full border border-[#F7D94A]/20" />
        <div className="absolute bottom-0 left-0 h-1 w-32 bg-[#E44732]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionLabel>The current administration</SectionLabel>

            <h2 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
              A season of
              <span className="mt-2 block font-serif font-medium italic text-[#F7D94A]">
                {currentAdministration?.name ?? "A season of service."}
              </span>
            </h2>

            <p className="mt-7 max-w-2xl leading-8 text-white/70">
              {currentAdministration?.description ?? "Details about the current JCCF Unioffa administration will appear here once they are confirmed."}
            </p>

            <a
              href="#leadership"
              className="mt-9 inline-flex items-center gap-3 rounded-full border border-[#F7D94A]/60 px-6 py-3.5 text-sm font-semibold text-[#F7D94A] transition hover:bg-[#F7D94A] hover:text-[#173A26]"
            >
              Meet the leadership <ArrowRight size={17} />
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-8 backdrop-blur-sm sm:p-10">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#087443]/30 blur-2xl" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7D94A] text-[#173A26]">
              <Sparkles size={27} />
            </div>

            <p className="relative mt-9 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
              Tenure identity
            </p>

            <h3 className="relative mt-3 font-serif text-4xl font-semibold leading-tight text-[#F7D94A] sm:text-5xl">
              {currentAdministration?.name ?? "Leadership in service"}
            </h3>

            <div className="my-7 h-px bg-white/15" />

            <p className="text-sm leading-7 text-white/70">
              A chapter in our fellowship's story. A record of service,
              leadership, growth and the people who make this community
              what it is.
            </p>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              JCCF · University of Offa
            </p>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section
        id="programmes"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>Life at JCCF</SectionLabel>

              <h2 className="text-4xl font-bold tracking-tight text-[#173A26] sm:text-5xl">
                Growing together.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                Opportunities to grow spiritually, build community and
                strengthen our walk with Christ.
              </p>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#087443] transition hover:text-[#E44732]"
            >
              Connect with us <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {programmes.length ? programmes.slice(0, 3).map((programme, index) => {
              const Icon = iconByCategory[programme.category] ?? Users;

              return (
                <article
                  key={programme.id}
                  className="group rounded-[24px] border border-[#E7EDE8] bg-white p-8 transition duration-300 hover:-translate-y-2 hover:border-[#B7D9C2] hover:shadow-xl hover:shadow-[#075B35]/[0.07]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5EE] text-[#087443] transition group-hover:bg-[#087443] group-hover:text-white">
                      <Icon size={25} />
                    </div>

                    <span className="text-sm font-bold text-slate-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-9 text-xl font-bold text-[#173A26]">
                    {programme.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    {programme.description}
                  </p>

                  <div className="mt-8 h-[2px] w-10 rounded-full bg-[#E44732] transition-all duration-300 group-hover:w-16" />
                </article>
              );
            }) : <p className="rounded-xl border border-dashed border-[#d6e5d9] bg-white p-8 text-sm text-slate-500 md:col-span-3">No upcoming programmes have been published.</p>}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section
        id="leadership"
        className="scroll-mt-24 bg-[#F0F5F1] px-5 py-24 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

          <div>
            <SectionLabel>Serving with purpose</SectionLabel>

            <h2 className="text-4xl font-bold leading-tight text-[#173A26] sm:text-5xl">
              Leadership is
              <span className="mt-1 block font-serif font-medium italic text-[#16834B]">
                a call to serve.
              </span>
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-slate-600">
              Behind every thriving fellowship is a team of people
              committed to serving God and supporting the community.
              {currentAdministration ? `Get to know the people serving in the ${currentAdministration.name} administration.` : "Meet the people serving the fellowship and explore past administrations."}
            </p>

            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#087443] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#063D29]"
            >
              Explore our fellowship <ArrowRight size={17} />
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-[#063D29]">
            <img
              src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1100&q=85"
              alt="A group of young people together"
              className="h-[390px] w-full object-cover opacity-75 sm:h-[460px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#063D29] via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 sm:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7D94A]">
                {currentAdministration?.name ?? "JCCF Leadership"}
              </p>

              <h3 className="mt-3 text-3xl font-bold text-white">
                One vision. One family.
              </h3>

              <p className="mt-2 text-sm text-white/70">
                Serving, leading and growing together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Updates */}
      <section
        id="updates"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <SectionLabel>Stay connected</SectionLabel>

            <h2 className="text-4xl font-bold tracking-tight text-[#173A26] sm:text-5xl">
              What's happening at JCCF?
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
              Stay informed about fellowship news, upcoming gatherings
              and moments that bring our community together.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <article className="rounded-[24px] border border-[#E7EDE8] bg-white p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5EE] text-[#087443]">
                <CalendarDays size={23} />
              </div>

              <h3 className="mt-7 text-2xl font-bold text-[#173A26]">
                Upcoming programmes
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">{programmes[0] ? `${programmes[0].title} · ${programmes[0].startDate}` : "No upcoming programmes are published yet."}</p>
              <a href="/programmes" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#087443]">View programmes <ArrowRight size={16} /></a>
            </article>

            <article className="rounded-[24px] bg-[#063D29] p-8 text-white sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#F7D94A]">
                <Sparkles size={23} />
              </div>

              <h3 className="mt-7 text-2xl font-bold">
                Fellowship announcements
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/65">{announcements[0]?.summary || announcements[0]?.title || "No announcements have been published yet."}</p>
              <a href="/announcements" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#F7D94A]">View announcements <ArrowRight size={16} /></a>
            </article>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-5 pb-24 sm:px-8 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#EAF5EE] px-7 py-16 text-center sm:px-12 sm:py-20">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[#087443]/10" />
          <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full border border-[#E44732]/15" />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#087443]">
              You belong here
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-[#173A26] sm:text-5xl">
              Your faith journey was never meant to be walked alone.
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">
              Come grow, serve, worship and build meaningful relationships
              with the JCCF Unioffa family.
            </p>

            <a
              href="#contact"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#087443] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#063D29]"
            >
              Connect with JCCF <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
   <Footer />
    </main>
  );
}

export default HomePage;

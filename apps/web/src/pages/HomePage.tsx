import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock,
  Heart,
  Mail,
  MapPin,
  Megaphone,
  Music2,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";
import { apiRequest } from "../api/client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type ProgrammeRecord = {
  id: number;
  title: string;
  category: string;
  description: string | null;
  startDate: string;
};
type AdministrationRecord = { name: string; description: string | null };
type AnnouncementRecord = {
  id: number;
  title: string;
  summary: string | null;
  publishedAt: string | null;
};

/* -------------------------------------------------------------------------- */
/*  EDIT ME: fellowship details                                                */
/*  Anything left empty ("") is simply hidden on the page, so you never        */
/*  show wrong information. Fill these in when they are confirmed.             */
/* -------------------------------------------------------------------------- */

const contactInfo = {
  venue: "University of Offa campus, Offa, Kwara State",
  email: "",
  phone: "",
};

const weeklyRhythm = [
  {
    icon: BookOpen,
    title: "Bible study",
    cadence: "Every week",
    time: "", // e.g. "Tuesdays, 5:00 PM"
    description:
      "An open, discussion-led study of the Scriptures where every question is welcome and every voice is heard.",
  },
  {
    icon: Music2,
    title: "Worship and prayer",
    cadence: "Every week",
    time: "", // e.g. "Fridays, 5:30 PM"
    description:
      "A gathering to worship together, pray for one another and for our campus, and be refreshed in God's presence.",
  },
  {
    icon: Users,
    title: "Fellowship and outreach",
    cadence: "Through the semester",
    time: "",
    description:
      "Retreats, socials, evangelism and service projects that turn Sunday-to-Sunday faith into everyday friendship.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Static content                                                             */
/* -------------------------------------------------------------------------- */

const serif = "font-['Playfair_Display',Georgia,serif]";

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

const labelByCategory: Record<string, string> = {
  bible_study: "Bible study",
  worship: "Worship",
  prayer: "Prayer",
  fellowship: "Fellowship",
  outreach: "Outreach",
  conference: "Conference",
  seminar: "Seminar",
  other: "Programme",
};

const pillars = [
  {
    icon: BookOpen,
    title: "Rooted in the Word",
    text: "Scripture shapes how we think, decide and live.",
  },
  {
    icon: Users,
    title: "One family in fellowship",
    text: "Friendships that stay with you long after graduation.",
  },
  {
    icon: Sparkles,
    title: "Living with purpose",
    text: "Using our gifts to serve the campus and beyond.",
  },
];

const joinSteps = [
  {
    title: "Come as you are",
    text: "Join any gathering. You do not need an invitation, a church background or any preparation.",
  },
  {
    title: "Meet the family",
    text: "Introduce yourself, share a meal or a conversation, and find where you naturally fit.",
  },
  {
    title: "Grow and serve",
    text: "Join a study, a prayer group or a service unit, and begin using your gifts for others.",
  },
];

const faqs = [
  {
    q: "Who can join JCCF?",
    a: "Every student of the University of Offa is welcome, whatever your level, course or church background. If you want to grow in Christ and be part of a community, there is a place for you.",
  },
  {
    q: "Do I have to belong to a particular denomination?",
    a: "No. JCCF is a joint fellowship. Students from different Christian traditions worship, study and serve together as one body.",
  },
  {
    q: "I am new to faith. Will I feel out of place?",
    a: "Not at all. Our gatherings are made for people at every stage of the journey, including those who are still asking questions.",
  },
  {
    q: "How do I find out what is happening and when?",
    a: "Upcoming programmes and fellowship announcements are published on this website. Check the Programmes and Announcements pages for the latest.",
  },
  {
    q: "Can I serve or take part in leadership?",
    a: "Yes. Fellowship life depends on members who give their time and gifts. Explore the leadership page to see how the fellowship is organised, and speak to any executive member about serving.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SectionLabel({
  children,
  light = false,
  center = false,
}: {
  children: React.ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={`mb-5 flex items-center gap-3 ${center ? "justify-center" : ""}`}
    >
      <span
        className={`h-[2px] w-8 rounded-full ${light ? "bg-[#F7D94A]" : "bg-[#16834B]"}`}
      />
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? "text-[#F7D94A]" : "text-[#16834B]"}`}
      >
        {children}
      </span>
    </div>
  );
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D94A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#063D29]";

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

function HomePage() {
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [currentAdministration, setCurrentAdministration] =
    useState<AdministrationRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<{ data: ProgrammeRecord[] }>("/programmes?period=upcoming").catch(
        () => ({ data: [] as ProgrammeRecord[] }),
      ),
      apiRequest<{ data: AnnouncementRecord[] }>("/announcements").catch(() => ({
        data: [] as AnnouncementRecord[],
      })),
      apiRequest<{ data: AdministrationRecord }>("/administrations/current").catch(
        () => ({ data: null }),
      ),
    ]).then(([programmeResponse, announcementResponse, administrationResponse]) => {
      if (!active) return;
      setProgrammes(programmeResponse.data ?? []);
      setAnnouncements(announcementResponse.data ?? []);
      setCurrentAdministration(administrationResponse.data);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const administrationName = currentAdministration?.name;

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="JCCF Connect | University of Offa Chapter"
        description="Discover Joint Christian Campus Fellowship at the University of Offa: our community, programmes, leadership and fellowship updates."
      />

      <SiteBanner />
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden bg-[#063D29]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=2200&q=85')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#042D20]/95 via-[#06442D]/88 to-[#06442D]/50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#042D20]/70 to-transparent" />

        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:min-h-[740px] lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              <Sparkles size={14} className="text-[#F7D94A]" />
              Joint Christian Campus Fellowship
            </div>

            <h1
              className={`${serif} text-5xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl`}
            >
              Raising a generation{" "}
              <span className="italic text-[#F7D94A]">rooted in Christ.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              A family of believers at the University of Offa, growing in faith,
              building lasting friendships and making a difference for Christ on
              campus and beyond.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#about"
                className={`inline-flex items-center justify-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#173A26] transition hover:bg-white ${focusRing}`}
              >
                Discover JCCF <ArrowRight size={17} />
              </a>
              <a
                href="#programmes"
                className={`inline-flex items-center justify-center gap-3 rounded-full border border-white/40 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 ${focusRing}`}
              >
                See what is coming up
              </a>
            </div>

            <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-6 border-t border-white/20 pt-7">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Our chapter
                </dt>
                <dd className="mt-1.5 font-semibold text-white">
                  University of Offa
                </dd>
              </div>
              <div className="hidden w-px bg-white/20 sm:block" />
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Current administration
                </dt>
                <dd className="mt-1.5 font-semibold text-[#F7D94A]">
                  {administrationName ?? "Not currently published"}
                </dd>
              </div>
              <div className="hidden w-px bg-white/20 sm:block" />
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Who can join
                </dt>
                <dd className="mt-1.5 font-semibold text-white">
                  Every UNIOFFA student
                </dd>
              </div>
            </dl>
          </div>

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

      {/* ------------------------------------------------------------------ */}
      {/* Pillars                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-[#E8EDE8] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3 lg:px-10">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF5EE] text-[#087443]">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-bold text-[#173A26]">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* About                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="about"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="relative">
            <div className="absolute -left-5 -top-5 h-28 w-28 rounded-tl-[45px] border-l-2 border-t-2 border-[#E44732]/50" />
            <div className="relative overflow-hidden rounded-[28px] shadow-2xl shadow-[#063D29]/10">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=85"
                alt="Young people spending time together"
                loading="lazy"
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#063D29]/35 to-transparent" />
            </div>
            <div className="absolute -bottom-7 -right-2 max-w-[260px] rounded-2xl border border-[#E5EEE7] bg-white p-6 shadow-xl sm:-right-7">
              <p className={`${serif} text-3xl italic text-[#087443]`}>
                One family.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                United by faith, strengthened by fellowship.
              </p>
            </div>
          </div>

          <div className="lg:pl-4">
            <SectionLabel>Who we are</SectionLabel>

            <h2
              className={`${serif} text-4xl font-semibold leading-tight tracking-tight text-[#173A26] sm:text-5xl`}
            >
              More than a fellowship.{" "}
              <span className="italic text-[#16834B]">We are family.</span>
            </h2>

            <p className="mt-7 max-w-xl leading-8 text-slate-600">
              The Joint Christian Campus Fellowship, University of Offa Chapter,
              is a community of students united by a shared faith in Jesus
              Christ. We are committed to spiritual growth, genuine Christian
              fellowship and making Christ known across our campus.
            </p>
            <p className="mt-4 max-w-xl leading-8 text-slate-600">
              Through the Word, worship, prayer, service and honest
              relationships, we encourage one another to live out our faith with
              purpose, in lecture halls, hostels and everywhere in between.
            </p>

            <ul className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              {[
                "Open to all students",
                "Many church backgrounds, one body",
                "Study, worship and prayer",
                "Service and outreach",
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm font-semibold text-[#173A26]"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#E44732]" />
                  {point}
                </li>
              ))}
            </ul>

            <a
              href="/about"
              className="mt-9 inline-flex items-center gap-3 text-sm font-bold text-[#087443] transition hover:text-[#E44732]"
            >
              Read our full story <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Weekly rhythm                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="rhythm"
        className="scroll-mt-24 bg-white px-5 py-24 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <SectionLabel>The rhythm of fellowship life</SectionLabel>
            <h2
              className={`${serif} text-4xl font-semibold tracking-tight text-[#173A26] sm:text-5xl`}
            >
              What a week with JCCF looks like.
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              Three simple habits keep our community healthy: studying the Word,
              gathering to worship and pray, and doing life together.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {weeklyRhythm.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="flex flex-col rounded-[24px] border border-[#E7EDE8] bg-[#FAFBF9] p-8"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#063D29] text-[#F7D94A]">
                    <Icon size={25} />
                  </div>
                  <h3 className="mt-8 text-xl font-bold text-[#173A26]">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                    {item.description}
                  </p>
                  <div className="mt-7 flex items-center gap-2 border-t border-[#E7EDE8] pt-5 text-sm font-semibold text-[#087443]">
                    <Clock size={16} />
                    {item.time || item.cadence}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Current administration                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-[#063D29] px-5 py-24 text-white sm:px-8 lg:px-10 lg:py-28">
        <div className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-16 h-[350px] w-[350px] rounded-full border border-[#F7D94A]/20" />
        <div className="absolute bottom-0 left-0 h-1 w-32 bg-[#E44732]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionLabel light>The current administration</SectionLabel>

            <h2
              className={`${serif} mt-6 text-4xl font-semibold leading-tight sm:text-6xl`}
            >
              A season of{" "}
              <span className="italic text-[#F7D94A]">
                {administrationName ?? "service."}
              </span>
            </h2>

            <p className="mt-7 max-w-2xl leading-8 text-white/70">
              {currentAdministration?.description ??
                "Details about the current JCCF UNIOFFA administration will appear here once they are confirmed."}
            </p>

            <a
              href="/leadership"
              className={`mt-9 inline-flex items-center gap-3 rounded-full border border-[#F7D94A]/60 px-6 py-3.5 text-sm font-semibold text-[#F7D94A] transition hover:bg-[#F7D94A] hover:text-[#173A26] ${focusRing}`}
            >
              Meet the leadership <ArrowRight size={17} />
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-8 backdrop-blur-sm sm:p-10">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#087443]/30 blur-2xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7D94A] text-[#173A26]">
              <Sparkles size={27} />
            </div>
            <p className="relative mt-9 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Tenure identity
            </p>
            <h3
              className={`${serif} relative mt-3 text-4xl font-semibold leading-tight text-[#F7D94A] sm:text-5xl`}
            >
              {administrationName ?? "Leadership in service"}
            </h3>
            <div className="my-7 h-px bg-white/15" />
            <p className="text-sm leading-7 text-white/70">
              Every administration adds a chapter to our fellowship's story: a
              record of service, leadership, growth and the people who make this
              community what it is.
            </p>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              JCCF · University of Offa
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Programmes                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="programmes"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>Life at JCCF</SectionLabel>
              <h2
                className={`${serif} text-4xl font-semibold tracking-tight text-[#173A26] sm:text-5xl`}
              >
                Growing together.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                Our next gatherings, from Bible studies to conferences. Come to
                one, bring a friend.
              </p>
            </div>

            <a
              href="/programmes"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#087443] transition hover:text-[#E44732]"
            >
              All programmes <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {!loaded ? (
              [0, 1, 2].map((n) => (
                <div
                  key={n}
                  className="h-72 animate-pulse rounded-[24px] border border-[#E7EDE8] bg-white"
                  aria-hidden="true"
                />
              ))
            ) : programmes.length ? (
              programmes.slice(0, 3).map((programme) => {
                const Icon = iconByCategory[programme.category] ?? Users;
                return (
                  <article
                    key={programme.id}
                    className="group flex flex-col rounded-[24px] border border-[#E7EDE8] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-[#B7D9C2] hover:shadow-xl hover:shadow-[#075B35]/[0.07]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5EE] text-[#087443] transition group-hover:bg-[#087443] group-hover:text-white">
                        <Icon size={25} />
                      </div>
                      <span className="rounded-full bg-[#F0F5F1] px-3 py-1 text-xs font-semibold text-[#087443]">
                        {labelByCategory[programme.category] ?? "Programme"}
                      </span>
                    </div>

                    <h3 className="mt-8 text-xl font-bold text-[#173A26]">
                      {programme.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                      {programme.description ||
                        "More details will be shared closer to the date."}
                    </p>

                    <div className="mt-7 flex items-center gap-2 border-t border-[#E7EDE8] pt-5 text-sm font-semibold text-[#173A26]">
                      <CalendarDays size={16} className="text-[#E44732]" />
                      {formatDate(programme.startDate)}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-[#d6e5d9] bg-white p-8 text-sm leading-7 text-slate-500 md:col-span-3">
                No upcoming programmes have been published yet. Check back soon,
                or see the announcements below for the latest news.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Scripture band                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-[#EAF5EE] px-5 py-20 sm:px-8 lg:px-10">
        <figure className="mx-auto max-w-3xl text-center">
          <blockquote
            className={`${serif} text-3xl font-medium italic leading-snug text-[#173A26] sm:text-4xl`}
          >
            “That they all may be one.”
          </blockquote>
          <figcaption className="mt-5 text-sm font-semibold text-[#087443]">
            John 17:21
          </figcaption>
        </figure>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Leadership                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="leadership"
        className="scroll-mt-24 bg-[#F0F5F1] px-5 py-24 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel>Serving with purpose</SectionLabel>

            <h2
              className={`${serif} text-4xl font-semibold leading-tight text-[#173A26] sm:text-5xl`}
            >
              Leadership is{" "}
              <span className="italic text-[#16834B]">a call to serve.</span>
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-slate-600">
              Behind every thriving fellowship is a team of people committed to
              serving God and supporting the community.{" "}
              {administrationName
                ? `Get to know the people serving in the ${administrationName} administration.`
                : "Meet the people serving the fellowship and explore past administrations."}
            </p>

            <a
              href="/leadership"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#087443] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#063D29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
            >
              Explore the leadership <ArrowRight size={17} />
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-[#063D29]">
            <img
              src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1100&q=85"
              alt="A group of young people together"
              loading="lazy"
              className="h-[390px] w-full object-cover opacity-75 sm:h-[460px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#063D29] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 sm:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F7D94A]">
                {administrationName ?? "JCCF Leadership"}
              </p>
              <h3 className={`${serif} mt-3 text-3xl font-semibold text-white`}>
                One vision. One family.
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Serving, leading and growing together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Updates                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="updates"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <SectionLabel center>Stay connected</SectionLabel>
            <h2
              className={`${serif} text-4xl font-semibold tracking-tight text-[#173A26] sm:text-5xl`}
            >
              What's happening at JCCF?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
              Fellowship news, upcoming gatherings and moments that bring our
              community together.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* Upcoming programmes */}
            <article className="rounded-[24px] border border-[#E7EDE8] bg-white p-8 sm:p-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5EE] text-[#087443]">
                  <CalendarDays size={23} />
                </div>
                <h3 className="text-2xl font-bold text-[#173A26]">
                  Upcoming programmes
                </h3>
              </div>

              {programmes.length ? (
                <ul className="mt-7 divide-y divide-[#EEF2EE]">
                  {programmes.slice(0, 3).map((programme) => (
                    <li key={programme.id} className="py-4 first:pt-0">
                      <p className="font-semibold text-[#173A26]">
                        {programme.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(programme.startDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-7 text-sm leading-7 text-slate-500">
                  No upcoming programmes are published yet.
                </p>
              )}

              <a
                href="/programmes"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#087443] transition hover:text-[#E44732]"
              >
                View programmes <ArrowRight size={16} />
              </a>
            </article>

            {/* Announcements */}
            <article className="rounded-[24px] bg-[#063D29] p-8 text-white sm:p-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#F7D94A]">
                  <Megaphone size={23} />
                </div>
                <h3 className="text-2xl font-bold">Fellowship announcements</h3>
              </div>

              {announcements.length ? (
                <ul className="mt-7 divide-y divide-white/10">
                  {announcements.slice(0, 3).map((item) => (
                    <li key={item.id} className="py-4 first:pt-0">
                      <p className="font-semibold">{item.title}</p>
                      {item.summary && (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/65">
                          {item.summary}
                        </p>
                      )}
                      {item.publishedAt && (
                        <p className="mt-1 text-xs text-[#F7D94A]/80">
                          {formatDate(item.publishedAt)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-7 text-sm leading-7 text-white/65">
                  No announcements have been published yet.
                </p>
              )}

              <a
                href="/announcements"
                className={`mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#F7D94A] ${focusRing}`}
              >
                View announcements <ArrowRight size={16} />
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How to join                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="join"
        className="scroll-mt-24 bg-white px-5 py-24 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel>New here?</SectionLabel>
            <h2
              className={`${serif} text-4xl font-semibold leading-tight tracking-tight text-[#173A26] sm:text-5xl`}
            >
              Getting started is simple.
            </h2>
            <p className="mt-5 max-w-md leading-8 text-slate-600">
              There is no application and no entry requirement. If you are a
              student of the University of Offa, you already belong in the room.
            </p>
          </div>

          <ol className="space-y-5">
            {joinSteps.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-6 rounded-[24px] border border-[#E7EDE8] bg-[#FAFBF9] p-7"
              >
                <span
                  className={`${serif} flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#063D29] text-xl font-semibold text-[#F7D94A]`}
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#173A26]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7 text-slate-500">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="faq"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionLabel center>Questions</SectionLabel>
            <h2
              className={`${serif} text-4xl font-semibold tracking-tight text-[#173A26] sm:text-5xl`}
            >
              Things people often ask.
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-[#E7EDE8] bg-white px-6 py-5 open:border-[#B7D9C2] open:shadow-lg open:shadow-[#075B35]/[0.05]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#173A26] focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    size={20}
                    className="shrink-0 text-[#087443] transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Contact + call to action                                            */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="contact"
        className="scroll-mt-24 px-5 pb-24 sm:px-8 lg:px-10"
      >
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#063D29] px-7 py-16 text-white sm:px-12 sm:py-20">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full border border-[#F7D94A]/20" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <SectionLabel light>You belong here</SectionLabel>
              <h2
                className={`${serif} max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl`}
              >
                Your faith journey was never meant to be{" "}
                <span className="italic text-[#F7D94A]">walked alone.</span>
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-white/70">
                Come grow, serve, worship and build meaningful relationships with
                the JCCF UNIOFFA family.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/programmes"
                  className={`inline-flex items-center justify-center gap-3 rounded-full bg-[#F7D94A] px-8 py-4 text-sm font-bold text-[#173A26] transition hover:bg-white ${focusRing}`}
                >
                  Find a gathering <ArrowRight size={17} />
                </a>
                <a
                  href="/about"
                  className={`inline-flex items-center justify-center gap-3 rounded-full border border-white/40 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 ${focusRing}`}
                >
                  Learn about us
                </a>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/[0.06] p-8 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-[#F7D94A]">Find us</h3>
              <ul className="mt-6 space-y-5 text-sm">
                {contactInfo.venue && (
                  <li className="flex items-start gap-3 text-white/80">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-[#F7D94A]" />
                    {contactInfo.venue}
                  </li>
                )}
                {contactInfo.email && (
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-[#F7D94A]" />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-white/80 underline-offset-4 hover:underline"
                    >
                      {contactInfo.email}
                    </a>
                  </li>
                )}
                {contactInfo.phone && (
                  <li className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-[#F7D94A]" />
                    <a
                      href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
                      className="text-white/80 underline-offset-4 hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </li>
                )}
              </ul>
              <p className="mt-7 border-t border-white/10 pt-5 text-xs leading-6 text-white/50">
                Programme dates and announcements are always posted on this
                website first.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default HomePage;
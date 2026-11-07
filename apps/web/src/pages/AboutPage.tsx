import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Handshake,
  Heart,
  Lightbulb,
  Music2,
  Sparkles,
  Target,
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

type AdministrationRecord = {
  name: string;
  description?: string | null;
};

/* -------------------------------------------------------------------------- */
/*  Content                                                                    */
/* -------------------------------------------------------------------------- */

const serif = "font-['Playfair_Display',Georgia,serif]";

const values = [
  {
    icon: BookOpen,
    title: "The Word",
    description:
      "We value the study and application of God's Word as the foundation for Christian living and spiritual growth.",
  },
  {
    icon: Heart,
    title: "Love",
    description:
      "We seek to build a welcoming community where genuine love, care and encouragement are shared.",
  },
  {
    icon: Users,
    title: "Fellowship",
    description:
      "We believe in growing together, supporting one another and building meaningful Christian relationships.",
  },
  {
    icon: Lightbulb,
    title: "Purpose",
    description:
      "We encourage students to discover their God-given purpose and live out their faith with intentionality.",
  },
];

const practices = [
  {
    icon: BookOpen,
    title: "Bible study",
    text: "Discussion-led studies that help members understand Scripture and apply it to student life, relationships, studies and future careers.",
  },
  {
    icon: Music2,
    title: "Worship and prayer",
    text: "Regular gatherings to worship, intercede for one another and for our campus, and grow a personal prayer life.",
  },
  {
    icon: Handshake,
    title: "Fellowship",
    text: "Socials, retreats and small moments of friendship that make a large campus feel like a family.",
  },
  {
    icon: Sparkles,
    title: "Outreach and service",
    text: "Practical ways to show Christ's love to our fellow students and the wider community around the University of Offa.",
  },
];

const whoFor = [
  "Students at every level and from every course at the University of Offa.",
  "Believers from different church backgrounds who want to worship and serve together.",
  "Newcomers and those still asking questions about faith.",
  "Members ready to serve, lead and use their gifts for others.",
];

const archiveNotes = [
  {
    title: "Programmes",
    text: "Upcoming gatherings, conferences and seminars, published as they are confirmed.",
    href: "/programmes",
  },
  {
    title: "Announcements",
    text: "Official fellowship news and notices, so no one misses what matters.",
    href: "/announcements",
  },
  {
    title: "Leadership archive",
    text: "The people who have served across administrations, kept as part of our shared story.",
    href: "/leadership",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className={`h-[2px] w-8 ${light ? "bg-[#F7D94A]" : "bg-[#087443]"}`}
      />
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? "text-[#F7D94A]" : "text-[#087443]"}`}
      >
        {children}
      </span>
    </div>
  );
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D94A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#052F21]";

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  const [administration, setAdministration] =
    useState<AdministrationRecord | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<{ data: AdministrationRecord }>("/administrations/current")
      .then((response) => {
        if (active) setAdministration(response.data ?? null);
      })
      .catch((error: unknown) => {
        console.warn("Unable to load current administration.", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="About JCCF | University of Offa"
        description="Learn about the Joint Christian Campus Fellowship community at the University of Offa and the values that shape fellowship life."
      />
      <SiteBanner />
      <Navbar />

      <main>
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                              */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-[#052F21] px-5 py-24 text-white sm:py-32">
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
                About us
              </span>
            </nav>

            <div className="max-w-3xl">
              <SectionLabel light>Who we are</SectionLabel>

              <h1
                className={`${serif} text-5xl font-semibold leading-[1.12] sm:text-6xl lg:text-7xl`}
              >
                One fellowship.
                <br />
                <span className="italic text-[#F7D94A]">
                  One family in Christ.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Discover the heart behind Joint Christian Campus Fellowship,
                University of Offa Chapter: a community committed to
                fellowship, spiritual growth and living out the Christian faith
                on campus.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/programmes"
                  className={`inline-flex items-center justify-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#063D29] transition hover:bg-white ${focusRing}`}
                >
                  Join a gathering <ArrowRight size={17} />
                </a>
                <a
                  href="/leadership"
                  className={`inline-flex items-center justify-center gap-3 rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10 ${focusRing}`}
                >
                  Meet the leadership
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Introduction                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2 md:items-center md:gap-20">
            <div>
              <SectionLabel>About JCCF</SectionLabel>

              <h2
                className={`${serif} text-4xl font-semibold leading-tight sm:text-5xl`}
              >
                A place to grow in faith and{" "}
                <span className="italic text-[#087443]">walk together.</span>
              </h2>

              <div className="mt-7 max-w-xl space-y-5 text-sm leading-8 text-[#647168] sm:text-base">
                <p>
                  Joint Christian Campus Fellowship (JCCF), University of Offa
                  Chapter, is a Christian fellowship community within the
                  university. Students from different church backgrounds meet
                  here as one body to study the Word, worship, pray and serve.
                </p>
                <p>
                  This platform keeps members connected, gives access to
                  fellowship activities and preserves the records and memories
                  of the people who have served.
                </p>
                <p>
                  Across different administrations and generations of students,
                  the fellowship's identity remains bigger than any single
                  tenure. We are one community, united by our faith in Christ.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-2xl bg-[#F7D94A]/40" />
              <img
                src="/images/jccf-logo.png"
                alt="Joint Christian Campus Fellowship logo"
                className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-[#063D29] object-contain p-12 shadow-2xl shadow-[#063D29]/15"
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Scripture band                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-[#EAF4EE] px-5 py-16 sm:py-20">
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

        {/* ---------------------------------------------------------------- */}
        {/* Vision and mission                                                */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-[#F0F5F0] px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionLabel>Our direction</SectionLabel>

            <h2
              className={`${serif} mb-12 max-w-2xl text-4xl font-semibold sm:text-5xl`}
            >
              Guided by faith.{" "}
              <span className="italic text-[#087443]">Driven by purpose.</span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-3xl bg-[#063D29] p-8 text-white sm:p-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#F7D94A]">
                  <Target size={27} />
                </div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7D94A]">
                  Our vision
                </p>
                <h3 className={`${serif} text-3xl font-semibold`}>
                  A generation grounded in Christ.
                </h3>
                <p className="mt-5 text-sm leading-8 text-white/70">
                  To nurture a generation of students whose lives reflect their
                  faith in Christ, demonstrate godly character and positively
                  influence their world.
                </p>
              </article>

              <article className="rounded-3xl border border-[#E2E9E2] bg-white p-8 sm:p-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4EE] text-[#087443]">
                  <Heart size={27} />
                </div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#087443]">
                  Our mission
                </p>
                <h3 className={`${serif} text-3xl font-semibold`}>
                  Growing together in faith.
                </h3>
                <p className="mt-5 text-sm leading-8 text-[#647168]">
                  To provide a Christ-centred community where students can grow
                  spiritually, study God's Word, build meaningful relationships
                  and express their faith through service.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Values                                                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <div className="flex justify-center">
                <SectionLabel>What shapes us</SectionLabel>
              </div>
              <h2 className={`${serif} text-4xl font-semibold sm:text-5xl`}>
                The values we hold close.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#647168]">
                The principles behind how we grow, serve and relate with one
                another as a fellowship.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <article
                    key={value.title}
                    className="rounded-2xl border border-[#E8ECE8] bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#075B35]/[0.06]"
                  >
                    <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF4EE] text-[#087443]">
                      <Icon size={23} />
                    </div>
                    <h3 className={`${serif} text-2xl font-semibold`}>
                      {value.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#718078]">
                      {value.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* How we live it out                                                */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-white px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionLabel>What we do</SectionLabel>
              <h2
                className={`${serif} text-4xl font-semibold leading-tight sm:text-5xl`}
              >
                Faith that shows up in{" "}
                <span className="italic text-[#087443]">everyday life.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-8 text-[#647168] sm:text-base">
                Our values are not slogans. They take shape in the regular
                rhythms of fellowship life.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {practices.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-[#E8ECE8] bg-[#FAFBF9] p-7"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#063D29] text-[#F7D94A]">
                      <Icon size={21} />
                    </div>
                    <h3 className="text-lg font-bold text-[#173A26]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#718078]">
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Who it is for                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2 md:gap-20">
            <div className="rounded-3xl bg-[#EAF4EE] p-8 sm:p-12">
              <p
                className={`${serif} text-3xl font-medium italic leading-snug text-[#173A26] sm:text-4xl`}
              >
                You do not have to have it all figured out to belong here.
              </p>
              <div className="mt-8 h-[2px] w-12 rounded-full bg-[#E44732]" />
            </div>

            <div>
              <SectionLabel>Who it is for</SectionLabel>
              <h2
                className={`${serif} text-4xl font-semibold leading-tight sm:text-5xl`}
              >
                There is a place for you.
              </h2>
              <ul className="mt-7 space-y-4">
                {whoFor.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm leading-7 text-[#647168] sm:text-base"
                  >
                    <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#E44732]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Leadership                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-5 pb-20 sm:pb-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#052F21]">
            <div className="grid md:grid-cols-[1fr_0.8fr]">
              <div className="p-8 text-white sm:p-12 lg:p-16">
                <SectionLabel light>Our leadership</SectionLabel>

                <h2
                  className={`${serif} text-4xl font-semibold sm:text-5xl`}
                >
                  {administration?.name ?? "A legacy of service."}
                </h2>

                <p className="mt-6 max-w-xl text-sm leading-8 text-white/70">
                  {administration?.description ??
                    "Every administration contributes to the story of JCCF University of Offa. Explore the leadership archive to learn about those serving our fellowship."}
                </p>

                <a
                  href="/leadership"
                  className={`mt-8 inline-flex items-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#063D29] transition hover:bg-white ${focusRing}`}
                >
                  Meet the leadership
                  <ArrowRight size={17} />
                </a>
              </div>

              <div className="flex min-h-[280px] items-center justify-center bg-[#087443] p-10">
                <div className="text-center">
                  <img
                    src="/images/jccf-logo.png"
                    alt="JCCF emblem"
                    className="mx-auto h-36 w-36 rounded-full bg-white object-contain p-5"
                  />
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    JCCF · UNIOFFA
                  </p>
                  <p
                    className={`${serif} mt-2 text-2xl font-semibold text-white`}
                  >
                    {administration?.name ?? "Growing together in Christ"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Where to find things                                              */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-[#F0F5F0] px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <SectionLabel>Stay connected</SectionLabel>
              <h2
                className={`${serif} text-4xl font-semibold sm:text-5xl`}
              >
                Where to find what you need.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {archiveNotes.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-[#E2E9E2] bg-white p-7 transition hover:-translate-y-1 hover:border-[#B7D9C2] hover:shadow-lg hover:shadow-[#075B35]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]"
                >
                  <h3 className="text-lg font-bold text-[#173A26]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#718078]">
                    {item.text}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#087443] transition group-hover:text-[#E44732]">
                    Open <ArrowRight size={16} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
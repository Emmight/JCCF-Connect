
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Heart,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";
import { apiRequest } from "../api/client";

type AdministrationRecord = {
  name: string;
  description?: string | null;
};

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

export default function AboutPage() {
  const [administration, setAdministration] = useState<AdministrationRecord | null>(null);

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
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#052F21] px-5 py-20 text-white sm:py-28">
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-5 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex items-center gap-2 text-sm text-white/60">
              <a href="/" className="transition hover:text-white">
                Home
              </a>
              <span>/</span>
              <span className="text-white">About us</span>
            </div>

            <div className="max-w-3xl">
              <SectionLabel>WHO WE ARE</SectionLabel>

              <h1 className="font-['Playfair_Display'] text-5xl font-semibold leading-[1.12] sm:text-6xl lg:text-7xl">
                One fellowship.
                <br />
                <span className="italic text-[#F7D94A]">
                  One family in Christ.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Discover the heart behind Joint Christian Campus Fellowship,
                University of Offa Chapter — a community committed to
                fellowship, spiritual growth and living out the Christian
                faith.
              </p>
            </div>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
            <div>
              <SectionLabel>ABOUT JCCF</SectionLabel>

              <h2 className="font-['Playfair_Display'] text-4xl font-semibold leading-tight sm:text-5xl">
                A place to grow in faith and{" "}
                <span className="italic text-[#087443]">
                  walk together.
                </span>
              </h2>

              <div className="mt-7 space-y-5 text-sm leading-8 text-[#647168] sm:text-base">
                <p>
                  Joint Christian Campus Fellowship (JCCF), University of
                  Offa Chapter, is a Christian fellowship community within
                  the university.
                </p>

                <p>
                  Our platform is designed to keep members connected,
                  provide access to fellowship activities and preserve the
                  records and memories of the people who have served.
                </p>

                <p>
                  Across different administrations and generations of
                  students, the fellowship's identity remains bigger than
                  any single tenure. We are one community, united by our
                  faith in Christ.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-2xl bg-[#F7D94A]/40" />

              <img
                src="/images/jccf-logo.png"
                alt="Joint Christian Campus Fellowship logo"
                className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-[#063D29] object-contain p-12 shadow-2xl shadow-[#063D29]/10"
              />
            </div>
          </div>
        </section>

        {/* VISION AND MISSION */}
        <section className="bg-[#F0F5F0] px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionLabel>OUR DIRECTION</SectionLabel>

            <h2 className="mb-12 max-w-2xl font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
              Guided by faith.
              <span className="italic text-[#087443]"> Driven by purpose.</span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-3xl bg-[#063D29] p-8 text-white sm:p-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#F7D94A]">
                  <Target size={27} />
                </div>

                <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#F7D94A]">
                  OUR VISION
                </p>

                <h3 className="font-['Playfair_Display'] text-3xl font-semibold">
                  A generation grounded in Christ.
                </h3>

                <p className="mt-5 text-sm leading-8 text-white/70">
                  To nurture a generation of students whose lives reflect
                  their faith in Christ, demonstrate godly character and
                  positively influence their world.
                </p>
              </article>

              <article className="rounded-3xl border border-[#E2E9E2] bg-white p-8 sm:p-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4EE] text-[#087443]">
                  <Heart size={27} />
                </div>

                <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#087443]">
                  OUR MISSION
                </p>

                <h3 className="font-['Playfair_Display'] text-3xl font-semibold">
                  Growing together in faith.
                </h3>

                <p className="mt-5 text-sm leading-8 text-[#647168]">
                  To provide a Christ-centred community where students can
                  grow spiritually, study God's Word, build meaningful
                  relationships and express their faith through service.
                </p>
              </article>
            </div>

          </div>
        </section>

        {/* VALUES */}
        <section className="px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <div className="flex justify-center">
                <SectionLabel>WHAT SHAPES US</SectionLabel>
              </div>

              <h2 className="font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
                The values we hold close.
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#647168]">
                The principles behind how we grow, serve and relate with
                one another as a fellowship.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = value.icon;

                return (
                  <article
                    key={value.title}
                    className="rounded-2xl border border-[#E8ECE8] bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF4EE] text-[#087443]">
                      <Icon size={23} />
                    </div>

                    <span className="text-xs font-bold text-[#A0AAA2]">
                      0{index + 1}
                    </span>

                    <h3 className="mt-3 font-['Playfair_Display'] text-2xl font-semibold">
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

        {/* LEADERSHIP */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#052F21]">
            <div className="grid md:grid-cols-[1fr_0.8fr]">
              <div className="p-8 text-white sm:p-12 lg:p-16">
                <SectionLabel>OUR LEADERSHIP</SectionLabel>

                <h2 className="font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
                  {administration?.name ?? "A legacy of service."}
                </h2>

                <p className="mt-6 max-w-xl text-sm leading-8 text-white/70">
                  {administration?.description ??
                    "Every administration contributes to the story of JCCF University of Offa. Explore the leadership archive to learn about those serving our fellowship."}
                </p>

                <a
                  href="/leadership"
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#063D29] transition hover:bg-white"
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

                  <p className="mt-6 text-xs font-bold tracking-[0.2em] text-white/70">
                    JCCF · UNIOFFA
                  </p>

                  <p className="mt-2 font-['Playfair_Display'] text-2xl font-semibold text-white">
                    {administration?.name ?? "Growing together in Christ"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

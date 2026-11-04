
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Cake,
  CalendarDays,
  ChevronDown,
  Gift,
  PartyPopper,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";
import { apiRequest } from "../api/client";

type BirthdayMember = {
  id: number;
  name: string;
  role: string;
  date: string;
  month: number;
  day: number;
};

type BirthdayApiRecord = { id: number; fullName: string; month: number; day: number };

function BirthdayAvatar({ name, className }: { name: string; className: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div aria-hidden="true" className={`flex shrink-0 items-center justify-center bg-[#EAF4EE] font-semibold text-[#087443] ${className}`}>
      {initials}
    </div>
  );
}

const monthNames = [
  "All months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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

function getDaysUntil(month: number, day: number) {
  const today = new Date();
  const currentYear = today.getFullYear();

  const todayDate = new Date(
    currentYear,
    today.getMonth(),
    today.getDate(),
  );

  let birthday = new Date(currentYear, month - 1, day);

  if (birthday < todayDate) {
    birthday = new Date(currentYear + 1, month - 1, day);
  }

  return Math.round(
    (birthday.getTime() - todayDate.getTime()) / 86400000,
  );
}

export default function BirthdaysPage() {
  const [members, setMembers] = useState<BirthdayMember[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All months");

  useEffect(() => {
    let active = true;
    apiRequest<{ success: boolean; data: BirthdayApiRecord[] }>("/birthdays")
      .then((response) => {
        if (!active) return;
        setMembers((response.data ?? []).map((record) => ({
          id: record.id,
          name: record.fullName,
          role: "Fellowship Member",
          month: record.month,
          day: record.day,
          date: new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(
            new Date(2024, record.month - 1, record.day)
          ),
        })));
      })
      .catch((error: unknown) => {
        console.warn("Unable to load public birthday records.", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const todaysBirthdays = members.filter(
    (member) =>
      member.month === todayMonth && member.day === todayDay,
  );

  const upcomingBirthdays = [...members]
    .filter((member) => getDaysUntil(member.month, member.day) > 0)
    .sort(
      (a, b) =>
        getDaysUntil(a.month, a.day) -
        getDaysUntil(b.month, b.day),
    );

  const filteredMembers = useMemo(() => {
    return members
      .filter((member) => {
        const matchesMonth =
          selectedMonth === "All months" ||
          member.month === monthNames.indexOf(selectedMonth);

        const matchesSearch =
          member.name.toLowerCase().includes(search.toLowerCase());

        return matchesMonth && matchesSearch;
      })
      .sort((a, b) => a.month - b.month || a.day - b.day);
  }, [search, selectedMonth]);

  const nextBirthday = upcomingBirthdays[0];

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="Member Birthdays | JCCF Unioffa"
        description="Celebrate JCCF University of Offa fellowship members and see upcoming birthday celebrations."
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
              <span className="text-white">Birthdays</span>
            </div>

            <div className="max-w-3xl">
              <SectionLabel>CELEBRATING OUR PEOPLE</SectionLabel>

              <h1 className="font-['Playfair_Display'] text-5xl font-semibold leading-[1.12] sm:text-6xl lg:text-7xl">
                Another year.
                <br />
                <span className="italic text-[#F7D94A]">
                  Another reason to celebrate.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Every member is part of our story. Join us in celebrating
                the lives, gifts and beautiful journeys of our JCCF family.
              </p>
            </div>
          </div>
        </section>

        {/* TODAY'S BIRTHDAYS */}
        <section className="px-5 pt-16 sm:pt-20">
          <div className="mx-auto max-w-7xl">
            <SectionLabel>THE CELEBRATION STARTS HERE</SectionLabel>

            {todaysBirthdays.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {todaysBirthdays.map((member) => (
                  <article
                    key={member.id}
                    className="relative overflow-hidden rounded-3xl bg-[#063D29] p-8 text-white sm:p-10"
                  >
                    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />

                    <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
                      <BirthdayAvatar name={member.name} className="h-32 w-32 rounded-2xl text-3xl" />

                      <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F7D94A] px-4 py-2 text-[10px] font-bold tracking-wider text-[#063D29]">
                          <PartyPopper size={13} />
                          TODAY IS YOUR DAY
                        </div>

                        <h2 className="font-['Playfair_Display'] text-3xl font-semibold">
                          Happy Birthday, {member.name}!
                        </h2>

                        <p className="mt-2 text-sm text-white/65">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    <p className="relative mt-7 text-sm leading-8 text-white/75">
                      We celebrate you today! May this new chapter bring
                      you joy, grace, wisdom and beautiful testimonies.
                      Have a wonderful birthday!
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-[#E8ECE8] bg-white p-8 sm:p-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFF8DB] text-[#9A7410]">
                    <Cake size={30} />
                  </div>

                  <div>
                    <h2 className="font-['Playfair_Display'] text-2xl font-semibold sm:text-3xl">
                      No birthdays listed for today.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#718078]">
                      Every day is worth celebrating. Check out the
                      upcoming birthdays and join us in celebrating our
                      fellowship family.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* NEXT BIRTHDAY */}
        {nextBirthday && (
          <section className="px-5 pt-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-6 rounded-3xl bg-[#EAF4EE] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#087443]">
                    <Gift size={26} />
                  </div>

                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-[#087443]">
                      UP NEXT
                    </p>
                    <h2 className="mt-2 font-['Playfair_Display'] text-2xl font-semibold">
                      {nextBirthday.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#718078]">
                      {nextBirthday.date}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="font-['Playfair_Display'] text-4xl font-semibold text-[#087443]">
                    {getDaysUntil(nextBirthday.month, nextBirthday.day)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#718078]">
                    DAYS TO GO
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* UPCOMING BIRTHDAYS */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <SectionLabel>COMING UP</SectionLabel>
                <h2 className="font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
                  Upcoming birthdays
                </h2>
                <p className="mt-4 text-sm text-[#718078]">
                  The next opportunities to celebrate our fellowship family.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#087443]">
                <CalendarDays size={18} />
                <span className="font-semibold">
                  {upcomingBirthdays.length} upcoming
                </span>
              </div>
            </div>

            {upcomingBirthdays.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingBirthdays.slice(0, 6).map((member) => {
                  const days = getDaysUntil(member.month, member.day);

                  return (
                    <article
                      key={member.id}
                      className="flex items-center gap-5 rounded-2xl border border-[#E8ECE8] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <BirthdayAvatar name={member.name} className="h-16 w-16 rounded-xl text-lg" />

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">
                          {member.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#89948C]">
                          {member.date}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-[#087443]">
                          {days === 1 ? "Tomorrow" : `In ${days} days`}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF8DB] text-[#9A7410]">
                        <Cake size={19} />
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl bg-white p-8 text-sm text-[#718078]">
                No upcoming birthdays have been added yet.
              </p>
            )}
          </div>
        </section>

        {/* BIRTHDAY DIRECTORY */}
        <section className="bg-[#F0F5F0] px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <SectionLabel>OUR BIRTHDAY DIRECTORY</SectionLabel>
              <h2 className="font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
                Every member matters.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#718078]">
                Find a member's birthday and celebrate them throughout
                the year.
              </p>
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#89948C]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search members..."
                  className="w-full rounded-full border border-[#E2E8E2] bg-white py-3.5 pl-11 pr-5 text-sm outline-none focus:border-[#087443]"
                />
              </div>

              <div className="relative sm:w-56">
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="w-full appearance-none rounded-full border border-[#E2E8E2] bg-white px-5 py-3.5 pr-11 text-sm outline-none focus:border-[#087443]"
                >
                  {monthNames.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#718078]"
                />
              </div>
            </div>

            {filteredMembers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredMembers.map((member) => (
                  <article
                    key={member.id}
                    className="overflow-hidden rounded-2xl border border-[#E4EAE4] bg-white"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <BirthdayAvatar name={member.name} className="h-full w-full text-3xl" />
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#087443]">
                        {member.date}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-['Playfair_Display'] text-xl font-semibold">
                        {member.name}
                      </h3>
                      <p className="mt-2 text-xs text-[#89948C]">
                        {member.role}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#D8E1D9] bg-white px-6 py-14 text-center">
                <Users
                  size={30}
                  className="mx-auto mb-4 text-[#A5AEA7]"
                />
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold">
                  No members found
                </h3>
                <p className="mt-3 text-sm text-[#718078]">
                  Try another name or select a different month.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CELEBRATION CTA */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-7xl rounded-3xl bg-[#052F21] p-8 text-center text-white sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[#F7D94A]">
              <Sparkles size={30} />
            </div>

            <p className="mt-7 text-xs font-bold tracking-[0.2em] text-[#F7D94A]">
              ONE FAMILY, MANY REASONS TO CELEBRATE
            </p>

            <h2 className="mt-4 font-['Playfair_Display'] text-3xl font-semibold sm:text-5xl">
              Your life is worth celebrating.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/70">
              To every member of JCCF University of Offa, may your new
              chapter be filled with God's grace, wisdom and favour.
            </p>

            <a
              href="/"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#063D29] transition hover:bg-white"
            >
              Back to home
              <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

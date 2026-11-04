
import { useEffect, useState } from "react";
import { Mail, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";
import { apiRequest } from "../api/client";

const links = [
  { label: "About us", href: "/about" },
  { label: "Our activities", href: "/programmes" },
  { label: "Leadership", href: "/leadership" },
  { label: "Updates", href: "/announcements" },
  { label: "Media gallery", href: "/media" },
  { label: "Birthdays", href: "/birthdays" },
];

type PublicSettings = {
  fellowshipName?: string;
  chapterName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
};

export default function Footer() {
  const [settings, setSettings] = useState<PublicSettings>({});

  useEffect(() => {
    apiRequest<{ data: PublicSettings }>("/settings/public")
      .then((response) => setSettings(response.data ?? {}))
      .catch((error: unknown) => console.warn("Unable to load public site settings.", error));
  }, []);

  const socials = [
    { name: "Instagram", icon: FaInstagram, href: settings.instagramUrl },
    { name: "Facebook", icon: FaFacebookF, href: settings.facebookUrl },
  ].filter((social) => social.href);

  return (
    <footer
      id="contact"
      className="scroll-mt-24 bg-[#052F21] px-5 pb-8 pt-16 text-white sm:px-8 lg:px-10"
    >
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <a href="/" className="inline-flex items-center gap-3">
            <img
              src="/images/jccf-logo.png"
              alt="JCCF logo"
              className="h-14 w-14 object-contain"
            />

            <div>
              <p className="text-xl font-extrabold">{settings.fellowshipName || "JCCF Connect"}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
                {settings.chapterName || "University of Offa"}
              </p>
            </div>
          </a>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/65">
            {settings.fellowshipName || "Joint Christian Campus Fellowship"}, {settings.chapterName || "University of Offa Chapter"}.
            Growing in faith, living in purpose and impacting our generation
            for Christ.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#F7D94A]">Explore</h3>

          <div className="mt-6 flex flex-col gap-4 text-sm text-white/65">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#F7D94A]">
            Get in touch
          </h3>

          <div className="mt-6 space-y-4 text-sm text-white/65">
            <p className="flex items-start gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-[#F7D94A]" />
              {settings.address || "University of Offa, Kwara State, Nigeria"}
            </p>

            {settings.contactEmail ? <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 hover:text-white">
              <Mail size={17} className="shrink-0 text-[#F7D94A]" />
              {settings.contactEmail}
            </a> : <p className="flex items-center gap-3"><Mail size={17} className="shrink-0 text-[#F7D94A]" />No public contact email configured</p>}
            {settings.contactPhone && <a href={`tel:${settings.contactPhone}`} className="pl-7 hover:text-white">{settings.contactPhone}</a>}
          </div>

          <div className="mt-7 flex gap-3">
            {socials.map(({ name, icon: Icon, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} JCCF Unioffa. All rights reserved.</p>
        <p>Built to connect the fellowship community.</p>
      </div>
    </footer>
  );
}

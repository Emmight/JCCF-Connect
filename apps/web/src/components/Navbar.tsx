
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

const links = [
  { label: "About", href: "/about" },
  { label: "Programmes", href: "/programmes" },
  { label: "Leadership", href: "/leadership" },
  { label: "Updates", href: "/announcements" },
  { label: "Media", href: "/media" },
  { label: "Birthdays", href: "/birthdays" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8EDE8]/80 bg-white/95 shadow-[0_8px_24px_-22px_rgba(6,61,41,0.65)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:h-[82px] sm:px-8 lg:px-10">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
          <img
            src="/images/jccf-logo.png"
            alt="JCCF logo"
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />

          <div>
            <p className="text-base font-extrabold leading-none tracking-tight text-[#075B35] sm:text-lg">
              JCCF Connect
            </p>
            <p className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[9px] sm:tracking-[0.19em]">
              University of Offa Chapter
            </p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 xl:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              className={({ isActive }) =>
                `relative py-2 text-[13px] font-semibold transition after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#F0C93D] after:transition-transform hover:text-[#087443] hover:after:scale-x-100 ${
                  isActive
                    ? "text-[#087443] after:scale-x-100"
                    : "text-slate-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <Link
            to="/#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#087443] px-5 py-3 text-[13px] font-bold text-white shadow-sm shadow-[#063D29]/15 transition hover:-translate-y-0.5 hover:bg-[#075B35] hover:shadow-lg"
          >
            Connect with us <ArrowUpRight size={16} />
          </Link>
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl border border-slate-200 p-2.5 text-[#075B35] transition hover:border-[#087443]/30 hover:bg-[#F0F7F2] xl:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-slate-100 bg-white px-5 py-5 shadow-xl shadow-[#063D29]/5 xl:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#EAF5EE] text-[#075B35]"
                      : "text-slate-700 hover:bg-[#F0F7F2] hover:text-[#075B35]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/#contact"
              onClick={closeMenu}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#087443] px-5 py-3.5 text-center text-sm font-bold text-white sm:col-span-2"
            >
              Connect with us <ArrowUpRight size={16} />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

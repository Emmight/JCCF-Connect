
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Images,
  Search,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteBanner from "../components/SiteBanner";
import PageMeta from "../components/PageMeta";
import { API_BASE_URL, apiRequest } from "../api/client";

type MediaItem = {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
};

type MediaApiRecord = { id: number; title: string; category: string; fileUrl: string; mimeType: string | null };

const filters = ["All media", "Images", "Flyers", "Logos", "Other"];

function categoryLabel(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
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

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All media");
  const [search, setSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [requestPending, setRequestPending] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<{ success: boolean; data: MediaApiRecord[] }>("/media/public")
      .then((response) => {
        if (!active) return;
        const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
        setMediaItems((response.data ?? []).map((asset) => ({
          id: asset.id,
          title: asset.title,
          category: categoryLabel(asset.category),
          image: asset.fileUrl.startsWith("http") ? asset.fileUrl : `${apiOrigin}${asset.fileUrl}`,
          description: `${categoryLabel(asset.category)} from the JCCF media collection.`,
        })));
      })
      .catch((error: unknown) => console.warn("Unable to load public media.", error))
      .finally(() => { if (active) setMediaLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesFilter =
        activeFilter === "All media" ||
        item.category === activeFilter.replace(/s$/, "");

      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const selectedIndex = selectedMedia
    ? filteredMedia.findIndex((item) => item.id === selectedMedia.id)
    : -1;

  function showPrevious() {
    if (selectedIndex <= 0) return;
    setSelectedMedia(filteredMedia[selectedIndex - 1]);
  }

  function showNext() {
    if (selectedIndex < 0 || selectedIndex >= filteredMedia.length - 1) return;
    setSelectedMedia(filteredMedia[selectedIndex + 1]);
  }

  async function submitMediaRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setRequestPending(true);
    setRequestMessage("");
    try {
      await apiRequest("/media-requests", {
        method: "POST",
        body: JSON.stringify({
          requesterName: formData.get("requesterName"),
          requesterEmail: formData.get("requesterEmail") || null,
          requestType: formData.get("requestType"),
          programmeName: formData.get("programmeName") || null,
          description: formData.get("description"),
          deadline: formData.get("deadline") || null,
        }),
      });
      form.reset();
      setRequestMessage("Your request has been submitted. The media team will review it.");
    } catch (error) {
      setRequestMessage(error instanceof Error ? error.message : "Unable to submit your request. Please try again.");
    } finally {
      setRequestPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#17251D]">
      <PageMeta
        title="Media Gallery | JCCF Unioffa"
        description="Browse approved photos, flyers and media from the JCCF University of Offa fellowship community."
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
              <span className="text-white">Media vault</span>
            </div>

            <div className="max-w-3xl">
              <SectionLabel>MEMORIES THAT CONNECT US</SectionLabel>

              <h1 className="font-['Playfair_Display'] text-5xl font-semibold leading-[1.12] sm:text-6xl lg:text-7xl">
                Every moment
                <br />
                <span className="italic text-[#F7D94A]">
                  tells a story.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Explore moments from our fellowship journey — gatherings,
                worship, special events and memories that remind us of the
                community we share.
              </p>

              <a
                href="#gallery"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#F7D94A] px-7 py-4 text-sm font-bold text-[#063D29] transition hover:bg-white"
              >
                Explore the gallery
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="px-5 py-16 sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel>THE JCCF EXPERIENCE</SectionLabel>
              <h2 className="font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
                Moments worth remembering.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-[#718078]">
                Every picture captures a moment. Every video preserves a
                memory. Together, they tell the story of our fellowship
                across different gatherings and administrations.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#E8ECE8] bg-white p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF4EE] text-[#087443]">
                <Images size={23} />
              </div>
              <div>
                <p className="text-xs text-[#89948C]">Explore</p>
                <p className="font-semibold">Photos & Videos</p>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery" className="scroll-mt-24 px-5 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <SectionLabel>OUR COLLECTION</SectionLabel>
                <h2 className="font-['Playfair_Display'] text-4xl font-semibold sm:text-5xl">
                  The media vault
                </h2>
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
                  placeholder="Search the gallery..."
                  className="w-full rounded-full border border-[#E2E8E2] bg-white py-3.5 pl-11 pr-5 text-sm outline-none transition focus:border-[#087443]"
                />
              </div>
            </div>

            {/* FILTERS */}
            <div className="mb-10 flex gap-2 overflow-x-auto pb-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-full px-5 py-3 text-xs font-bold transition ${
                    activeFilter === filter
                      ? "bg-[#087443] text-white"
                      : "border border-[#E2E8E2] bg-white text-[#647168] hover:border-[#087443] hover:text-[#087443]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* IMAGE GRID */}
            {mediaLoading ? (
              <p className="py-10 text-center text-sm text-[#718078]">Loading approved media…</p>
            ) : filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMedia.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMedia(item)}
                    className={`group relative block w-full overflow-hidden rounded-2xl bg-[#EAF4EE] text-left ${
                      index === 0 && activeFilter === "All media"
                        ? "sm:col-span-2 sm:row-span-2 sm:min-h-[450px]"
                        : "h-[300px]"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#052F21]/90 via-[#052F21]/10 to-transparent opacity-80 transition group-hover:opacity-100" />

                    <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                      <span className="text-[10px] font-bold tracking-[0.18em] text-[#F7D94A]">
                        {item.category.toUpperCase()}
                      </span>

                      <div className="mt-2 flex items-end justify-between gap-4">
                        <div>
                          <h3 className="font-['Playfair_Display'] text-2xl font-semibold">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-xs leading-6 text-white/70">
                            {item.description}
                          </p>
                        </div>

                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 transition group-hover:bg-white group-hover:text-[#087443]">
                          <ArrowRight size={18} />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#D8E1D9] bg-white px-6 py-16 text-center">
                <Camera
                  size={32}
                  className="mx-auto mb-5 text-[#A5AEA7]"
                />
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold">
                  No media found
                </h3>
                <p className="mt-3 text-sm text-[#718078]">
                  Try another search term or select a different category.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("All media");
                  }}
                  className="mt-6 text-sm font-bold text-[#087443]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* MEDIA REQUESTS */}
        <section className="bg-[#F0F5F0] px-5 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <SectionLabel>MEDIA SUPPORT</SectionLabel>

              <h2 className="font-['Playfair_Display'] text-4xl font-semibold leading-tight sm:text-5xl">
                Need an event asset or coverage?
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-8 text-[#647168]">
                Tell the media team what your programme needs. Requests go directly into the review and assignment queue.
              </p>

              <a
                href="#request-media"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#087443] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#063D29]"
              >
                Request media support
                <ArrowRight size={17} />
              </a>
            </div>

            {mediaItems.length ? <div className="grid h-[300px] grid-cols-2 grid-rows-2 gap-3">{mediaItems.slice(0, 3).map((item, index) => <img key={item.id} src={item.image} alt={item.title} loading="lazy" className={`h-full w-full rounded-lg object-cover ${index === 0 ? "row-span-2" : ""}`} />)}</div> : <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-[#cbd9ce] bg-white p-8 text-center text-sm text-[#647168]">Approved media will appear here after the first upload.</div>}
          </div>
        </section>

        <section id="request-media" className="scroll-mt-24 bg-[#F0F5F0] px-5 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionLabel>MEDIA TEAM</SectionLabel>
              <h2 className="font-['Playfair_Display'] text-4xl font-semibold leading-tight sm:text-5xl">
                Need a flyer, photo, or coverage?
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-8 text-[#647168]">
                Send the details to the JCCF media team. We will review the request and follow up using your contact information.
              </p>
            </div>

            <form onSubmit={submitMediaRequest} className="grid gap-4 rounded-lg border border-[#dfe8e1] bg-white p-5 sm:grid-cols-2 sm:p-7">
              <label className="text-xs font-semibold text-[#4a5d52]">
                Your name
                <input name="requesterName" required minLength={2} maxLength={150} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-3 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" />
              </label>
              <label className="text-xs font-semibold text-[#4a5d52]">
                Email address
                <input name="requesterEmail" type="email" className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-3 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" />
              </label>
              <label className="text-xs font-semibold text-[#4a5d52]">
                Request type
                <select name="requestType" required className="mt-2 w-full rounded-md border border-[#dfe8e1] bg-white px-3 py-3 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]">
                  <option value="flyer_design">Flyer design</option>
                  <option value="photography">Event photography</option>
                  <option value="video">Video coverage</option>
                  <option value="announcement">Announcement artwork</option>
                  <option value="other">Other media support</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-[#4a5d52]">
                Programme or event
                <input name="programmeName" maxLength={200} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-3 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" />
              </label>
              <label className="text-xs font-semibold text-[#4a5d52] sm:col-span-2">
                Request details
                <textarea name="description" required minLength={10} maxLength={5000} rows={4} className="mt-2 w-full resize-y rounded-md border border-[#dfe8e1] px-3 py-3 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" />
              </label>
              <label className="text-xs font-semibold text-[#4a5d52]">
                Preferred deadline
                <input name="deadline" type="date" min={new Date().toISOString().slice(0, 10)} className="mt-2 w-full rounded-md border border-[#dfe8e1] px-3 py-3 text-sm font-normal text-[#17251d] outline-none focus:border-[#087443]" />
              </label>
              <div className="flex flex-col items-start justify-end gap-3">
                <button disabled={requestPending} className="inline-flex items-center gap-3 rounded-md bg-[#087443] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#063D29] disabled:opacity-60">
                  {requestPending ? "Submitting…" : "Submit request"}
                  <ArrowRight size={17} />
                </button>
                {requestMessage && <p role="status" className="text-xs text-[#345143]">{requestMessage}</p>}
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* LIGHTBOX */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setSelectedMedia(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close preview"
          >
            <X size={23} />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            disabled={selectedIndex <= 0}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 sm:left-6"
            aria-label="Previous media"
          >
            <ChevronLeft size={25} />
          </button>

          <div
            className="w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl bg-[#17251D]">
              <img
                src={selectedMedia.image}
                alt={selectedMedia.title}
                className="max-h-[72vh] w-full object-contain"
              />

            </div>

            <div className="flex flex-col justify-between gap-3 px-2 pt-5 text-white sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-[#F7D94A]">
                  {selectedMedia.category.toUpperCase()}
                </p>
                <h3 className="mt-2 font-['Playfair_Display'] text-2xl font-semibold">
                  {selectedMedia.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  {selectedMedia.description}
                </p>
              </div>

              <p className="shrink-0 text-xs text-white/50">
                {selectedIndex + 1} / {filteredMedia.length}
              </p>
            </div>
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            disabled={selectedIndex >= filteredMedia.length - 1}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 sm:right-6"
            aria-label="Next media"
          >
            <ChevronRight size={25} />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

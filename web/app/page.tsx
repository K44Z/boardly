import Link from "next/link";
import { cn } from "@/lib/utils";
import { Landscape } from "@/components/landing/landscape";
import { label, textLink, themeClass, themeStyle } from "@/components/landing/theme";
import { ActivityFeed } from "@/components/landing/activity-feed";
import { CallVisual } from "@/components/landing/call-visual";
import { Connectors } from "@/components/landing/connectors";
import { Parallax, Reveal, WordReveal } from "@/components/landing/motion";

const chapters = [
  {
    n: "I",
    title: "Arrange",
    art: "arrange" as const,
    body: "Boards hold lists, lists hold cards. Drag a card to the next list, reorder the lists, give a card a date. Overdue and due-soon work is one question away.",
  },
  {
    n: "II",
    title: "Gather",
    art: "gather" as const,
    body: "Color labels for each board. People assigned to cards, and an email to them when you do it. A thread of comments under every card, so the talk stays with the work.",
  },
  {
    n: "III",
    title: "Notice",
    art: "notice" as const,
    body: "Cards per list and recent activity, to see where things pile up. Speak a note and Whisper writes it down. Prompts go to a model on your own machine.",
  },
];

const helpers = [
  {
    title: "Summaries",
    body: "Summaries of your cards and lists, written for you.",
  },
  {
    title: "Notifications",
    body: "Told when it matters, and only then.",
  },
  {
    title: "Transcription",
    body: "Turn a voice note into tasks.",
  },
  {
    title: "Calls",
    body: "Start a call from the board and talk it through, without leaving the work.",
  },
];

const summaries = [
  "Project Alpha launch requirements…",
  "Q4 marketing strategy overview…",
  "User feedback analysis report…",
];

const activity = [
  { user: "Alice", text: "moved Design System", img: "/user-1.jpg" },
  { user: "Bob", text: "commented on API Integration", img: "/user-2.jpg" },
  { user: "Charlie", text: "completed User Auth", img: "/user-3.jpg" },
  { user: "Diana", text: "attached a file to Landing Page", img: "/user-4.jpg" },
  { user: "Alice", text: "assigned Bob to Onboarding", img: "/user-1.jpg" },
  { user: "Charlie", text: "set a due date on Billing", img: "/user-3.jpg" },
];

const values = [
  {
    title: "Free & open source",
    body: "Transparency at its core. Community-driven development that stays free.",
  },
  {
    title: "AI productivity",
    body: "Built-in tools to summarize, generate and organize your work.",
  },
  {
    title: "Simple & elegant",
    body: "A clean, distraction-free interface made for focus. No bloat.",
  },
];

const visual = [
  // Summaries
  <ul key="s" className="flex flex-col divide-y divide-[var(--ink)]/10">
    {summaries.map((t, i) => (
      <li key={t} className="py-3">
        <p className={cn(label, "mb-1 text-[var(--muted)]")}>Summary {i + 1}</p>
        <p className="text-xl italic leading-snug text-[var(--ink)]/80">{t}</p>
      </li>
    ))}
  </ul>,
  // Notifications
  <ActivityFeed key="n" items={activity} />,
  // Transcription
  <div key="t" className="flex h-40 items-center justify-center gap-1.5">
    {[40, 70, 100, 60, 80, 50, 90, 30, 65, 45].map((h, i) => (
      <span
        key={i}
        className="w-1 animate-wave rounded-full bg-[var(--ink)]/60"
        style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>,
  // Calls
  <CallVisual key="c" />,
];

export default function LandingPage() {
  return (
    <div className={themeClass} style={themeStyle}>
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 md:px-10">
          <Link href="/" className="text-2xl font-medium tracking-wide">
            Boardly
          </Link>
          <nav className={cn(label, "flex items-center gap-8")}>
            <Link href="/login" className="transition-opacity hover:opacity-60">
              Sign in
            </Link>
            <Link href="/signup" className="transition-opacity hover:opacity-60">
              Begin
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative flex min-h-screen items-center justify-center">
          <Landscape art="hero" veil priority className="absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--paper)]" />
          <div className="relative z-10 px-6 text-center">
            <Reveal>
              <h1 className="mx-auto max-w-4xl text-[clamp(3.2rem,9vw,8rem)] font-light leading-[0.95] tracking-[-0.01em]">
                A quiet place
                <br />
                for the <em className="font-normal">work</em> at hand.
              </h1>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mx-auto mt-8 max-w-md text-xl leading-snug text-[var(--ink)]/75">
                Boards, lists and cards for small teams. Nothing more.
              </p>
            </Reveal>
            <Reveal delay={0.45}>
              <div className={cn(label, "mt-12")}>
                <Link href="/signup" className={textLink}>
                  Begin a board <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
          <div
            className={cn(
              label,
              "absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-[var(--ink)]/60",
            )}
          >
            Scroll
            <span className="h-10 w-px bg-[var(--ink)]/40" />
          </div>
        </section>

        {/* Statement */}
        <section className="mx-auto max-w-4xl px-6 py-40 md:py-56">
          <WordReveal
            text="Boards hold lists. Lists hold cards. Cards hold the work, the people on it, and the conversation about it. Nothing else is asked of you."
            className="text-[clamp(2rem,4.6vw,3.75rem)] font-light leading-[1.18]"
          />
        </section>

        {/* Product */}
        <section className="mx-auto max-w-6xl px-6 pb-40 md:px-10">
          <Reveal>
            <div className="overflow-hidden rounded-[2px] shadow-[0_40px_80px_-40px_rgba(43,43,40,0.35)]">
              <video
                src="/video.mp4"
                className="block w-full"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
            <p className={cn(label, "mt-6 text-[var(--muted)]")}>
              The board, as it is
            </p>
          </Reveal>
        </section>

        {/* Chapters */}
        {chapters.map((c, i) => (
          <section
            key={c.n}
            className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-40 md:grid-cols-2 md:gap-24 md:px-10"
          >
            <Parallax
              distance={40}
              className={cn(i % 2 === 1 && "md:order-2")}
            >
              <Landscape
                art={c.art}
                className="aspect-[4/5] w-full rounded-t-[999px]"
              />
            </Parallax>
            <Reveal className="max-w-md">
              <p className={cn(label, "mb-8 text-[var(--muted)]")}>
                Chapter {c.n}
              </p>
              <h2 className="mb-6 text-6xl font-light italic md:text-7xl">
                {c.title}
              </h2>
              <p className="text-xl leading-relaxed text-[var(--ink)]/75">
                {c.body}
              </p>
            </Reveal>
          </section>
        ))}

        {/* Helpers */}
        <section className="mx-auto max-w-7xl px-6 pb-40 md:px-10">
          <Reveal>
            <p className={cn(label, "mb-6 text-[var(--muted)]")}>And besides</p>
            <h2 className="mb-16 max-w-2xl text-5xl font-light leading-none md:text-7xl">
              Small <em>helpers</em>, kept in the margins.
            </h2>
          </Reveal>
          <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
            {helpers.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.1} className="border-t border-[var(--ink)] pt-6">
                <h3 className="mb-3 text-4xl font-light italic">{h.title}</h3>
                <p className="mb-8 min-h-14 text-xl leading-snug text-[var(--ink)]/75">{h.body}</p>
                {visual[i]}
              </Reveal>
            ))}
          </div>
        </section>

        {/* Connectors */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-40 md:grid-cols-[1fr_1.2fr] md:gap-24 md:px-10">
          <Reveal className="max-w-md">
            <p className={cn(label, "mb-8 text-[var(--muted)]")}>Connectors</p>
            <h2 className="mb-6 text-6xl font-light italic md:text-7xl">Bring your tools along</h2>
            <p className="text-xl leading-relaxed text-[var(--ink)]/75">
              Canvas, GitHub, Notion, Obsidian, Slack and Microsoft 365 meet in one board, so the work
              doesn&apos;t have to live in five places.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Connectors />
          </Reveal>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-7xl px-6 pb-40 md:px-10">
          <div className="grid gap-12 md:grid-cols-3 md:gap-16">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1} className="border-t border-[var(--ink)]/30 pt-6">
                <h3 className="mb-3 text-3xl font-medium">{v.title}</h3>
                <p className="text-xl leading-snug text-[var(--ink)]/75">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Close */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
          <Landscape art="close" veil className="absolute inset-0" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-t from-transparent to-[var(--paper)]" />
          <Reveal className="relative z-10 px-6 text-center">
            <h2 className="text-[clamp(3.5rem,11vw,9rem)] font-light italic leading-none">
              Begin.
            </h2>
            <div className={cn(label, "mt-12")}>
              <Link href="/signup" className={textLink}>
                Create an account <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer
        className={cn(
          label,
          "flex flex-col justify-between gap-3 px-6 py-8 text-[var(--muted)] sm:flex-row md:px-10",
        )}
      >
        <span>Boardly</span>
        <Link href="/login" className="hover:text-[var(--ink)]">
          Sign in
        </Link>
      </footer>
    </div>
  );
}

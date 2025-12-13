import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  CheckCircle2,
  Command,
  Layout,
  MessageSquare,
  Calendar as CalendarIcon,
  Bell,
  Share2,
  FileText,
  Home,
  Settings,
  Github,
  Twitter,
  LogIn,
  UserPlus,
  Mic,
  Mic2,
  Bot,
  Feather,
} from "lucide-react";
import { GridPattern } from "@/components/magicui/grid-pattern";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import Marquee from "@/components/magicui/marquee";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/magicui/animated-list";
import { Calendar } from "@/components/ui/calendar";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { IntegrationsBeam } from "@/components/integrations-beam";
import { MorphingText } from "@/components/magicui/morphing-text";
import { FollowerPointerCard } from "@/components/magicui/follower-pointer";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { cn } from "@/lib/utils";

const features = [
  {
    Icon: FileText,
    name: "AI Summaries",
    description: "Instantly generate summaries for your cards and lists.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
      >
        {[
          "Project Alpha launch requirements...",
          "Q4 Marketing Strategy overview...",
          "User feedback analysis report...",
          "Technical debt reduction plan...",
          "Competitor analysis summary...",
        ].map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-xs font-medium dark:text-white">
                  Summary #{idx + 1}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-[10px]">{f}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Bell,
    name: "Smart Notifications",
    description: "Get notified only when it matters.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedList className="absolute right-2 top-4 h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90">
        {[
          {
            user: "Alice",
            action: "moved card",
            target: "Design System",
            time: "Just now",
            img: "/user-1.jpg",
          },
          {
            user: "Bob",
            action: "commented on",
            target: "API Integration",
            time: "2m ago",
            img: "/user-2.jpg",
          },
          {
            user: "Charlie",
            action: "completed",
            target: "User Auth",
            time: "5m ago",
            img: "/user-3.jpg",
          },
          {
            user: "Diana",
            action: "attached file",
            target: "Landing Page",
            time: "12m ago",
            img: "/user-4.jpg",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="w-full bg-background/80 backdrop-blur-sm border border-border/50 p-3 rounded-lg shadow-sm flex items-center gap-3 max-w-[300px] ml-auto"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
              <Image
                src={item.img}
                alt={item.user}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 text-xs">
              <span className="font-semibold">{item.user}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>{" "}
              <span className="font-medium">{item.target}</span>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {item.time}
            </span>
          </div>
        ))}
      </AnimatedList>
    ),
  },
  {
    Icon: Share2,
    name: "Integrations",
    description: "Connect with your favorite tools.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <IntegrationsBeam className="absolute top-0 h-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: Mic,
    name: "AI Transcription",
    description: "Turn your voice notes into actionable tasks.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 transition-all duration-300 ease-out group-hover:scale-95">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <Mic className="h-8 w-8 text-primary" />
          <div className="absolute -inset-2 rounded-full border border-primary/10 animate-[spin_3s_linear_infinite]" />
          <div className="absolute -inset-4 rounded-full border border-primary/5 animate-[spin_5s_linear_infinite_reverse]" />
        </div>
        <div className="flex items-center gap-1 h-12">
          {[40, 70, 100, 60, 80, 50, 90, 30].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-primary/40 animate-wave"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] ",
          "opacity-50",
        )}
      />

      <section className="container mx-auto px-6 py-24 md:py-32 relative z-10">
        <div className="max-w-5xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm mb-8 shadow-sm hover:shadow-md transition-all cursor-default">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">
              AI-Powered Collaboration 2.0
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            The complete platform to organize your work.
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">
            Collaborate seamlessly with your team. Organize tasks, track
            progress, and leverage AI to work smarter with Boardly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Start Building
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/boards">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base rounded-full border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50"
              >
                View Demo
              </Button>
            </Link>
          </div>

          {/* Hero Image / Demo */}
          <div className="relative rounded-xl border border-border bg-card/50 shadow-2xl overflow-hidden">
            <BorderBeam size={250} duration={8} delay={9} />
            <video
              src="/video.mp4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Open Source */}
            <FollowerPointerCard title="Open Source">
              <div className="relative overflow-hidden flex flex-col items-start justify-end p-8 shadow-2xl bg-transparent backdrop-blur-sm border border-border/50 rounded-xl aspect-square h-full w-full transition-all hover:scale-[1.02] group">
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-xl overflow-hidden opacity-[0.2] grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500">
                    <Image
                      src="/githubback.jpg"
                      alt="GitHub Background"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Free & Open Source
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-left">
                    Transparency at its core. Community-driven development
                    that&apos;s free forever.
                  </p>
                </div>
              </div>
            </FollowerPointerCard>

            {/* AI Productivity */}
            <FollowerPointerCard title="AI Powered">
              <div className="relative overflow-hidden flex flex-col items-start justify-end p-8 shadow-2xl bg-transparent backdrop-blur-sm border border-border/50 rounded-xl aspect-square h-full w-full transition-all hover:scale-[1.02] group">
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-xl overflow-hidden opacity-[0.2] grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500">
                    <Image
                      src="/openai.jpg"
                      alt="OpenAI Background"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-2  transition-colors">
                    AI Productivity
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-left">
                    Built-in AI tools to summarize, generate, and organize your
                    work automatically.
                  </p>
                </div>
              </div>
            </FollowerPointerCard>

            {/* Simple UI */}
            <FollowerPointerCard title="Simple UI">
              <div className="relative overflow-hidden flex flex-col items-start justify-end p-8 shadow-2xl bg-transparent backdrop-blur-sm border border-border/50 rounded-xl aspect-square h-full w-full transition-all hover:scale-[1.02] group">
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-xl overflow-hidden opacity-[0.2] grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500">
                    <Image
                      src="/logo.png"
                      alt="Boardly Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-2 transition-colors">
                    Simple & Elegant
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-left">
                    A clean, distraction-free interface designed for focus. No
                    bloat.
                  </p>
                </div>
              </div>
            </FollowerPointerCard>
          </div>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Make teamwork seamless.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tools for your team to collaborate, iterate, and ship faster than
              ever before.
            </p>
          </div>

          <BentoGrid className="max-w-4xl mx-auto">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl -z-10 rounded-full opacity-50" />
          <div className="border border-border/50 rounded-3xl p-12 md:p-16 bg-background/40 backdrop-blur-xl shadow-2xl">
            <MorphingText
              className="mb-8 text-4xl md:text-6xl font-bold tracking-tight"
              texts={[
                "Transform",
                "Organize",
                "Collaborate",
                "Ship",
                "Succeed",
              ]}
            />
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using Boardly to organize their
              work and ship faster.
            </p>
            <Link href="/signup">
              <ShimmerButton className="shadow-2xl mx-auto" shimmerSize="2px">
                <span className="whitespace-pre-wrap text-center text-base font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg px-8 py-2">
                  Get Started for Free
                </span>
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-24 bg-muted/10">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Boardly"
                width={60}
                height={60}
                className="rounded"
              />
              <span className="font-bold">Boardly</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Boardly. Built with collaboration in mind.
            </div>
          </div>
        </div>
      </footer>

      {/* Dock */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <Dock>
          <DockIcon href="#">
            <Home className="w-6 h-6" />
          </DockIcon>
          <DockIcon href="#features">
            <Layout className="w-6 h-6" />
          </DockIcon>
          <DockIcon href="#pricing">
            <Settings className="w-6 h-6" />
          </DockIcon>
          <div className="w-[1px] h-8 bg-border mx-2 self-center" />
          <DockIcon href="/login">
            <LogIn className="w-6 h-6" />
          </DockIcon>
          <DockIcon href="/signup">
            <UserPlus className="w-6 h-6" />
          </DockIcon>
          <div className="w-[1px] h-8 bg-border mx-2 self-center" />
          <DockIcon href="https://github.com">
            <Github className="w-6 h-6" />
          </DockIcon>
          <DockIcon href="https://twitter.com">
            <Twitter className="w-6 h-6" />
          </DockIcon>
          <div className="w-[1px] h-8 bg-border mx-2 self-center" />
          <DockIcon>
            <AnimatedThemeToggler />
          </DockIcon>
        </Dock>
      </div>
    </div>
  );
}

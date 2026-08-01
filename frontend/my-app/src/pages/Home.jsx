import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { CalendarClock, Repeat, ShieldCheck, Activity } from "lucide-react";
import Footer from "../components/Footer";

gsap.registerPlugin(ScrollTrigger);

const SHIFTS = [
  { id: "01", name: "Dr. R. Khan", time: "07:00–15:00", ward: "ICU" },
  { id: "02", name: "N. Alvarez", time: "15:00–23:00", ward: "ER" },
  { id: "03", name: "Dr. S. Patel", time: "23:00–07:00", ward: "ICU" },
  { id: "04", name: "T. Osei", time: "07:00–15:00", ward: "Peds" },
  { id: "05", name: "Dr. L. Chen", time: "15:00–23:00", ward: "ER" },
  { id: "06", name: "M. Duarte", time: "23:00–07:00", ward: "Peds" },
];

const PROBLEMS = [
  "Shift swaps get buried in group texts, and nobody confirms coverage until it's too late.",
  "Credential expirations surface during an audit, not before the shift that needed them.",
  "Night rotations are a blind spot — the day team has no idea who's actually on the floor.",
  "One spreadsheet, five departments, and no single version anyone fully trusts.",
];

const FEATURES = [
  {
    icon: CalendarClock,
    title: "Live roster",
    body: "Every ward's schedule updates in real time, so the roster on screen is the roster on the floor.",
  },
  {
    icon: Repeat,
    title: "One-tap swaps",
    body: "Staff request and confirm shift swaps directly — no texts, no guessing who said yes.",
  },
  {
    icon: ShieldCheck,
    title: "Credential tracking",
    body: "Licenses and certifications are checked automatically before a shift, not after a lapse.",
  },
  {
    icon: Activity,
    title: "Coverage alerts",
    body: "Gaps in coverage are flagged the moment they open, with the nearest qualified staff suggested.",
  },
];

// deliberate scatter for the "problem" cards — a little chaos, matching the copy
const SCATTER = [
  "-rotate-6 translate-y-1",
  "rotate-3 -translate-y-2",
  "rotate-2 translate-y-3",
  "-rotate-3 -translate-y-1",
  "rotate-6 translate-y-2",
  "-rotate-2 -translate-y-3",
];

function ShiftCard({ s, extraClass = "", innerRef, dark = false }) {
  return (
    <div
      ref={innerRef}
      className={
        dark
          ? `bg-emerald-900 border border-emerald-800 rounded-xl px-4 py-3 flex flex-col gap-0.5 text-sm ${extraClass}`
          : `bg-emerald-50 border border-neutral-200 rounded-xl px-4 py-3 flex flex-col gap-0.5 text-sm ${extraClass}`
      }
    >
      <span className={`font-mono text-[0.7rem] ${dark ? "text-emerald-400" : "text-emerald-700"}`}>{s.id}</span>
      <span className="font-semibold">{s.name}</span>
      <span className="font-mono text-xs opacity-65">{s.time}</span>
      <span className="font-mono text-xs opacity-65">{s.ward}</span>
    </div>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const pathRef = useRef(null);
  const problemCards = useRef([]);
  const solutionCards = useRef([]);
  const featureCards = useRef([]);

  useEffect(() => {
    // --- Smooth scroll (Lenis), synced to GSAP's ticker + ScrollTrigger ---
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Subtle parallax drift on the hero pulse line as you scroll away
      gsap.to(".pulse-bg", {
        yPercent: 20,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // Hero entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".eyebrow-brand", { opacity: 0, y: 12, duration: 0.5 })
        .from(".hero-line", { opacity: 0, y: 28, stagger: 0.12, duration: 0.7 }, "-=0.2")
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.6 }, "-=0.35")
        .from(".hero-cta", { opacity: 0, y: 12, duration: 0.5 }, "-=0.3");

      // Pulse line draw-in, chaotic -> settling
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 2.2,
          ease: "power2.inOut",
          delay: 0.3,
        });
      }

      // Problem cards: scattered, jitter in
      problemCards.current.forEach((el, i) => {
        if (!el) return;
        gsap.from(el, {
          opacity: 0,
          y: 40,
          rotate: (i % 2 === 0 ? -1 : 1) * gsap.utils.random(6, 16),
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      gsap.from(".problem-copy", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        scrollTrigger: { trigger: ".problem-copy", start: "top 85%" },
      });

      // Solution cards: snap into a clean grid
      gsap.from(solutionCards.current, {
        opacity: 0,
        y: 24,
        scale: 0.92,
        rotate: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: ".solution-grid", start: "top 80%" },
      });

      gsap.from(".solution-copy", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        scrollTrigger: { trigger: ".solution-copy", start: "top 85%" },
      });

      // Feature cards
      gsap.from(featureCards.current, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: { trigger: ".features-grid", start: "top 85%" },
      });

      // CTA
      gsap.from(".cta-inner > *", {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        scrollTrigger: { trigger: ".cta", start: "top 85%" },
      });
    }, heroRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={heroRef} className="bg-neutral-50 text-neutral-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-6 bg-neutral-50/85 backdrop-blur-sm border-b border-neutral-200">
        <span className="font-serif font-bold text-xl">Round</span>
        <div className="hidden sm:flex gap-8 text-sm">
          <a href="#problem" className="opacity-75 hover:opacity-100">Problem</a>
          <a href="#solution" className="opacity-75 hover:opacity-100">Solution</a>
          <a href="#features" className="opacity-75 hover:opacity-100">Features</a>
        </div>
        <button className="bg-emerald-700 text-neutral-50 px-5 py-2.5 rounded-full text-sm font-medium">
          Request a demo
        </button>
      </nav>

      {/* Hero */}
      <header className="hero relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 sm:px-10 lg:px-16 overflow-hidden">
        <svg
          className="pulse-bg absolute top-1/2 left-0 w-full h-[220px] -translate-y-1/2 opacity-50 pointer-events-none"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            d="M0,100 L140,100 L170,40 L200,160 L230,100 L360,100 L390,60 L420,140 L450,100 L600,100 L630,20 L660,180 L690,100 L840,100 L865,80 L890,100 L1050,100 L1075,50 L1100,150 L1125,100 L1200,100"
            fill="none"
            stroke="#047857"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="eyebrow-brand relative font-mono text-xs tracking-[0.14em] text-emerald-700 mb-6">
          HOSPITAL STAFF, ONE ROSTER
        </span>
        <h1 className="font-serif font-semibold leading-[0.98] text-[clamp(3.2rem,9vw,7rem)]">
          <span className="hero-line block">Every shift,</span>
          <span className="hero-line block italic font-normal text-emerald-700">in rhythm.</span>
        </h1>
        <p className="hero-sub relative max-w-xl text-base sm:text-lg leading-relaxed opacity-70 mt-7 mb-10">
          Round replaces spreadsheets and group texts with one live pulse for your staff —
          schedules, swaps, and coverage, always in sync.
        </p>
        <div className="hero-cta relative flex gap-4">
          <button className="bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium">
            Request a demo
          </button>
          <button className="border border-neutral-200 px-7 py-3.5 rounded-full text-sm">
            See how it works
          </button>
        </div>
      </header>

      {/* Problem */}
      <section id="problem" className="grid md:grid-cols-2 gap-12 items-center px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="problem-copy">
          <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-3">
            THE PROBLEM
          </span>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl mb-5">
            Scheduling by spreadsheet breaks under real pressure.
          </h2>
          <ul className="flex flex-col gap-3.5">
            {PROBLEMS.map((p) => (
              <li key={p} className="relative pl-6 text-[0.98rem] leading-relaxed opacity-78">
                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4">
          {SHIFTS.map((s, i) => (
            <ShiftCard
              key={s.id}
              s={s}
              extraClass={SCATTER[i]}
              innerRef={(el) => (problemCards.current[i] = el)}
            />
          ))}
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="bg-emerald-950 text-neutral-50 grid md:grid-cols-2 gap-12 items-center px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="solution-copy">
          <span className="block font-mono text-xs tracking-[0.14em] text-emerald-400 mb-3">
            THE SOLUTION
          </span>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl mb-5">
            One roster, live, for every ward.
          </h2>
          <p className="text-base leading-relaxed text-neutral-50/70">
            The same shifts. No longer scattered — visible, current, and confirmed, for
            everyone who needs to see them.
          </p>
        </div>
        <div className="solution-grid grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SHIFTS.map((s, i) => (
            <ShiftCard
              key={s.id}
              s={s}
              dark
              extraClass="!border-emerald-500"
              innerRef={(el) => (solutionCards.current[i] = el)}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-emerald-950 text-neutral-50 px-6 sm:px-10 lg:px-16 pt-4 sm:pt-8 pb-20 sm:pb-28">
        <span className="block text-center font-mono text-xs tracking-[0.14em] text-emerald-400">
          HOW ROUND HELPS
        </span>
        <div className="features-grid mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              ref={(el) => (featureCards.current[i] = el)}
              className="bg-emerald-900 rounded-2xl px-6 py-7 flex flex-col gap-3"
            >
              <Icon size={22} strokeWidth={1.6} color="#34d399" />
              <h3 className="font-serif font-semibold text-lg">{title}</h3>
              <p className="text-sm leading-relaxed text-neutral-50/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta px-6 py-28 sm:py-32 text-center">
        <div className="cta-inner max-w-lg mx-auto flex flex-col items-center gap-4">
          <h2 className="font-serif font-semibold text-4xl sm:text-5xl">
            Bring rhythm to your roster.
          </h2>
          <p className="opacity-70 mb-1.5">
            See Round with your own wards, shifts, and staff.
          </p>
          <button className="bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium">
            Request a demo
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
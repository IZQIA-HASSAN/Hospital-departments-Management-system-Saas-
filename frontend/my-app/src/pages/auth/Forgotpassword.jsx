import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ArrowRight, ArrowLeft, MailCheck } from "lucide-react";

const GHOST_CARDS = [
  { id: "02", name: "N. Alvarez", time: "15:00–23:00", ward: "ER" },
  { id: "06", name: "M. Duarte", time: "23:00–07:00", ward: "Peds" },
  { id: "03", name: "Dr. S. Patel", time: "23:00–07:00", ward: "ICU" },
];

export default function Forgotpassword() {
  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.inOut",
          delay: 0.2,
        });
      }

      gsap.from(".brand-mark", { opacity: 0, y: 12, duration: 0.5 });
      gsap.from(".ghost-card", {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.7,
        delay: 0.4,
        ease: "power2.out",
      });
      gsap.from(".auth-field", {
        opacity: 0,
        y: 14,
        stagger: 0.08,
        duration: 0.5,
        delay: 0.2,
        ease: "power2.out",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!sent) return;
    gsap.fromTo(
      ".confirm-block > *",
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "power2.out" }
    );
  }, [sent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // wire up password-reset request here
    setSent(true);
  };

  return (
    <div ref={rootRef} className="min-h-screen grid lg:grid-cols-2 bg-neutral-50 text-neutral-900">
      {/* Brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between bg-emerald-950 text-neutral-50 px-14 py-12 overflow-hidden">
        <svg
          className="absolute top-1/2 left-0 w-full h-[260px] -translate-y-1/2 opacity-40 pointer-events-none"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            d="M0,100 L140,100 L170,40 L200,160 L230,100 L360,100 L390,60 L420,140 L450,100 L600,100 L630,20 L660,180 L690,100 L840,100 L865,80 L890,100 L1050,100 L1075,50 L1100,150 L1125,100 L1200,100"
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="brand-mark relative font-serif font-bold text-xl">Round</span>

        <div className="relative">
          <span className="block font-mono text-xs tracking-[0.14em] text-emerald-400 mb-4">
            ACCOUNT RECOVERY
          </span>
          <h1 className="font-serif font-semibold text-4xl xl:text-5xl leading-[1.05] mb-6 max-w-md">
            Losing a password shouldn't cost you a shift.
          </h1>
          <p className="text-neutral-50/60 max-w-sm leading-relaxed">
            We'll send a secure link to your work email so you're back on the roster in minutes.
          </p>
        </div>

        <div className="relative flex flex-col gap-3 max-w-[220px]">
          {GHOST_CARDS.map((s) => (
            <div
              key={s.id}
              className="ghost-card bg-emerald-900/70 border border-emerald-800 rounded-xl px-4 py-3 flex flex-col gap-0.5 text-sm backdrop-blur-sm"
            >
              <span className="font-mono text-[0.7rem] text-emerald-400">{s.id}</span>
              <span className="font-semibold">{s.name}</span>
              <span className="font-mono text-xs opacity-60">{s.time} · {s.ward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-16">
        <div className="w-full max-w-sm mx-auto">
          <span className="lg:hidden block font-serif font-bold text-xl mb-10">Round</span>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wide text-neutral-500 hover:text-emerald-700 mb-8"
          >
            <ArrowLeft size={14} />
            BACK TO SIGN IN
          </Link>

          {!sent ? (
            <>
              <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-3">
                RESET PASSWORD
              </span>
              <h2 className="font-serif font-semibold text-3xl sm:text-4xl mb-2">
                Forgot your password?
              </h2>
              <p className="text-sm opacity-60 mb-10 leading-relaxed">
                Enter the email you use to sign in, and we'll send a link to set a new one.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                <div className="auth-field flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-mono text-xs tracking-wide text-neutral-500">
                    WORK EMAIL
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.org"
                    className="bg-transparent border-b border-neutral-300 py-2.5 text-[0.98rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="auth-field group bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
                >
                  Send reset link
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="confirm-block flex flex-col gap-5">
              <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <MailCheck size={20} className="text-emerald-700" />
              </div>
              <div>
                <h2 className="font-serif font-semibold text-3xl sm:text-4xl mb-2">Check your inbox.</h2>
                <p className="text-sm opacity-70 leading-relaxed">
                  If an account exists for <span className="font-medium text-neutral-900">{email}</span>,
                  a reset link is on its way. It'll expire in 30 minutes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-sm text-emerald-700 font-medium hover:underline text-left w-fit"
              >
                Didn't get it? Try a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
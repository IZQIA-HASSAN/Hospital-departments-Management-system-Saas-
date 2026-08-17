import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// lucide-react 1.0 removed all brand/logo icons (Twitter, LinkedIn, GitHub, etc.)
// so these two are small inline SVGs instead of package imports.
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.368-1.85 3.598 0 4.263 2.368 4.263 5.452v6.289zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

const LINKS = {
  Product: ["Live roster", "Shift swaps", "Credential tracking", "Coverage alerts"],
  Company: ["About", "Careers", "Contact"],
  Resources: ["Help center", "Security", "Status"],
};

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-reveal", {
        opacity: 0,
        y: 24,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-emerald-950 text-neutral-50 px-6 sm:px-10 lg:px-16 pt-16 pb-8"
    >
      <div className="footer-reveal grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] pb-14 border-b border-white/10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <span className="font-serif font-bold text-2xl">Round</span>
          <p className="text-sm leading-relaxed text-neutral-50/60 max-w-xs">
            One live pulse for your hospital's staff — schedules, swaps, and
            coverage, always in sync.
          </p>
         
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, items]) => (
          <div key={heading} className="footer-reveal flex flex-col gap-3">
            <span className="font-mono text-xs tracking-[0.14em] text-neutral-50/40">
              {heading.toUpperCase()}
            </span>
            <ul className="flex flex-col gap-2.5">
              {items.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-neutral-50/70 hover:text-neutral-50 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="footer-reveal flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
        <span className="text-xs text-neutral-50/40">
          © {new Date().getFullYear()} Round. All rights reserved.
        </span>
        <div className="flex items-center gap-4">
          <a href="mailto:hello@round.app" aria-label="Email" className="text-neutral-50/50 hover:text-neutral-50">
            <Mail size={16} strokeWidth={1.6} />
          </a>
          <a href="#" aria-label="X (Twitter)" className="text-neutral-50/50 hover:text-neutral-50">
            <XIcon />
          </a>
          <a href="#" aria-label="LinkedIn" className="text-neutral-50/50 hover:text-neutral-50">
            <LinkedinIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
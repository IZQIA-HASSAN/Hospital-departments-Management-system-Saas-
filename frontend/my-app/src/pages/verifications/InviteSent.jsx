import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ArrowRight, Mail } from "lucide-react";

function InviteSent() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // draw the pulse line, same beat as the login screen
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: "power2.inOut",
          delay: 0.15,
        });
      }

      // confirmation ring settles in after the line resolves
      if (ringRef.current) {
        gsap.from(ringRef.current, {
          scale: 0.6,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(1.8)",
          delay: 1.3,
        });
      }

      gsap.from(".brand-mark", { opacity: 0, y: 12, duration: 0.5 });
      gsap.from(".confirm-field", {
        opacity: 0,
        y: 14,
        stagger: 0.08,
        duration: 0.5,
        delay: 1.5,
        ease: "power2.out",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-neutral-900 px-6 py-16"
    >
      <span className="brand-mark absolute top-10 left-6 sm:left-10 font-serif font-bold text-xl">
        Round
      </span>

      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center">
        {/* pulse-to-confirmation signature */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full opacity-70"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <path
              ref={pathRef}
              d="M0,50 L30,50 L38,25 L46,70 L54,50 L62,35 L70,50 L100,50"
              fill="none"
              stroke="#047857"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            ref={ringRef}
            className="relative w-14 h-14 rounded-full bg-emerald-700 flex items-center justify-center"
          >
            <Mail size={22} className="text-neutral-50" />
          </div>
        </div>

        <span className="confirm-field block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-3">
          INVITATION SENT
        </span>

        <h2 className="confirm-field font-serif font-semibold text-3xl sm:text-4xl mb-4 leading-tight">
          They're in the loop.
        </h2>

        <p className="confirm-field text-sm opacity-60 leading-relaxed mb-3">
          An invitation has been sent to
        </p>

        <div className="confirm-field bg-emerald-900/5 border border-emerald-800/20 rounded-xl px-4 py-3 mb-8 w-full">
          <span className="font-mono text-sm text-emerald-800 break-all">
            {email || "the staff member"}
          </span>
        </div>

        <p className="confirm-field text-sm opacity-60 leading-relaxed mb-10 max-w-xs">
          They'll need to open the link in that email to set a password and join the roster.
        </p>

        <button
          onClick={() => navigate("/admindash")}
          className="confirm-field group bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
        >
          Back to dashboard
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export default InviteSent;
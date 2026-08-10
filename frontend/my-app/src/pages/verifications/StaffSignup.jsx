import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { Eye, EyeOff, ArrowRight, ShieldAlert } from "lucide-react";

function StaffSignup() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | valid | invalid
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rootRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch(`http://localhost:5000/api/auth/verify-invite?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setEmail(data.email);
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  // pulse line: steady beat while loading, flatline on invalid, resolves on valid
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (status === "loading" && pathRef.current) {
        gsap.to(pathRef.current, {
          strokeDashoffset: -200,
          duration: 1.6,
          ease: "none",
          repeat: -1,
        });
      }

      if (status !== "loading") {
        gsap.from(".brand-mark", { opacity: 0, y: 12, duration: 0.5 });
        gsap.from(".signup-field", {
          opacity: 0,
          y: 14,
          stagger: 0.08,
          duration: 0.5,
          delay: 0.15,
          ease: "power2.out",
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [status]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }
      navigate("/Stafflogin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-neutral-900 px-6 py-16"
    >
      <span className="brand-mark absolute top-10 left-6 sm:left-10 font-serif font-bold text-xl">
        Round
      </span>

      {/* loading */}
      {status === "loading" && (
        <div className="flex flex-col items-center gap-6">
          <svg className="w-24 h-12 opacity-70" viewBox="0 0 200 50" aria-hidden="true">
            <path
              ref={pathRef}
              d="M0,25 L40,25 L48,10 L56,40 L64,25 L100,25 L108,10 L116,40 L124,25 L200,25"
              fill="none"
              stroke="#047857"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8,6"
            />
          </svg>
          <span className="font-mono text-xs tracking-[0.14em] text-emerald-700">
            VERIFYING INVITE LINK
          </span>
        </div>
      )}

      {/* invalid */}
      {status === "invalid" && (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center">
          <div className="signup-field w-14 h-14 rounded-full bg-neutral-900/5 border border-neutral-300 flex items-center justify-center mb-8">
            <ShieldAlert size={22} className="text-neutral-500" />
          </div>
          <span className="signup-field block font-mono text-xs tracking-[0.14em] text-neutral-500 mb-3">
            LINK EXPIRED
          </span>
          <h2 className="signup-field font-serif font-semibold text-3xl sm:text-4xl mb-4 leading-tight">
            This invite no longer works.
          </h2>
          <p className="signup-field text-sm opacity-60 leading-relaxed mb-10 max-w-xs">
            The link may have expired or already been used. Ask your admin to send a new one.
          </p>
          <Link
            to="/login"
            className="signup-field group bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
          >
            Back to log in
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      {/* valid */}
      {status === "valid" && (
        <div className="w-full max-w-sm mx-auto">
          <span className="signup-field block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-3">
            YOU'RE INVITED
          </span>
          <h2 className="signup-field font-serif font-semibold text-3xl sm:text-4xl mb-2">
            Complete your signup.
          </h2>
          <p className="signup-field text-sm opacity-60 mb-10">
            Set a password and you're on the roster.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-7">
            <div className="signup-field flex flex-col gap-1.5">
              <label htmlFor="email" className="font-mono text-xs tracking-wide text-neutral-500">
                WORK EMAIL
              </label>
              <input
                id="email"
                value={email}
                disabled
                className="bg-transparent border-b border-neutral-200 py-2.5 text-[0.98rem] outline-none text-neutral-400"
              />
            </div>

            <div className="signup-field flex flex-col gap-1.5">
              <label htmlFor="name" className="font-mono text-xs tracking-wide text-neutral-500">
                FULL NAME
              </label>
              <input
                id="name"
                name="name"
                required
                value={form.name}
                onChange={onChange}
                placeholder="Dr. Jane Doe"
                className="bg-transparent border-b border-neutral-300 py-2.5 text-[0.98rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
              />
            </div>

            <div className="signup-field flex flex-col gap-1.5">
              <label htmlFor="title" className="font-mono text-xs tracking-wide text-neutral-500">
                TITLE
              </label>
              <input
                id="title"
                name="title"
                required
                value={form.title}
                onChange={onChange}
                placeholder="e.g. Dr., RN, Staff Nurse"
                className="bg-transparent border-b border-neutral-300 py-2.5 text-[0.98rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
              />
            </div>

            <div className="signup-field flex flex-col gap-1.5">
              <label htmlFor="password" className="font-mono text-xs tracking-wide text-neutral-500">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-neutral-300 py-2.5 pr-8 text-[0.98rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="signup-field text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="signup-field group bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create account"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default StaffSignup;
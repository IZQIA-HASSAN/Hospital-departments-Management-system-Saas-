import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const SHIFTS = [
  { id: "01", name: "Dr. R. Khan", time: "07:00–15:00", ward: "ICU" },
  { id: "03", name: "Dr. S. Patel", time: "23:00–07:00", ward: "ICU" },
  { id: "05", name: "Dr. L. Chen", time: "15:00–23:00", ward: "ER" },
];

export default function Login() {
  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Single unified endpoint — backend checks both User and Staff tables
  // and returns whichever account matches. No role selection needed client-side.
  const login = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : "/staff");
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    login.mutate(form);
  };

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
            WELCOME BACK
          </span>
          <h1 className="font-serif font-semibold text-4xl xl:text-5xl leading-[1.05] mb-6 max-w-md">
            The floor is quiet when the roster isn't guessing.
          </h1>
          <p className="text-neutral-50/60 max-w-sm leading-relaxed">
            Sign in to see who's covering what, right now, across every ward.
          </p>
        </div>

        <div className="relative flex flex-col gap-3 max-w-[220px]">
          {SHIFTS.map((s) => (
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

          <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-3">
            SIGN IN
          </span>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl mb-2">Welcome back.</h2>
          <p className="text-sm opacity-60 mb-10">
            New to Round?{" "}
            <Link to="/signup" className="text-emerald-700 font-medium hover:underline">
              Create an account
            </Link>
          </p>

          {login.isError && (
            <p className="auth-field text-sm text-red-600 mb-4">{login.error.message}</p>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-7">
            <div className="auth-field flex flex-col gap-1.5">
              <label htmlFor="email" className="font-mono text-xs tracking-wide text-neutral-500">
                WORK EMAIL
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="you@hospital.org"
                className="bg-transparent border-b border-neutral-300 py-2.5 text-[0.98rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
              />
            </div>

            <div className="auth-field flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-mono text-xs tracking-wide text-neutral-500">
                  PASSWORD
                </label>
                <Link to="/forgotpassword" className="text-xs text-emerald-700 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  name="password"
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

            <label className="auth-field flex items-center gap-2.5 text-sm opacity-70 -mt-1">
              <input type="checkbox" className="accent-emerald-700 w-3.5 h-3.5" />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={login.isPending}
              className="auth-field group bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-60"
            >
              {login.isPending ? "Logging in..." : "Log In"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
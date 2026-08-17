import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

function StaffLogin() {
  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const login = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("http://localhost:5000/api/auth/staff-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/staff");
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
          duration: 1.6,
          ease: "power2.inOut",
          delay: 0.15,
        });
      }

      gsap.from(".brand-mark", { opacity: 0, y: 12, duration: 0.5 });
      gsap.from(".login-field", {
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
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-neutral-900 px-6 py-16"
    >
      <span className="brand-mark absolute top-10 left-6 sm:left-10 font-serif font-bold text-xl">
        Round
      </span>

      <div className="w-full max-w-sm mx-auto">
        <div className="login-field w-14 h-14 mb-6 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
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
        </div>

        <span className="login-field block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-3">
          STAFF SIGN IN
        </span>
        <h2 className="login-field font-serif font-semibold text-3xl sm:text-4xl mb-2">
          Welcome back.
        </h2>
        <p className="login-field text-sm opacity-60 mb-10">
          Sign in with the email and password from your invite.
        </p>

        {login.isError && (
          <p className="login-field text-sm text-red-600 mb-4">{login.error.message}</p>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-7">
          <div className="login-field flex flex-col gap-1.5">
            <label htmlFor="email" className="font-mono text-xs tracking-wide text-neutral-500">
              WORK EMAIL
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={form.email}
              onChange={onChange}
              placeholder="you@hospital.org"
              className="bg-transparent border-b border-neutral-300 py-2.5 text-[0.98rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
            />
          </div>

          <div className="login-field flex flex-col gap-1.5">
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

          <button
            type="submit"
            disabled={login.isPending}
            className="login-field group bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-60"
          >
            {login.isPending ? "Signing in..." : "Sign in"}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <p className="login-field text-sm opacity-60 mt-8 text-center">
          Not staff?{" "}
          <Link to="/login" className="text-emerald-700 font-medium hover:underline">
            Go to admin login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default StaffLogin;
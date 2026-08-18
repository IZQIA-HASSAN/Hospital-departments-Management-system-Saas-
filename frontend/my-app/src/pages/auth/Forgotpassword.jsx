import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Mail } from "lucide-react";

export default function Forgotpassword() {
  const [email, setEmail] = useState("");

  const forgotPassword = useMutation({
    mutationFn: async (email) => {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      return data;
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    forgotPassword.mutate(email);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 sm:px-10 bg-neutral-50 text-neutral-900">
      <div className="w-full max-w-sm mx-auto">
        <span className="block font-serif font-bold text-xl mb-10">Round</span>

        <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-3">
          RESET PASSWORD
        </span>
        <h2 className="font-serif font-semibold text-3xl sm:text-4xl mb-2">
          Forgot your password?
        </h2>
        <p className="text-sm opacity-60 mb-10">
          Enter your email and we'll send you a reset link.
        </p>

        {forgotPassword.isSuccess ? (
          <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-6 flex flex-col items-center text-center gap-3">
            <Mail className="text-emerald-700" size={28} />
            <p className="font-serif text-lg font-semibold">Check your email</p>
            <p className="text-sm opacity-60">
              If that email is registered, a reset link is on its way. It expires in 15 minutes.
            </p>
            <Link to="/login" className="text-sm text-emerald-700 font-medium hover:underline mt-2">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-7">
            <div className="flex flex-col gap-1.5">
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

            {forgotPassword.isError && (
              <p className="text-sm text-red-600">{forgotPassword.error.message}</p>
            )}

            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="group bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-60"
            >
              {forgotPassword.isPending ? "Sending..." : "Send reset link"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>

            <Link to="/login" className="text-sm text-neutral-500 hover:underline text-center">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState("");

  const resetPassword = useMutation({
    mutationFn: async ({ token, password }) => {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      setTimeout(() => navigate("/login"), 2000);
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    resetPassword.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 sm:px-10 bg-neutral-50 text-neutral-900">
        <div className="w-full max-w-sm mx-auto text-center">
          <p className="font-serif text-xl font-semibold mb-2">Invalid link</p>
          <p className="text-sm opacity-60 mb-6">
            This password reset link is missing its token. Please request a new one.
          </p>
          <Link to="/forgotpassword" className="text-sm text-emerald-700 font-medium hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 sm:px-10 bg-neutral-50 text-neutral-900">
      <div className="w-full max-w-sm mx-auto">
        <span className="block font-serif font-bold text-xl mb-10">Round</span>

        <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-3">
          RESET PASSWORD
        </span>
        <h2 className="font-serif font-semibold text-3xl sm:text-4xl mb-10">
          Set a new password.
        </h2>

        {resetPassword.isSuccess ? (
          <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-6 text-center">
            <p className="font-serif text-lg font-semibold mb-1">Password updated</p>
            <p className="text-sm opacity-60">Taking you back to login…</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-7">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="font-mono text-xs tracking-wide text-neutral-500">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="font-mono text-xs tracking-wide text-neutral-500">
                CONFIRM PASSWORD
              </label>
              <input
                id="confirmPassword"
                type={showPw ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-b border-neutral-300 py-2.5 text-[0.98rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
              />
            </div>

            {(formError || resetPassword.isError) && (
              <p className="text-sm text-red-600">
                {formError || resetPassword.error.message}
              </p>
            )}

            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="group bg-emerald-700 text-neutral-50 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-60"
            >
              {resetPassword.isPending ? "Updating..." : "Update password"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
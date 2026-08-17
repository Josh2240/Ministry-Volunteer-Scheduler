"use client";

import Link from "next/link";
import { useState } from "react";

const STORAGE_USERS = "church_users";

type Role = "system-admin" | "user-admin";

type AppUser = {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  church: string;
};

const defaultUsers: AppUser[] = [
  {
    id: 1,
    fullName: "Pastor Daniel Moore",
    email: "admin@church.org",
    password: "admin123",
    role: "system-admin",
    church: "Grace City Church",
  },
  {
    id: 2,
    fullName: "Martha Wilson",
    email: "member@church.org",
    password: "member123",
    role: "user-admin",
    church: "Grace City Church",
  },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      setMessage("");
      return;
    }

    const storedUsers = (() => {
      if (typeof window === "undefined") return defaultUsers;
      const raw = window.localStorage.getItem(STORAGE_USERS);
      if (!raw) {
        window.localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
        return defaultUsers;
      }

      try {
        return JSON.parse(raw) as AppUser[];
      } catch {
        window.localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
        return defaultUsers;
      }
    })();

    const match = storedUsers.find((user) => user.email.toLowerCase() === trimmedEmail);

    if (!match) {
      setError("No account was found for that email.");
      setMessage("");
      return;
    }

    setError("");
    setMessage(`Password reset link sent to ${match.email}. Please check your inbox.`);

    if (typeof window !== "undefined") {
      const resetMessage = `Hello ${match.fullName},\n\nA password reset was requested for your church account.\n\nYour email: ${match.email}\nYour current password: ${match.password}\n\nPlease use this information to sign in and change your password from the account settings.\n\nRegards,\nChurch Access Team`;
      window.alert(resetMessage);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-slate-950/60">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Reset access</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Forgot password</h1>
          <p className="mt-2 text-sm text-slate-400">Enter the email for your church account and we will send a reset message.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
              placeholder="name@church.org"
            />
          </label>

          {error && <p className="text-sm text-rose-300">{error}</p>}
          {message && <p className="text-sm text-emerald-300">{message}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Back to{' '}
          <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
            login
          </Link>
        </p>
      </div>
    </main>
  );
}

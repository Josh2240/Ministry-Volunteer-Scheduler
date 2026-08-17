"use client";

import { useState } from "react";
import Link from "next/link";

const STORAGE_USERS = "church_users";
const STORAGE_SESSION = "church_session";

type Role = "system-admin" | "user-admin";

type AppUser = {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  church: string;
};

const seedUsers: AppUser[] = [
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

function getUsers() {
  if (typeof window === "undefined") return seedUsers;

  const stored = window.localStorage.getItem(STORAGE_USERS);
  if (!stored) {
    window.localStorage.setItem(STORAGE_USERS, JSON.stringify(seedUsers));
    return seedUsers;
  }

  try {
    return JSON.parse(stored) as AppUser[];
  } catch {
    window.localStorage.setItem(STORAGE_USERS, JSON.stringify(seedUsers));
    return seedUsers;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const users = getUsers();
    const foundUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase().trim() && user.password === password,
    );

    if (!foundUser) {
      setError("Invalid email or password.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_SESSION, JSON.stringify(foundUser));
      window.location.href = "/";
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-slate-950/60">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Church Access</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to manage volunteers and ministry scheduling.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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

          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Login
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-400">
          <Link href="/forgot-password" className="font-medium text-emerald-300 hover:text-emerald-200">
            Forgot password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link href="/register" className="font-medium text-emerald-300 hover:text-emerald-200">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

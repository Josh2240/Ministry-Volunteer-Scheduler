"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-black">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white overflow-hidden shadow-lg">
              <Image
                src="/coastlight-logo.jpg"
                alt="Coastlight Church Logo"
                width={112}
                height={112}
                unoptimized
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-black">Coastlight Church</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to manage volunteers and ministry scheduling.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block text-sm text-gray-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none placeholder:text-gray-400 focus:border-blue-500"
              placeholder="name@church.org"
            />
          </label>

          <label className="block text-sm text-gray-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none placeholder:text-gray-400 focus:border-blue-500"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-600">
          <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">
            Forgot password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Need an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

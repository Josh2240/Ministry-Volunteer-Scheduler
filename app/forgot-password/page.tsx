"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

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
          <h1 className="text-3xl font-semibold text-black">Forgot password</h1>
          <p className="mt-2 text-sm text-gray-600">Enter the email for your church account and we will send a reset message.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
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

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-blue-600">{message}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Back to{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            login
          </Link>
        </p>
      </div>
    </main>
  );
}

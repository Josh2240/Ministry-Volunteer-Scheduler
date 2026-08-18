"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

type Role = "system-admin" | "user-admin";

type AppUser = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  church: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setMessage(`Password reset link sent to ${data.email}. Please check your inbox.`);

      const resetMessage = `Hello ${data.fullName},\n\nA password reset was requested for your church account.\n\nYour email: ${data.email}\nYour current password: [redacted]\n\nPlease use this information to sign in and change your password from the account settings.\n\nRegards,\nChurch Access Team`;
      alert(resetMessage);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
              required
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-blue-600">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
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

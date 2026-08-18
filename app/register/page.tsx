"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Role = "system-admin" | "user-admin";
type Team = "Ushers" | "Worship Team" | "Tech Crew" | "Sunday School" | "Preacher";
type Availability = "Available" | "Backup" | "On Call";

const ministryRolesByTeam: Record<Team, string[]> = {
  Ushers: ["Usher", "Usher Lead", "Greeter", "Prayer Team"],
  "Worship Team": ["Drummer", "Bassist", "Singer", "Guitarist", "Keyboardist", "Sound Technician"],
  "Tech Crew": ["Camera Operator", "Live Stream", "Audio Technician", "Lighting Technician", "Projection"],
  "Sunday School": ["Teacher", "Helper", "Nursery", "Youth Mentor"],
  Preacher: ["Senior Pastor", "Associate Pastor", "Youth Pastor", "Prayer Pastor", "Guest Speaker"],
};

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [church, setChurch] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user-admin");
  const [team, setTeam] = useState<Team>("Worship Team");
  const [ministryRole, setMinistryRole] = useState<string>(ministryRolesByTeam["Worship Team"][0]);
  const [availability, setAvailability] = useState<Availability>("Available");
  const [nextAssignment, setNextAssignment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedChurch = church.trim();

    if (!trimmedName || !trimmedEmail || !password || !trimmedChurch || !nextAssignment.trim()) {
      setMessage("Please complete all fields, including your ministry assignment.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          password,
          role,
          church: trimmedChurch,
          team,
          ministryRole,
          availability,
          nextAssignment: nextAssignment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Registration failed.");
        return;
      }

      router.push("/");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-black">
      <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
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
          <h1 className="text-3xl font-semibold text-black">Register ministry staff</h1>
          <p className="mt-2 text-sm text-gray-600">Set up a system admin or member admin account.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <label className="block text-sm text-gray-700">
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
              placeholder="John Smith"
              required
            />
          </label>

          <label className="block text-sm text-gray-700">
            Church name
            <input
              value={church}
              onChange={(event) => setChurch(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
              placeholder="Grace City Church"
              required
            />
          </label>

          <label className="block text-sm text-gray-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
              placeholder="name@church.org"
              required
            />
          </label>

          <label className="block text-sm text-gray-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
              placeholder="Create a password"
              required
            />
          </label>

          <label className="block text-sm text-gray-700">
            Account type
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
            >
              <option value="system-admin">System Admin</option>
              <option value="user-admin">User Admin</option>
            </select>
          </label>

          <label className="block text-sm text-gray-700">
            Team
            <select
              value={team}
              onChange={(event) => {
                const selectedTeam = event.target.value as Team;
                setTeam(selectedTeam);
                setMinistryRole(ministryRolesByTeam[selectedTeam][0]);
              }}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
            >
              <option value="Ushers">Ushers</option>
              <option value="Worship Team">Worship Team</option>
              <option value="Tech Crew">Tech Crew</option>
              <option value="Sunday School">Sunday School</option>
              <option value="Preacher">Preacher</option>
            </select>
          </label>

          <label className="block text-sm text-gray-700">
            Ministry role
            <select
              value={ministryRole}
              onChange={(event) => setMinistryRole(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
            >
              {ministryRolesByTeam[team].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-gray-700">
            Availability
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value as Availability)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
            >
              <option value="Available">Available</option>
              <option value="Backup">Backup</option>
              <option value="On Call">On Call</option>
            </select>
          </label>

          <label className="block text-sm text-gray-700">
            Next assignment
            <input
              value={nextAssignment}
              onChange={(event) => setNextAssignment(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-blue-500"
              placeholder="Main Entrance"
              required
            />
          </label>

          {message && <p className="text-sm text-yellow-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}

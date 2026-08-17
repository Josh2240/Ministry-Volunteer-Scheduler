"use client";

import Link from "next/link";
import { useState } from "react";

const STORAGE_USERS = "church_users";
const STORAGE_SESSION = "church_session";

type Role = "system-admin" | "user-admin";
type Team = "Ushers" | "Worship Team" | "Tech Crew" | "Sunday School";
type Availability = "Available" | "Backup" | "On Call";

type AppUser = {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  church: string;
  team: Team;
  ministryRole: string;
  availability: Availability;
  nextAssignment: string;
};

const defaultUsers: AppUser[] = [
  {
    id: 1,
    fullName: "Pastor Daniel Moore",
    email: "admin@church.org",
    password: "admin123",
    role: "system-admin",
    church: "Grace City Church",
    team: "Worship Team",
    ministryRole: "Pastor",
    availability: "Available",
    nextAssignment: "Sunday service",
  },
  {
    id: 2,
    fullName: "Martha Wilson",
    email: "member@church.org",
    password: "member123",
    role: "user-admin",
    church: "Grace City Church",
    team: "Ushers",
    ministryRole: "Usher Lead",
    availability: "Available",
    nextAssignment: "Main entrance",
  },
];

const ministryRolesByTeam: Record<Team, string[]> = {
  Ushers: ["Usher", "Usher Lead", "Greeter", "Prayer Team"],
  "Worship Team": ["Drummer", "Bassist", "Singer", "Guitarist", "Keyboardist", "Sound Technician"],
  "Tech Crew": ["Camera Operator", "Live Stream", "Audio Technician", "Lighting Technician", "Projection"],
  "Sunday School": ["Teacher", "Helper", "Nursery", "Youth Mentor"],
};

export default function RegisterPage() {
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

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedChurch = church.trim();

    if (!trimmedName || !trimmedEmail || !password || !trimmedChurch || !nextAssignment.trim()) {
      setMessage("Please complete all fields, including your ministry assignment.");
      return;
    }

    const existingUsers = (() => {
      if (typeof window === "undefined") return defaultUsers;
      const stored = window.localStorage.getItem(STORAGE_USERS);
      if (!stored) {
        window.localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
        return defaultUsers;
      }

      try {
        return JSON.parse(stored) as AppUser[];
      } catch {
        window.localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
        return defaultUsers;
      }
    })();

    const emailExists = existingUsers.some(
      (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase(),
    );

    if (emailExists) {
      setMessage("That email is already registered.");
      return;
    }

    const newUser: AppUser = {
      id: Date.now(),
      fullName: trimmedName,
      email: trimmedEmail,
      password,
      role,
      church: trimmedChurch,
      team,
      ministryRole,
      availability,
      nextAssignment: nextAssignment.trim(),
    };

    const updatedUsers = [...existingUsers, newUser];

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_USERS, JSON.stringify(updatedUsers));
      window.localStorage.setItem(STORAGE_SESSION, JSON.stringify(newUser));
      window.location.href = "/";
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-slate-950/60">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Register ministry staff</h1>
          <p className="mt-2 text-sm text-slate-400">Set up a system admin or member admin account.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <label className="block text-sm text-slate-300">
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
              placeholder="John Smith"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Church name
            <input
              value={church}
              onChange={(event) => setChurch(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
              placeholder="Grace City Church"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
              placeholder="name@church.org"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
              placeholder="Create a password"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Account type
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
            >
              <option value="system-admin">System Admin</option>
              <option value="user-admin">User Admin</option>
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Team
            <select
              value={team}
              onChange={(event) => {
                const selectedTeam = event.target.value as Team;
                setTeam(selectedTeam);
                setMinistryRole(ministryRolesByTeam[selectedTeam][0]);
              }}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
            >
              <option value="Ushers">Ushers</option>
              <option value="Worship Team">Worship Team</option>
              <option value="Tech Crew">Tech Crew</option>
              <option value="Sunday School">Sunday School</option>
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Ministry role
            <select
              value={ministryRole}
              onChange={(event) => setMinistryRole(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
            >
              {ministryRolesByTeam[team].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Availability
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value as Availability)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
            >
              <option value="Available">Available</option>
              <option value="Backup">Backup</option>
              <option value="On Call">On Call</option>
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Next assignment
            <input
              value={nextAssignment}
              onChange={(event) => setNextAssignment(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
              placeholder="Main Entrance"
            />
          </label>

          {message && <p className="text-sm text-amber-300">{message}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}

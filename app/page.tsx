"use client";

import { useMemo, useState } from "react";

type Team = "All" | "Ushers" | "Worship Team" | "Tech Crew" | "Sunday School";

type Volunteer = {
  id: number;
  name: string;
  team: Exclude<Team, "All">;
  contact: string;
  availability: "Available" | "Backup" | "On Call";
  nextAssignment: string;
};

type ScheduleSlot = {
  title: string;
  time: string;
  team: Exclude<Team, "All">;
  assigned: string[];
  openSpots: number;
  status: "Ready" | "Needs Coverage";
};

type StewardshipRecord = {
  date: string;
  category: string;
  amount: string;
  note: string;
  status: "Cleared" | "Pending";
};

const volunteers: Volunteer[] = [
  { id: 1, name: "Alicia James", team: "Ushers", contact: "(555) 101-2041", availability: "Available", nextAssignment: "Main Entrance" },
  { id: 2, name: "Marcus Lee", team: "Worship Team", contact: "(555) 010-4104", availability: "Available", nextAssignment: "Lead Guitar" },
  { id: 3, name: "Sofia Reed", team: "Tech Crew", contact: "(555) 822-9915", availability: "On Call", nextAssignment: "Live Stream" },
  { id: 4, name: "Daniel Hayes", team: "Sunday School", contact: "(555) 204-6908", availability: "Available", nextAssignment: "Preschool Room" },
  { id: 5, name: "Grace Solomon", team: "Ushers", contact: "(555) 403-2112", availability: "Backup", nextAssignment: "Welcome Desk" },
  { id: 6, name: "Isaac Brooks", team: "Worship Team", contact: "(555) 304-1139", availability: "Available", nextAssignment: "Vocals" },
  { id: 7, name: "Maya Patel", team: "Tech Crew", contact: "(555) 120-8802", availability: "Available", nextAssignment: "Lighting Console" },
  { id: 8, name: "Elijah Stone", team: "Sunday School", contact: "(555) 913-4401", availability: "Available", nextAssignment: "Middle School" },
];

const schedule: ScheduleSlot[] = [
  { title: "Sunday Morning Worship", time: "8:30 AM", team: "Ushers", assigned: ["Alicia James", "Grace Solomon"], openSpots: 2, status: "Ready" },
  { title: "Worship Team Rehearsal", time: "9:15 AM", team: "Worship Team", assigned: ["Marcus Lee", "Isaac Brooks"], openSpots: 1, status: "Needs Coverage" },
  { title: "Streaming & Audio", time: "10:00 AM", team: "Tech Crew", assigned: ["Sofia Reed", "Maya Patel"], openSpots: 1, status: "Ready" },
  { title: "Children's Classes", time: "10:30 AM", team: "Sunday School", assigned: ["Daniel Hayes", "Elijah Stone"], openSpots: 3, status: "Ready" },
];

const stewardship: StewardshipRecord[] = [
  { date: "2026-08-09", category: "Tithes & Offerings", amount: "$4,280.00", note: "Sunday service donation", status: "Cleared" },
  { date: "2026-08-09", category: "Mission Fund", amount: "$640.00", note: "Community outreach", status: "Cleared" },
  { date: "2026-08-10", category: "Youth Camp", amount: "$1,150.00", note: "Pending deposit", status: "Pending" },
  { date: "2026-08-12", category: "Facility Maintenance", amount: "$780.00", note: "Sound booth repairs", status: "Pending" },
];

const teamOptions: Team[] = ["All", "Ushers", "Worship Team", "Tech Crew", "Sunday School"];

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<Team>("All");

  const filteredVolunteers = useMemo(() => {
    if (selectedTeam === "All") return volunteers;
    return volunteers.filter((person) => person.team === selectedTeam);
  }, [selectedTeam]);

  const totalAssigned = schedule.reduce((sum, slot) => sum + slot.assigned.length, 0);
  const totalOpenSpots = schedule.reduce((sum, slot) => sum + slot.openSpots, 0);
  const readyCount = schedule.filter((slot) => slot.status === "Ready").length;

  const stats = [
    { label: "Total volunteers", value: `${volunteers.length}`, track: "bg-emerald-500/20", fill: "bg-emerald-400" },
    { label: "Filled positions", value: `${totalAssigned}`, track: "bg-sky-500/20", fill: "bg-sky-400" },
    { label: "Open slots", value: `${totalOpenSpots}`, track: "bg-amber-500/20", fill: "bg-amber-400" },
    { label: "Ready rosters", value: `${readyCount}/4`, track: "bg-violet-500/20", fill: "bg-violet-400" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Ministry operations</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Ministry & Volunteer Scheduler</h1>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              4 services this week
            </div>
            <button className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              + Add assignment
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg shadow-slate-950/40">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
              <div className={`mt-4 h-1.5 rounded-full ${item.track}`}>
                <div className={`h-1.5 w-3/4 rounded-full ${item.fill}`} />
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900 p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Volunteer directory</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Team coverage filter</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamOptions.map((team) => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    selectedTeam === team
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {filteredVolunteers.map((person) => (
              <article key={person.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                    <p className="text-sm text-emerald-300">{person.team}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    person.availability === "Available"
                      ? "bg-emerald-500/15 text-emerald-200"
                      : person.availability === "Backup"
                        ? "bg-amber-500/15 text-amber-200"
                        : "bg-sky-500/15 text-sky-200"
                  }`}>
                    {person.availability}
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-slate-300">
                  <li>Contact: {person.contact}</li>
                  <li>Next: {person.nextAssignment}</li>
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Service roster</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">This week</h2>
              </div>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                {readyCount} ready
              </span>
            </div>

            <div className="space-y-4">
              {schedule.map((slot) => (
                <div key={slot.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{slot.title}</h3>
                      <p className="text-sm text-slate-400">{slot.time}</p>
                    </div>

                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      slot.status === "Ready"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-amber-500/15 text-amber-200"
                    }`}>
                      {slot.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-slate-400">
                    <span className="rounded-full bg-slate-800 px-2 py-1">{slot.team}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-1">{slot.openSpots} open spots</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {slot.assigned.map((name) => (
                      <span key={name} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Coverage status</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Needs attention</h3>

              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li className="rounded-xl bg-amber-500/10 p-3 text-amber-100">
                  Worship team rehearsal still needs 1 vocalist.
                </li>
                <li className="rounded-xl bg-sky-500/10 p-3 text-sky-100">
                  Tech crew needs a backup for livestream monitor.
                </li>
                <li className="rounded-xl bg-emerald-500/10 p-3 text-emerald-100">
                  Sunday School has enough leads for this week.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Financial stewardship</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Recent log</h3>

              <div className="mt-4 space-y-3">
                {stewardship.map((entry) => (
                  <div key={`${entry.date}-${entry.category}`} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-white">{entry.category}</p>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                        entry.status === "Cleared"
                          ? "bg-emerald-500/15 text-emerald-200"
                          : "bg-amber-500/15 text-amber-200"
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-emerald-300">{entry.amount}</p>
                    <p className="text-xs text-slate-400">{entry.date} • {entry.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

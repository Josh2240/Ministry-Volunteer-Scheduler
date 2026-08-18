"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "system-admin" | "user-admin";
type Team = "All" | "Ushers" | "Worship Team" | "Tech Crew" | "Sunday School" | "Preacher";

type AppUser = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  church: string;
  team?: string;
  ministryRole?: string;
  availability?: string;
  nextAssignment?: string;
};

type Volunteer = {
  id: number;
  name: string;
  team: string;
  contact: string;
  availability: string;
  nextAssignment: string;
};

type VolunteerFormState = {
  name: string;
  team: string;
  contact: string;
  availability: string;
  nextAssignment: string;
};

type ScheduleSlot = {
  title: string;
  time: string;
  team: string;
  assigned: string[];
  openSpots: number;
  status: "Ready" | "Needs Coverage";
};

const teamOptions: Team[] = ["All", "Ushers", "Worship Team", "Tech Crew", "Sunday School", "Preacher"];

const emptyVolunteerForm: VolunteerFormState = {
  name: "",
  team: "Ushers",
  contact: "",
  availability: "Available",
  nextAssignment: "",
};

function buildScheduleFromVolunteers(volunteers: Volunteer[]): ScheduleSlot[] {
  const getAssigned = (team: string) =>
    volunteers.filter((v) => v.team === team).map((v) => v.name);

  const schedule: ScheduleSlot[] = [
    {
      title: "Sunday Morning Worship",
      time: "8:30 AM",
      team: "Ushers",
      assigned: getAssigned("Ushers"),
      openSpots: 2,
      status: "Ready",
    },
    {
      title: "Worship Team Rehearsal",
      time: "9:15 AM",
      team: "Worship Team",
      assigned: getAssigned("Worship Team"),
      openSpots: 1,
      status: getAssigned("Worship Team").length >= 2 ? "Ready" : "Needs Coverage",
    },
    {
      title: "Streaming & Audio",
      time: "10:00 AM",
      team: "Tech Crew",
      assigned: getAssigned("Tech Crew"),
      openSpots: 1,
      status: "Ready",
    },
    {
      title: "Children's Classes",
      time: "10:30 AM",
      team: "Sunday School",
      assigned: getAssigned("Sunday School"),
      openSpots: 3,
      status: "Ready",
    },
    {
      title: "Preaching Team",
      time: "10:45 AM",
      team: "Preacher",
      assigned: getAssigned("Preacher"),
      openSpots: 1,
      status: getAssigned("Preacher").length >= 1 ? "Ready" : "Needs Coverage",
    },
  ];

  return schedule.map((slot) => ({
    ...slot,
    openSpots: Math.max(0, 3 - slot.assigned.length),
  }));
}

export default function Home() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team>("All");
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingOriginalName, setEditingOriginalName] = useState<string>("");
  const [formState, setFormState] = useState<VolunteerFormState>(emptyVolunteerForm);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        if (data.user) {
          setSessionUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    if (!sessionUser) return;

    const loadVolunteers = async () => {
      try {
        const res = await fetch("/api/volunteers", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setVolunteers(data);
          setSchedule(buildScheduleFromVolunteers(data));
        }
      } catch (error) {
        console.error("Failed to load volunteers:", error);
      }
    };

    loadVolunteers();
  }, [sessionUser]);

  const isSystemAdmin = sessionUser?.role === "system-admin";

  const filteredVolunteers = useMemo(() => {
    if (selectedTeam === "All") return volunteers;
    return volunteers.filter((person) => person.team === selectedTeam);
  }, [selectedTeam, volunteers]);

  const totalAssigned = schedule.reduce((sum, slot) => sum + slot.assigned.length, 0);
  const totalOpenSpots = schedule.reduce((sum, slot) => sum + slot.openSpots, 0);
  const readyCount = schedule.filter((slot) => slot.status === "Ready").length;

  const stats = [
    { label: "Total volunteers", value: `${volunteers.length}`, track: "bg-emerald-500/20", fill: "bg-emerald-400" },
    { label: "Filled positions", value: `${totalAssigned}`, track: "bg-sky-500/20", fill: "bg-sky-400" },
    { label: "Open slots", value: `${totalOpenSpots}`, track: "bg-amber-500/20", fill: "bg-amber-400" },
    { label: "Ready rosters", value: `${readyCount}/4`, track: "bg-violet-500/20", fill: "bg-violet-400" },
  ];

  const handleChange = (field: keyof VolunteerFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const openAddForm = () => {
    if (!isSystemAdmin) return;
    setEditingId(null);
    setEditingOriginalName("");
    setFormState(emptyVolunteerForm);
    setShowForm(true);
  };

  const openEditForm = (person: Volunteer) => {
    if (!isSystemAdmin) return;
    setEditingId(person.id);
    setEditingOriginalName(person.name);
    setFormState({
      name: person.name,
      team: person.team,
      contact: person.contact,
      availability: person.availability,
      nextAssignment: person.nextAssignment,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingOriginalName("");
    setFormState(emptyVolunteerForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSystemAdmin) return;

    const trimmedName = formState.name.trim();
    if (!trimmedName) {
      return;
    }

    try {
      if (editingId !== null) {
        const res = await fetch("/api/volunteers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            name: trimmedName,
            team: formState.team,
            contact: formState.contact,
            availability: formState.availability,
            nextAssignment: formState.nextAssignment,
          }),
        });

        if (res.ok) {
          const updated = await res.json();
          setVolunteers((current) =>
            current.map((person) =>
              person.id === editingId ? updated : person,
            ),
          );

          if (editingOriginalName && editingOriginalName !== trimmedName) {
            setSchedule((current) =>
              current.map((slot) => ({
                ...slot,
                assigned: slot.assigned.map((assignedName) =>
                  assignedName === editingOriginalName ? trimmedName : assignedName,
                ),
              })),
            );
          }
        }
      } else {
        const res = await fetch("/api/volunteers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            team: formState.team,
            contact: formState.contact,
            availability: formState.availability,
            nextAssignment: formState.nextAssignment,
          }),
        });

        if (res.ok) {
          const created = await res.json();
          setVolunteers((current) => [...current, created]);
        }
      }

      closeForm();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleDelete = async (person: Volunteer) => {
    if (!isSystemAdmin) return;

    try {
      const res = await fetch(`/api/volunteers?id=${person.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setVolunteers((current) => current.filter((entry) => entry.id !== person.id));
        setSchedule((current) =>
          current.map((slot) => ({
            ...slot,
            assigned: slot.assigned.filter((assignedName) => assignedName !== person.name),
          })),
        );
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  };

  if (loading || !sessionUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Ministry operations</p>
            <h1 className="mt-2 text-3xl font-semibold text-black">Ministry & Volunteer Scheduler</h1>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm text-blue-700">
              {sessionUser.role === "system-admin" ? "System Admin" : "User Admin"}
            </div>
            {isSystemAdmin ? (
              <button
                onClick={openAddForm}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Add volunteer
              </button>
            ) : (
              <div className="rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-600">
                View access only
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </header>

        {showForm && isSystemAdmin && (
          <section className="mb-8 rounded-2xl border border-blue-200 bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Volunteer record</p>
                <h2 className="mt-2 text-2xl font-semibold text-black">
                  {editingId !== null ? "Edit volunteer" : "Add volunteer"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-gray-700">
                Name
                <input
                  value={formState.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-black outline-none ring-0 placeholder:text-gray-400 focus:border-blue-500"
                  placeholder="Full name"
                />
              </label>

              <label className="block text-sm text-gray-700">
                Team
                <select
                  value={formState.team}
                  onChange={(event) => handleChange("team", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-blue-500"
                >
                  {teamOptions.filter((team) => team !== "All").map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-gray-700">
                Contact
                <input
                  value={formState.contact}
                  onChange={(event) => handleChange("contact", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-black outline-none placeholder:text-gray-400 focus:border-blue-500"
                  placeholder="(555) 000-0000"
                />
              </label>

              <label className="block text-sm text-gray-700">
                Availability
                <select
                  value={formState.availability}
                  onChange={(event) => handleChange("availability", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Backup">Backup</option>
                  <option value="On Call">On Call</option>
                </select>
              </label>

              <label className="block text-sm text-gray-700 md:col-span-2">
                Next assignment
                <input
                  value={formState.nextAssignment}
                  onChange={(event) => handleChange("nextAssignment", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-black outline-none placeholder:text-gray-400 focus:border-blue-500"
                  placeholder="Welcome desk, vocals, livestream, etc."
                />
              </label>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {editingId !== null ? "Save changes" : "Add volunteer"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="mt-3 text-3xl font-bold text-black">{item.value}</p>
              <div className={`mt-4 h-1.5 rounded-full ${item.track}`}>
                <div className={`h-1.5 w-3/4 rounded-full ${item.fill}`} />
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Volunteer directory</p>
              <h2 className="mt-2 text-2xl font-semibold text-black">Team coverage filter</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamOptions.map((team) => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    selectedTeam === team
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          {filteredVolunteers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
              No volunteers match this team selection yet.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {filteredVolunteers.map((person) => (
                <article key={person.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-black">{person.name}</h3>
                      <p className="text-sm text-blue-600">{person.team}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      person.availability === "Available"
                        ? "bg-blue-100 text-blue-700"
                        : person.availability === "Backup"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-cyan-100 text-cyan-700"
                    }`}>
                      {person.availability}
                    </span>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>Contact: {person.contact}</li>
                    <li>Next: {person.nextAssignment}</li>
                  </ul>

                  {isSystemAdmin && (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(person)}
                        className="flex-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(person)}
                        className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Service roster</p>
              <h2 className="mt-2 text-2xl font-semibold text-black">This week</h2>
            </div>
            <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {readyCount} ready
            </span>
          </div>

          <div className="space-y-4">
            {schedule.map((slot) => (
              <div key={slot.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{slot.title}</h3>
                    <p className="text-sm text-gray-600">{slot.time}</p>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    slot.status === "Ready"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {slot.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-gray-600">
                  <span className="rounded-full bg-white border border-gray-300 px-2 py-1">{slot.team}</span>
                  <span className="rounded-full bg-white border border-gray-300 px-2 py-1">{slot.openSpots} open spots</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {slot.assigned.map((name) => (
                    <span key={name} className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

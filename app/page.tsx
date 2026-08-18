"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "system-admin" | "user-admin";
type Team = "All" | "Ushers" | "Worship Team" | "Tech Crew" | "Sunday School" | "Preacher";
type Availability = "Available" | "Backup" | "On Call";

type AppUser = {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  church: string;
  team?: Exclude<Team, "All">;
  ministryRole?: string;
  availability?: Availability;
  nextAssignment?: string;
};

type Volunteer = {
  id: number;
  name: string;
  team: Exclude<Team, "All">;
  contact: string;
  availability: Availability;
  nextAssignment: string;
};

type VolunteerFormState = {
  name: string;
  team: Exclude<Team, "All">;
  contact: string;
  availability: Volunteer["availability"];
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

const STORAGE_USERS = "church_users";
const STORAGE_SESSION = "church_session";

const getStoredUsers = (): AppUser[] => {
  if (typeof window === "undefined") return [];

  const stored = window.localStorage.getItem(STORAGE_USERS);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as AppUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mapUserToVolunteer = (user: AppUser): Volunteer => ({
  id: user.id,
  name: user.fullName,
  team: user.team ?? "Ushers",
  contact: user.email,
  availability: user.availability ?? "Available",
  nextAssignment: user.nextAssignment ?? "Open assignment",
});

const buildScheduleFromUsers = (users: AppUser[]): ScheduleSlot[] => {
  const getAssigned = (team: Exclude<Team, "All">) =>
    users.filter((user) => user.team === team).map((user) => user.fullName);

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
};

const stewardship: StewardshipRecord[] = [
  { date: "2026-08-09", category: "Tithes & Offerings", amount: "$4,280.00", note: "Sunday service donation", status: "Cleared" },
  { date: "2026-08-09", category: "Mission Fund", amount: "$640.00", note: "Community outreach", status: "Cleared" },
  { date: "2026-08-10", category: "Youth Camp", amount: "$1,150.00", note: "Pending deposit", status: "Pending" },
  { date: "2026-08-12", category: "Facility Maintenance", amount: "$780.00", note: "Sound booth repairs", status: "Pending" },
];

const teamOptions: Team[] = ["All", "Ushers", "Worship Team", "Tech Crew", "Sunday School", "Preacher"];

const emptyVolunteerForm: VolunteerFormState = {
  name: "",
  team: "Ushers",
  contact: "",
  availability: "Available",
  nextAssignment: "",
};

function getStoredSession(): AppUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_SESSION);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function persistVolunteers(updatedVolunteers: Volunteer[]) {
  if (typeof window === "undefined") return;

  const existingUsers = getStoredUsers();
  const nextUsers = updatedVolunteers.map((volunteer) => {
    const matchingUser = existingUsers.find(
      (user) => user.id === volunteer.id || user.fullName.toLowerCase() === volunteer.name.toLowerCase(),
    );

    return {
      ...(matchingUser ?? {
        id: volunteer.id,
        email: volunteer.contact,
        password: "",
        role: "user-admin" as Role,
        church: "Grace City Church",
      }),
      id: volunteer.id,
      fullName: volunteer.name,
      email: volunteer.contact,
      team: volunteer.team,
      ministryRole: matchingUser?.ministryRole ?? volunteer.team,
      availability: volunteer.availability,
      nextAssignment: volunteer.nextAssignment,
      role: matchingUser?.role ?? "user-admin",
      church: matchingUser?.church ?? "Grace City Church",
      password: matchingUser?.password ?? "",
    } satisfies AppUser;
  });

  window.localStorage.setItem(STORAGE_USERS, JSON.stringify(nextUsers));

  const activeSession = getStoredSession();
  if (activeSession && nextUsers.some((user) => user.id === activeSession.id || user.email === activeSession.email)) {
    const syncedSession = nextUsers.find((user) => user.id === activeSession.id || user.email === activeSession.email);
    if (syncedSession) {
      window.localStorage.setItem(STORAGE_SESSION, JSON.stringify({
        ...activeSession,
        fullName: syncedSession.fullName,
        email: syncedSession.email,
        team: syncedSession.team,
        availability: syncedSession.availability,
        nextAssignment: syncedSession.nextAssignment,
        role: syncedSession.role,
        church: syncedSession.church,
        password: syncedSession.password,
      }));
    }
  }
}

export default function Home() {
  const [sessionUser, setSessionUser] = useState<AppUser | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team>("All");
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => getStoredUsers().map(mapUserToVolunteer));
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(() => buildScheduleFromUsers(getStoredUsers()));
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingOriginalName, setEditingOriginalName] = useState<string>("");
  const [formState, setFormState] = useState<VolunteerFormState>(emptyVolunteerForm);

  useEffect(() => {
    const activeUser = getStoredSession();

    if (!activeUser) {
      window.location.href = "/login";
      return;
    }

    setSessionUser(activeUser);
  }, []);

  useEffect(() => {
    const registeredUsers = getStoredUsers();
    setVolunteers(registeredUsers.map(mapUserToVolunteer));
    setSchedule(buildScheduleFromUsers(registeredUsers));
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSystemAdmin) return;

    const trimmedName = formState.name.trim();
    if (!trimmedName) {
      return;
    }

    if (editingId !== null) {
      setVolunteers((current) => {
        const nextVolunteers = current.map((person) =>
          person.id === editingId
            ? {
                ...person,
                name: trimmedName,
                team: formState.team,
                contact: formState.contact,
                availability: formState.availability,
                nextAssignment: formState.nextAssignment,
              }
            : person,
        );

        persistVolunteers(nextVolunteers);
        return nextVolunteers;
      });

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
    } else {
      const newVolunteer: Volunteer = {
        id: Date.now(),
        name: trimmedName,
        team: formState.team,
        contact: formState.contact,
        availability: formState.availability,
        nextAssignment: formState.nextAssignment,
      };

      setVolunteers((current) => {
        const nextVolunteers = [...current, newVolunteer];
        persistVolunteers(nextVolunteers);
        return nextVolunteers;
      });
    }

    closeForm();
  };

  const handleDelete = (person: Volunteer) => {
    if (!isSystemAdmin) return;
    setVolunteers((current) => {
      const nextVolunteers = current.filter((entry) => entry.id !== person.id);
      persistVolunteers(nextVolunteers);
      return nextVolunteers;
    });
    setSchedule((current) =>
      current.map((slot) => ({
        ...slot,
        assigned: slot.assigned.filter((assignedName) => assignedName !== person.name),
      })),
    );
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_SESSION);
      window.location.href = "/login";
    }
  };

  if (!sessionUser) {
    return null;
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
                  onChange={(event) => handleChange("team", event.target.value as Exclude<Team, "All">)}
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
                  onChange={(event) => handleChange("availability", event.target.value as Volunteer["availability"])}
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

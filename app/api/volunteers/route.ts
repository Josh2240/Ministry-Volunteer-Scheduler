import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { User: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.User;
}

export async function GET() {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });

    const volunteers = users.map((user) => ({
      id: user.id,
      name: user.fullName,
      team: user.team || "Ushers",
      contact: user.email,
      availability: user.availability || "Available",
      nextAssignment: user.nextAssignment || "Open assignment",
    }));

    return NextResponse.json(volunteers);
  } catch (error) {
    console.error("Get volunteers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "system-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, team, contact, availability, nextAssignment } = await request.json();

    if (!name || !team || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        fullName: name,
        email: contact,
        password: "",
        role: "user-admin",
        church: currentUser.church,
        team,
        ministryRole: team,
        availability: availability || "Available",
        nextAssignment: nextAssignment || "Open assignment",
      },
    });

    const volunteer = {
      id: user.id,
      name: user.fullName,
      team: user.team || "Ushers",
      contact: user.email,
      availability: user.availability || "Available",
      nextAssignment: user.nextAssignment || "Open assignment",
    };

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error("Create volunteer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "system-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, team, contact, availability, nextAssignment } = await request.json();

    if (!id || !name || !team || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        fullName: name,
        email: contact,
        team,
        ministryRole: team,
        availability: availability || "Available",
        nextAssignment: nextAssignment || "Open assignment",
      },
    });

    const volunteer = {
      id: user.id,
      name: user.fullName,
      team: user.team || "Ushers",
      contact: user.email,
      availability: user.availability || "Available",
      nextAssignment: user.nextAssignment || "Open assignment",
    };

    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Update volunteer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "system-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete volunteer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

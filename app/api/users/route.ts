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
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        church: true,
        team: true,
        ministryRole: true,
        availability: true,
        nextAssignment: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        church: true,
        team: true,
        ministryRole: true,
        availability: true,
        nextAssignment: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No account was found for that email." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Lookup user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { students } from "../../db/schema.js";
import { signToken, verifyPassword } from "./lib/auth.js";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "cleanxdetailing14@gmail.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "EAF.Erwann180602";

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return Response.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = signToken({ email: normalizedEmail, role: "admin", name: "Erwann" });
    return Response.json({ token, role: "admin", name: "Erwann", email: normalizedEmail });
  }

  const [student] = await db.select().from(students).where(eq(students.email, normalizedEmail));

  if (!student || !verifyPassword(password, student.pwd)) {
    return Response.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  const token = signToken({
    id: student.id,
    email: normalizedEmail,
    role: "student",
    name: student.name,
    initials: student.initials,
    offer: student.offer,
    status: student.status,
  });

  return Response.json({
    token,
    role: "student",
    id: student.id,
    name: student.name,
    initials: student.initials,
    email: normalizedEmail,
    offer: student.offer,
    status: student.status,
  });
};

export const config: Config = {
  path: "/api/login",
};

import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { students } from "../../db/schema.js";
import { getAuthUser, hashPassword } from "./lib/auth.js";

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  let user: Record<string, unknown>;
  try {
    user = getAuthUser(req);
  } catch {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }

  const id = context.params?.id;

  if (req.method === "GET" && !id) {
    const all = await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        initials: students.initials,
        offer: students.offer,
        status: students.status,
        createdAt: students.createdAt,
      })
      .from(students);
    return Response.json(all);
  }

  if (req.method === "POST" && !id) {
    let body: { name?: string; email?: string; password?: string; offer?: string; status?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Corps invalide." }, { status: 400 });
    }
    const { name, email, password, offer, status } = body;
    if (!name || !email || !password) {
      return Response.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const [student] = await db
        .insert(students)
        .values({
          name,
          email: normalizedEmail,
          pwd: hashPassword(password),
          initials: name.charAt(0).toUpperCase(),
          offer: offer || "Formation Starter",
          status: status || "paye",
        })
        .returning({
          id: students.id,
          name: students.name,
          email: students.email,
          initials: students.initials,
          offer: students.offer,
          status: students.status,
        });
      return Response.json(student, { status: 201 });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("unique") || msg.includes("duplicate")) {
        return Response.json({ error: "Un compte avec cet email existe déjà." }, { status: 409 });
      }
      throw e;
    }
  }

  if (req.method === "PUT" && id) {
    let body: { status?: string; password?: string; name?: string; offer?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Corps invalide." }, { status: 400 });
    }
    const setObj: Record<string, string> = {};
    if (body.status !== undefined) setObj.status = body.status;
    if (body.password) setObj.pwd = hashPassword(body.password);
    if (body.name) setObj.name = body.name;
    if (body.offer) setObj.offer = body.offer;
    if (Object.keys(setObj).length === 0) {
      return Response.json({ error: "Aucune modification." }, { status: 400 });
    }
    await db.update(students).set(setObj).where(eq(students.id, parseInt(id)));
    return Response.json({ success: true });
  }

  if (req.method === "DELETE" && id) {
    await db.delete(students).where(eq(students.id, parseInt(id)));
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/students", "/api/students/:id"],
};

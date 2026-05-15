import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { courses } from "../../db/schema.js";
import { getAuthUser } from "./lib/auth.js";

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  let user: Record<string, unknown>;
  try {
    user = getAuthUser(req);
  } catch {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const id = context.params?.id;

  if (req.method === "GET" && !id) {
    const all =
      user.role === "admin"
        ? await db.select().from(courses)
        : await db.select().from(courses).where(eq(courses.statut, "publie"));
    return Response.json(all);
  }

  if (user.role !== "admin") {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }

  if (req.method === "POST" && !id) {
    let body: {
      titre?: string;
      type?: string;
      duree?: string;
      offre?: string;
      description?: string;
      statut?: string;
    };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Corps invalide." }, { status: 400 });
    }
    if (!body.titre) {
      return Response.json({ error: "Le titre est requis." }, { status: 400 });
    }
    const [course] = await db
      .insert(courses)
      .values({
        titre: body.titre,
        type: body.type || "video",
        duree: body.duree || "",
        offre: body.offre || "all",
        description: body.description || "",
        statut: body.statut || "publie",
      })
      .returning();
    return Response.json(course, { status: 201 });
  }

  if (req.method === "PUT" && id) {
    let body: {
      titre?: string;
      type?: string;
      duree?: string;
      offre?: string;
      description?: string;
      statut?: string;
    };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Corps invalide." }, { status: 400 });
    }
    if (!body.titre) {
      return Response.json({ error: "Le titre est requis." }, { status: 400 });
    }
    await db
      .update(courses)
      .set({
        titre: body.titre,
        type: body.type,
        duree: body.duree,
        offre: body.offre,
        description: body.description,
        statut: body.statut,
      })
      .where(eq(courses.id, parseInt(id)));
    const [updated] = await db.select().from(courses).where(eq(courses.id, parseInt(id)));
    return Response.json(updated);
  }

  if (req.method === "DELETE" && id) {
    await db.delete(courses).where(eq(courses.id, parseInt(id)));
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/courses", "/api/courses/:id"],
};

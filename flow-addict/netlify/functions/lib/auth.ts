import crypto from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "flow-addict-jwt-secret-2024";

export function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Token invalide");
  const [header, body, sig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  if (sig !== expectedSig) throw new Error("Signature invalide");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Record<string, unknown>;
  if (typeof payload.exp === "number" && payload.exp < Date.now()) throw new Error("Token expiré");
  return payload;
}

export function getAuthUser(req: Request): Record<string, unknown> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("Non autorisé");
  return verifyToken(authHeader.slice(7));
}

export function hashPassword(pwd: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(pwd, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pwd: string, stored: string): boolean {
  if (!stored.includes(":")) return pwd === stored;
  const [salt, hash] = stored.split(":");
  const testHash = crypto.pbkdf2Sync(pwd, salt, 10000, 64, "sha512").toString("hex");
  return hash === testHash;
}

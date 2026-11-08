import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { plannedSessions } from "../../../db/schema";
import { apiError, consentSchema, entryIdSchema, optionalText, preferredDateSchema, privateHeaders, readBody, safeRouteError, sameOriginError } from "../../../lib/gym-api";

export const dynamic = "force-dynamic";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time in HH:mm format.");
const sessionSchema = z.object({
  classKey: z.string().trim().min(1, "Choose a class to add to your plan.").max(200),
  className: z.string().trim().min(1, "Enter a class name.").max(100),
  coach: z.string().trim().min(1, "Enter the coach name or select a class.").max(100),
  category: z.string().trim().min(1).max(60),
  scheduledDate: preferredDateSchema,
  scheduledTime: timeSchema.optional(),
  scheduledTime24h: timeSchema.optional(),
  notes: optionalText(1000),
  consent: consentSchema,
}).refine((value) => Boolean(value.scheduledTime ?? value.scheduledTime24h), {
  message: "Choose a valid time in HH:mm format.", path: ["scheduledTime"],
}).refine((value) => !value.scheduledTime || !value.scheduledTime24h || value.scheduledTime === value.scheduledTime24h, {
  message: "Class times must match.", path: ["scheduledTime"],
});

const sessionFields = {
  id: plannedSessions.id,
  classKey: plannedSessions.classKey,
  className: plannedSessions.className,
  coach: plannedSessions.coach,
  category: plannedSessions.category,
  scheduledDate: plannedSessions.scheduledDate,
  scheduledTime: plannedSessions.scheduledTime,
  notes: plannedSessions.notes,
  status: plannedSessions.status,
  createdAt: plannedSessions.createdAt,
};

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to view your class plan.", 401);
    const sessions = await getDb().select(sessionFields).from(plannedSessions)
      .where(eq(plannedSessions.userId, user.userId))
      .orderBy(asc(plannedSessions.scheduledDate), asc(plannedSessions.scheduledTime), asc(plannedSessions.createdAt)).limit(500);
    return Response.json({ sessions }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to save your class plan.", 401);
    const input = sessionSchema.parse(await readBody(request));
    const scheduledTime = (input.scheduledTime ?? input.scheduledTime24h)!;
    const now = new Date().toISOString();
    const db = getDb();
    const inserted = await db.insert(plannedSessions).values({
      id: crypto.randomUUID(), userId: user.userId,
      classKey: input.classKey, className: input.className,
      coach: input.coach, category: input.category,
      scheduledDate: input.scheduledDate, scheduledTime,
      notes: input.notes ?? null, status: "planned", consentedAt: now, createdAt: now,
    }).onConflictDoNothing({ target: [plannedSessions.userId, plannedSessions.classKey, plannedSessions.scheduledDate, plannedSessions.scheduledTime] }).returning(sessionFields);
    if (inserted.length) {
      return Response.json({ session: inserted[0] }, { status: 201, headers: privateHeaders });
    }
    const [existing] = await db.select(sessionFields).from(plannedSessions).where(and(
      eq(plannedSessions.userId, user.userId), eq(plannedSessions.classKey, input.classKey),
      eq(plannedSessions.scheduledDate, input.scheduledDate), eq(plannedSessions.scheduledTime, scheduledTime),
    )).limit(1);
    return Response.json({ session: existing }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

const updateSchema = z.object({ id: entryIdSchema, status: z.enum(["planned", "completed"]) });

export async function PATCH(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to update your class plan.", 401);
    const input = updateSchema.parse(await readBody(request));
    const [session] = await getDb().update(plannedSessions).set({ status: input.status })
      .where(and(eq(plannedSessions.id, input.id), eq(plannedSessions.userId, user.userId))).returning(sessionFields);
    if (!session) return apiError("Planned class not found.", 404);
    return Response.json({ session }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

export async function DELETE(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to manage your class plan.", 401);
    const id = entryIdSchema.parse(new URL(request.url).searchParams.get("id"));
    const deleted = await getDb().delete(plannedSessions)
      .where(and(eq(plannedSessions.id, id), eq(plannedSessions.userId, user.userId))).returning({ id: plannedSessions.id });
    if (!deleted.length) return apiError("Planned class not found.", 404);
    return Response.json({ deleted: true }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

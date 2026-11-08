import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { workouts } from "../../../db/schema";
import { apiError, consentSchema, entryIdSchema, historyDateSchema, optionalText, privateHeaders, readBody, safeRouteError, sameOriginError } from "../../../lib/gym-api";

export const dynamic = "force-dynamic";
const workoutSchema = z.object({
  name: z.string().trim().min(2, "Give your workout a name.").max(100),
  duration: z.number().int().min(1, "Duration must be at least one minute.").max(600, "Duration must be no longer than 600 minutes."),
  date: historyDateSchema,
  notes: optionalText(1000),
  consent: consentSchema,
});

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to save a workout.", 401);
    const input = workoutSchema.parse(await readBody(request));
    const now = new Date().toISOString();
    const entry = { id: crypto.randomUUID(), userId: user.userId, name: input.name, duration: input.duration, date: input.date, notes: input.notes ?? null, consentedAt: now, createdAt: now };
    await getDb().insert(workouts).values(entry);
    return Response.json({ workout: entry }, { status: 201, headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

export async function DELETE(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to manage workouts.", 401);
    const id = entryIdSchema.parse(new URL(request.url).searchParams.get("id"));
    const deleted = await getDb().delete(workouts).where(and(eq(workouts.id, id), eq(workouts.userId, user.userId))).returning({ id: workouts.id });
    if (!deleted.length) return apiError("Workout not found.", 404);
    return Response.json({ deleted: true }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

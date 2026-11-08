import { asc, desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { fitnessGoals, gymRequests, measurements, plannedSessions, workouts } from "../../../db/schema";
import { apiError, privateHeaders, safeRouteError, sameOriginError } from "../../../lib/gym-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to view your fitness journal.", 401);
    const db = getDb();
    const [requests, savedWorkouts, savedMeasurements, sessions, goals] = await Promise.all([
      db.select().from(gymRequests).where(eq(gymRequests.userId, user.userId)).orderBy(desc(gymRequests.createdAt)).limit(100),
      db.select().from(workouts).where(eq(workouts.userId, user.userId)).orderBy(desc(workouts.date), desc(workouts.createdAt)).limit(500),
      db.select().from(measurements).where(eq(measurements.userId, user.userId)).orderBy(desc(measurements.date), desc(measurements.createdAt)).limit(500),
      db.select().from(plannedSessions).where(eq(plannedSessions.userId, user.userId)).orderBy(asc(plannedSessions.scheduledDate), asc(plannedSessions.scheduledTime)).limit(500),
      db.select({ focus: fitnessGoals.focus, weeklyTarget: fitnessGoals.weeklyTarget, experience: fitnessGoals.experience, preferredTraining: fitnessGoals.preferredTraining, notes: fitnessGoals.notes })
        .from(fitnessGoals).where(eq(fitnessGoals.userId, user.userId)).limit(1),
    ]);
    return Response.json({ user: { displayName: user.displayName, email: user.email }, requests, workouts: savedWorkouts, measurements: savedMeasurements,
      plannedSessions: sessions.map(({ userId, consentedAt, ...session }) => session), goal: goals[0] ?? null,
    }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

export async function DELETE(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (new URL(request.url).searchParams.get("scope") !== "data") {
    return apiError("Specify scope=data to delete your saved data.");
  }
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to manage your fitness journal.", 401);
    const db = getDb();
    await db.batch([
      db.delete(gymRequests).where(eq(gymRequests.userId, user.userId)),
      db.delete(workouts).where(eq(workouts.userId, user.userId)),
      db.delete(measurements).where(eq(measurements.userId, user.userId)),
      db.delete(plannedSessions).where(eq(plannedSessions.userId, user.userId)),
      db.delete(fitnessGoals).where(eq(fitnessGoals.userId, user.userId)),
    ]);
    return Response.json({ deleted: true }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

import { desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { gymRequests, measurements, workouts } from "../../../db/schema";
import { apiError, privateHeaders, safeRouteError, sameOriginError } from "../../../lib/gym-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to view your fitness journal.", 401);
    const db = getDb();
    const [requests, savedWorkouts, savedMeasurements] = await Promise.all([
      db.select().from(gymRequests).where(eq(gymRequests.userId, user.userId)).orderBy(desc(gymRequests.createdAt)).limit(100),
      db.select().from(workouts).where(eq(workouts.userId, user.userId)).orderBy(desc(workouts.date), desc(workouts.createdAt)).limit(500),
      db.select().from(measurements).where(eq(measurements.userId, user.userId)).orderBy(desc(measurements.date), desc(measurements.createdAt)).limit(500),
    ]);
    return Response.json({ user: { displayName: user.displayName, email: user.email }, requests, workouts: savedWorkouts, measurements: savedMeasurements }, { headers: privateHeaders });
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
    ]);
    return Response.json({ deleted: true }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

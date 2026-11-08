import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { measurements } from "../../../db/schema";
import { apiError, consentSchema, entryIdSchema, historyDateSchema, privateHeaders, readBody, safeRouteError, sameOriginError } from "../../../lib/gym-api";

export const dynamic = "force-dynamic";
const measurementSchema = z.object({
  weight: z.number().min(20, "Weight must be between 20 and 400 kg.").max(400, "Weight must be between 20 and 400 kg."),
  date: historyDateSchema,
  consent: consentSchema,
});

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to save a measurement.", 401);
    const input = measurementSchema.parse(await readBody(request));
    const now = new Date().toISOString();
    const entry = { id: crypto.randomUUID(), userId: user.userId, weight: input.weight, date: input.date, consentedAt: now, createdAt: now };
    await getDb().insert(measurements).values(entry);
    return Response.json({ measurement: entry }, { status: 201, headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

export async function DELETE(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to manage measurements.", 401);
    const id = entryIdSchema.parse(new URL(request.url).searchParams.get("id"));
    const deleted = await getDb().delete(measurements).where(and(eq(measurements.id, id), eq(measurements.userId, user.userId))).returning({ id: measurements.id });
    if (!deleted.length) return apiError("Measurement not found.", 404);
    return Response.json({ deleted: true }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

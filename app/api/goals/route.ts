import { eq } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { fitnessGoals } from "../../../db/schema";
import { apiError, consentSchema, optionalText, privateHeaders, readBody, safeRouteError, sameOriginError } from "../../../lib/gym-api";

export const dynamic = "force-dynamic";

const goalFields = {
  focus: fitnessGoals.focus,
  weeklyTarget: fitnessGoals.weeklyTarget,
  experience: fitnessGoals.experience,
  preferredTraining: fitnessGoals.preferredTraining,
  notes: fitnessGoals.notes,
};

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to view your fitness goals.", 401);
    const [goal] = await getDb().select(goalFields).from(fitnessGoals).where(eq(fitnessGoals.userId, user.userId)).limit(1);
    return Response.json({ goal: goal ?? null }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

const goalSchema = z.object({
  focus: z.string().trim().min(2, "Choose your training focus.").max(100),
  weeklyTarget: z.number().int().min(1, "Choose between one and seven sessions per week.").max(7, "Choose between one and seven sessions per week."),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  preferredTraining: z.enum(["solo", "group", "coached"]),
  notes: optionalText(1000),
  consent: consentSchema,
});

export async function PUT(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const user = await getChatGPTUser();
    if (!user) return apiError("Sign in to save your fitness goals.", 401);
    const input = goalSchema.parse(await readBody(request));
    const now = new Date().toISOString();
    const values = { focus: input.focus, weeklyTarget: input.weeklyTarget,
      experience: input.experience, preferredTraining: input.preferredTraining,
      notes: input.notes ?? null, consentedAt: now, updatedAt: now };
    const [goal] = await getDb().insert(fitnessGoals)
      .values({ userId: user.userId, ...values, createdAt: now })
      .onConflictDoUpdate({ target: fitnessGoals.userId, set: values }).returning(goalFields);
    return Response.json({ goal }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

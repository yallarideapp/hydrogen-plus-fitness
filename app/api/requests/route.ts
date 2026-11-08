import { and, count, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { gymRequests } from "../../../db/schema";
import { apiError, consentSchema, optionalText, preferredDateSchema, privateHeaders, readBody, safeRouteError, sameOriginError } from "../../../lib/gym-api";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  kind: z.enum(["tour", "membership", "class", "training", "contact"]),
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z.string().trim().min(7).max(24).regex(/^[+()\d\s-]+$/, "Please enter a valid phone number.")
    .refine((value) => value.replace(/\D/g, "").length >= 7, "Please enter a valid phone number.")
    .transform((value) => value.replace(/[^\d+]/g, "")),
  email: z.preprocess((value) => value === "" || value === null ? undefined : value, z.string().trim().email("Please enter a valid email address.").max(254).optional()),
  interest: optionalText(160),
  preferredDate: z.preprocess((value) => value === "" || value === null ? undefined : value, preferredDateSchema.optional()),
  message: optionalText(2000),
  consent: consentSchema,
  clientRequestId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const input = requestSchema.parse(await readBody(request));
    const user = await getChatGPTUser();
    const db = getDb();
    if (input.clientRequestId) {
      const [existing] = await db.select().from(gymRequests)
        .where(eq(gymRequests.clientRequestId, input.clientRequestId)).limit(1);
      if (existing) {
        if (existing.phone !== input.phone || existing.kind !== input.kind || existing.userId !== (user?.userId ?? null)) {
          return apiError("Please start a new request.", 409);
        }
        return Response.json({ reference: existing.reference, status: existing.status, request: { id: existing.id, reference: existing.reference, status: existing.status, kind: existing.kind, createdAt: existing.createdAt } }, { headers: privateHeaders });
      }
    }
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const [recent] = await db.select({ total: count() }).from(gymRequests)
      .where(and(eq(gymRequests.phone, input.phone), gte(gymRequests.createdAt, cutoff)));
    if (recent.total >= 8) return apiError("You have sent several requests recently. Please wait a while or call the gym.", 429);

    const id = crypto.randomUUID();
    const reference = `HP-${id.slice(0, 8).toUpperCase()}${id.slice(-4).toUpperCase()}`;
    const now = new Date().toISOString();
    await db.insert(gymRequests).values({
      id, reference, userId: user?.userId ?? null,
      clientRequestId: input.clientRequestId ?? null,
      kind: input.kind, name: input.name, phone: input.phone,
      email: input.email ?? null, interest: input.interest ?? null,
      preferredDate: input.preferredDate ?? null, message: input.message ?? null,
      status: "pending", consentedAt: now, createdAt: now,
    });
    return Response.json({ reference, status: "pending", request: { id, reference, status: "pending", kind: input.kind, createdAt: now } }, { status: 201, headers: privateHeaders });
  } catch (error) {
    return safeRouteError(error);
  }
}

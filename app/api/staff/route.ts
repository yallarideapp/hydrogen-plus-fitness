import { env } from "cloudflare:workers";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { gymRequests } from "../../../db/schema";
import { apiError, privateHeaders, readBody, safeRouteError, sameOriginError } from "../../../lib/gym-api";

export const dynamic = "force-dynamic";

async function staffAccessError() {
  const user = await getChatGPTUser();
  if (!user) return apiError("Sign in to access the staff inbox.", 401);
  const allowedEmails = (env.GYM_ADMIN_EMAILS ?? "")
    .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!allowedEmails.length) {
    return Response.json({
      error: "setup-required",
      message: "Staff access has not been configured. Ask the site owner to add staff email addresses.",
    }, { status: 403, headers: privateHeaders });
  }
  if (!allowedEmails.includes(user.email.trim().toLowerCase())) {
    return apiError("Staff access is restricted.", 403);
  }
  return null;
}

// Only the contact and booking details staff need are returned. Stable account
// identifiers and retry tokens stay outside the staff response.
const staffRequestFields = {
  id: gymRequests.id,
  reference: gymRequests.reference,
  kind: gymRequests.kind,
  name: gymRequests.name,
  phone: gymRequests.phone,
  email: gymRequests.email,
  interest: gymRequests.interest,
  preferredDate: gymRequests.preferredDate,
  message: gymRequests.message,
  status: gymRequests.status,
  createdAt: gymRequests.createdAt,
};

export async function GET() {
  try {
    const accessError = await staffAccessError();
    if (accessError) return accessError;
    const db = getDb();
    const [requests, totals, pending] = await Promise.all([
      db.select(staffRequestFields).from(gymRequests).orderBy(desc(gymRequests.createdAt)).limit(200),
      db.select({ total: count() }).from(gymRequests),
      db.select({ total: count() }).from(gymRequests).where(eq(gymRequests.status, "pending")),
    ]);
    return Response.json({ requests, stats: { pending: pending[0].total, total: totals[0].total } }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

const updateSchema = z.object({
  id: z.string().uuid("Please choose a valid request."),
  status: z.enum(["pending", "contacted", "confirmed", "cancelled"]),
});

export async function PATCH(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const accessError = await staffAccessError();
    if (accessError) return accessError;
    const input = updateSchema.parse(await readBody(request));
    const [updated] = await getDb().update(gymRequests)
      .set({ status: input.status })
      .where(eq(gymRequests.id, input.id))
      .returning(staffRequestFields);
    if (!updated) return apiError("Request not found.", 404);
    return Response.json({ request: updated }, { headers: privateHeaders });
  } catch (error) { return safeRouteError(error); }
}

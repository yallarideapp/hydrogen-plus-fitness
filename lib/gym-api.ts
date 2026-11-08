import { z } from "zod";

export const privateHeaders = { "Cache-Control": "private, no-store" };

export function apiError(error: string, status = 400) {
  return Response.json({ error }, { status, headers: privateHeaders });
}

export function sameOriginError(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return apiError("This request must come from this website.", 403);
  }
  return null;
}

export async function readBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new Error("CONTENT_TYPE");
  }
  if (Number(request.headers.get("content-length") ?? "0") > 16384) {
    throw new Error("BODY_TOO_LARGE");
  }
  const body = await request.text();
  if (body.length > 16384) throw new Error("BODY_TOO_LARGE");
  return JSON.parse(body);
}

export function safeRouteError(error: unknown) {
  if (error instanceof z.ZodError) {
    return apiError(error.issues[0]?.message ?? "Please check the form fields.");
  }
  if (error instanceof SyntaxError) return apiError("Please send valid JSON.");
  if (error instanceof Error && error.message === "CONTENT_TYPE") {
    return apiError("Please send application/json.", 415);
  }
  if (error instanceof Error && error.message === "BODY_TOO_LARGE") {
    return apiError("This request is too large.", 413);
  }
  // Never include SQL, bindings, personal details or server internals in responses.
  return apiError("We could not save your information right now. Please try again, or contact the gym directly.", 503);
}

export function ammanToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Amman", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (name: string) => parts.find((item) => item.type === name)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function validCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

const dateSchema = z.string().refine(validCalendarDate, "Please choose a valid date.");
export const historyDateSchema = dateSchema.refine((value) => {
  const today = ammanToday();
  return value <= today && value >= `${Number(today.slice(0, 4)) - 5}${today.slice(4)}`;
}, "Choose today or a date within the last five years.");

export const preferredDateSchema = dateSchema.refine((value) => {
  const today = ammanToday();
  const upper = new Date(`${today}T12:00:00Z`);
  upper.setUTCDate(upper.getUTCDate() + 365);
  return value >= today && value <= upper.toISOString().slice(0, 10);
}, "Choose today or a date within the next year.");

export const optionalText = (max: number) => z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  z.string().trim().max(max).optional(),
);

export const consentSchema = z.literal(true, {
  errorMap: () => ({ message: "Please agree to the Privacy Policy and Terms to continue." }),
});
export const entryIdSchema = z.string().uuid("Please choose a valid record.");

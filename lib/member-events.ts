// One event for "something in My training changed" (a workout logged from the studio, a goal saved, a plan request
// sent or cancelled...). The My training page listens for it and reloads its head numbers and lists.
export const MEMBER_EVENT = 'hp-member-changed';
export const memberChanged = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event(MEMBER_EVENT)); };

// The workout builder hands a finished session to the "Log a workout" form instead of having its own form:
// name, minutes and the exercise list are filled in there, and the member checks them and saves.
// Returns false when no log form is on the page to take it (e.g. signed out).
export const LOG_PREFILL = 'hp-log-prefill';
export type LogPrefill = { name: string; duration: number | null; notes: string }; // duration null: keep the form's
export const prefillLog = (detail: LogPrefill) => typeof window === 'undefined' || !window.dispatchEvent(new CustomEvent(LOG_PREFILL, { detail, cancelable: true }));

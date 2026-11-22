// One event for "something in My training changed" (a workout logged from the studio, a goal saved, a plan request
// sent or cancelled...). The My training page listens for it and reloads its head numbers and lists.
export const MEMBER_EVENT = 'hp-member-changed';
export const memberChanged = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event(MEMBER_EVENT)); };

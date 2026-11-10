// Spanish date text written by hand: Intl support in Hermes varies between Android builds.
const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "10 ago 2026" */
export function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "vie, 7 nov." */
export function formatDay(date: Date) {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}.`;
}

/** "3:47 p. m." */
export function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? "a. m." : "p. m."}`;
}

/** "vie, 7 nov. · 3:00 p. m. – 3:47 p. m." */
export function formatRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  return `${formatDay(start)} · ${formatTime(start)} – ${formatTime(new Date(endIso))}`;
}

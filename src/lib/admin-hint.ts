/* ══════════════════════════════════════════════════════════════════════
   ADMIN HINT — a harmless browser marker ("an admin logged in here").

   It holds no secret and grants nothing: it only tells the floating admin
   button that it is worth asking the server (/api/me) whether the real,
   encrypted admin session is valid. Visitors never have it, so they never
   send that request. Lasts as long as an admin session (8 hours).
   ══════════════════════════════════════════════════════════════════════ */

const NAME = "ri_admin_hint";
const MAX_AGE = 60 * 60 * 8;

export function setAdminHint() {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${NAME}=1; path=/; max-age=${MAX_AGE}; samesite=strict${secure}`;
}

export function clearAdminHint() {
  if (typeof document === "undefined") return;
  document.cookie = `${NAME}=; path=/; max-age=0; samesite=strict`;
}

export function hasAdminHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${NAME}=1`));
}

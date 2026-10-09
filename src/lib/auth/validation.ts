export type AuthState = { error?: string; message?: string };
export function safeNext(value: unknown): string {
  if (value === "/solicitar" || value === "/admin" || value === "/conta") return value;
  if (typeof value === "string" && /^\/catalogo\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return value;
  return "/conta";
}
export function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
export function validPassword(value: string) {
  return value.length >= 12 && value.length <= 128;
}

// Sesión de administrador firmada con HMAC-SHA256 usando Web Crypto API.
// Importante: usamos `crypto.subtle`, NO el módulo `crypto` de Node, porque
// el middleware de Next.js corre en Edge Runtime por defecto y el módulo
// `crypto` de Node no está disponible ahí. Web Crypto sí funciona en ambos.

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET ?? null;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

/**
 * Crea el valor de la cookie de sesión: "<expiresAtMs>.<firma>"
 * Nunca lanza si falta el secreto; en ese caso devuelve null para que el
 * caller decida cómo manejarlo de forma segura (nunca un 500 sin control).
 */
export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = String(expiresAt);
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

/**
 * Verifica un token de sesión. SIEMPRE devuelve un booleano, nunca lanza
 * una excepción no controlada — si la variable de entorno todavía no está
 * configurada, o el token es inválido/expiró, simplemente devuelve false.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  try {
    if (!token) return false;

    const secret = getSecret();
    if (!secret) return false;

    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;

    const expiresAt = Number(payload);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const expectedSignature = await sign(payload, secret);

    // Comparación en tiempo constante para evitar timing attacks triviales.
    if (expectedSignature.length !== signature.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expectedSignature.length; i++) {
      mismatch |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return mismatch === 0;
  } catch {
    // Cualquier error inesperado (ej. ADMIN_SESSION_SECRET ausente a medio
    // camino, Web Crypto no disponible) se traduce a "no autorizado", nunca
    // a un error 500 sin control.
    return false;
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  return username === expectedUsername && password === expectedPassword;
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

// Re-exportamos por si algún caller necesita decodificar manualmente.
export { base64UrlDecode };

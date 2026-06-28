import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Usamos siempre sql.query("...", [params]) con parámetros posicionales ($1, $2, ...),
// NUNCA el tagged-template sql`...` — mezclar ambas formas rompe los tipos.
let cachedSql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (cachedSql) return cachedSql;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está configurada. Conecta Neon desde el dashboard de Vercel (Storage → Connect Database)."
    );
  }

  cachedSql = neon(connectionString);
  return cachedSql;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

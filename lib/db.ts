import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let sqlClient: Sql | null = null;
let schemaReady: Promise<void> | null = null;

export function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || "";
}

export function sql(): Sql {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sqlClient) {
    sqlClient = neon(url);
  }
  return sqlClient;
}

export async function ensureCatalogSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql()`
        CREATE TABLE IF NOT EXISTS catalogs (
          id TEXT PRIMARY KEY,
          pages JSONB NOT NULL,
          products JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })();
  }
  await schemaReady;
}

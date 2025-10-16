import { query } from "../db";

export type SupabaseAdminConfig = {
  supabaseUrl: string;
  serviceKey: string;
};

export const SUPABASE_USER_COLUMNS =
  "id,email,first_name,last_name,business_name,business_location,industry,company_size,plan,created_at,deleted_at";

export interface SupabaseUserRow {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  business_location?: string | null;
  industry?: string | null;
  company_size?: string | null;
  plan?: string | null;
  created_at?: string | null;
  deleted_at?: string | null;
}

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanupTimestamp = 0;
let cleanupPromise: Promise<void> | null = null;

export function getSupabaseAdminConfig(): SupabaseAdminConfig | null {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return null;
  }
  return { supabaseUrl, serviceKey };
}

export function sanitizeSearchTerm(input: string): string {
  return input.replace(/[()]/g, "").replace(/"/g, "").replace(/,/g, "").trim();
}

export function parseContentRange(rangeHeader: string | null): number | null {
  if (!rangeHeader) return null;
  const match = rangeHeader.match(/\/(\d+)$/);
  if (!match) return null;
  return Number(match[1]);
}

export async function markSupabaseUsersDeleted(
  ids: string[],
  config: SupabaseAdminConfig,
): Promise<void> {
  if (!ids.length) return;
  const uniqueIds = Array.from(new Set(ids));
  const url = new URL(`${config.supabaseUrl}/rest/v1/app_users`);
  url.searchParams.set("id", `in.(${uniqueIds.join(",")})`);

  try {
    const resp = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        Prefer: "return=minimal",
      } as any,
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Supabase mark users deleted failed", resp.status, text);
    }
  } catch (err) {
    console.error("Supabase mark users deleted error", err);
  }
}

export async function markLocalUsersDeleted(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const uniqueIds = Array.from(new Set(ids));
  try {
    await query(
      `UPDATE public.app_users SET deleted_at = NOW() WHERE id = ANY($1::text[])`,
      [uniqueIds],
    );
  } catch (err) {
    console.warn("Failed to mark local users deleted", err);
  }
  try {
    await query(`DELETE FROM public.app_users WHERE id = ANY($1::text[])`, [
      uniqueIds,
    ]);
  } catch (err) {
    console.warn("Failed to remove local users", err);
  }
}

export async function filterRowsByAuth(
  rows: SupabaseUserRow[],
  config: SupabaseAdminConfig,
): Promise<{ rows: SupabaseUserRow[]; removedIds: string[] }> {
  if (!rows.length) {
    return { rows: [], removedIds: [] };
  }

  const checks = await Promise.allSettled(
    rows.map((row) =>
      fetch(
        `${config.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(row.id)}`,
        {
          headers: {
            apikey: config.serviceKey,
            Authorization: `Bearer ${config.serviceKey}`,
          },
        },
      ),
    ),
  );

  const active: SupabaseUserRow[] = [];
  const removed: string[] = [];

  checks.forEach((result, idx) => {
    const row = rows[idx];
    if (result.status === "fulfilled") {
      const resp = result.value;
      if (resp.ok) {
        active.push(row);
      } else if (resp.status === 404) {
        removed.push(row.id);
      } else {
        console.warn("Unexpected Supabase auth response", resp.status, row.id);
        active.push(row);
      }
    } else {
      console.warn("Supabase auth lookup failed", row.id, result.reason);
      active.push(row);
    }
  });

  if (removed.length) {
    await Promise.allSettled([
      markSupabaseUsersDeleted(removed, config),
      markLocalUsersDeleted(removed),
    ]);
  }

  return { rows: active, removedIds: removed };
}

export async function listUsersFromPrimaryDb(
  q: string,
  limit: number,
  offset: number,
): Promise<{ rows: SupabaseUserRow[]; total: number }> {
  const params: any[] = [];
  let where = "WHERE deleted_at IS NULL";
  if (q) {
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    const startIdx = params.length - 3;
    where += ` AND (LOWER(email) LIKE $${startIdx} OR LOWER(first_name) LIKE $${startIdx + 1} OR LOWER(last_name) LIKE $${startIdx + 2} OR LOWER(business_name) LIKE $${startIdx + 3})`;
  }

  const rowsRes = await query(
    `SELECT id, email, first_name, last_name, business_name, business_location, industry, company_size, plan, created_at, deleted_at
     FROM public.app_users ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countRes = await query(
    `SELECT COUNT(1)::int AS count FROM public.app_users ${where}`,
    params,
  );

  return {
    rows: rowsRes.rows as SupabaseUserRow[],
    total: countRes.rows[0]?.count ?? 0,
  };
}

export async function getUserFromPrimaryDb(
  id: string,
): Promise<SupabaseUserRow | null> {
  const result = await query(
    `SELECT id, email, first_name, last_name, business_name, business_location, industry, company_size, plan, created_at, deleted_at
     FROM public.app_users WHERE id = $1`,
    [id],
  );
  return (result.rows[0] as SupabaseUserRow | undefined) ?? null;
}

async function fetchAllActiveSupabaseIds(
  config: SupabaseAdminConfig,
): Promise<string[]> {
  const ids: string[] = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const url = new URL(`${config.supabaseUrl}/rest/v1/app_users`);
    url.searchParams.set("select", "id");
    url.searchParams.set("deleted_at", "is.null");
    url.searchParams.set("order", "created_at.asc");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("offset", String(offset));

    const resp = await fetch(url.toString(), {
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(
        `Supabase fetch active ids failed: ${resp.status} ${text.slice(0, 200)}`,
      );
    }

    const rows = (await resp.json()) as Array<{ id: string }>;
    rows.forEach((row) => {
      if (row?.id) ids.push(row.id);
    });

    if (rows.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return ids;
}

async function purgeLocalUsersNotInSupabase(
  config: SupabaseAdminConfig,
): Promise<void> {
  const activeIds = await fetchAllActiveSupabaseIds(config);
  const activeSet = new Set(activeIds);

  const localResult = await query<{ id: string }>(
    `SELECT id FROM public.app_users`,
  );
  const localIds = localResult.rows.map((row) => row.id).filter(Boolean);
  const orphans = localIds.filter((id) => !activeSet.has(id));

  if (!orphans.length) {
    return;
  }

  await markLocalUsersDeleted(orphans);
}

export async function ensureOrphanCleanup(
  config: SupabaseAdminConfig,
): Promise<void> {
  const now = Date.now();
  if (cleanupPromise) {
    await cleanupPromise.catch(() => {});
    if (now - lastCleanupTimestamp < CLEANUP_INTERVAL_MS) {
      return;
    }
  } else if (now - lastCleanupTimestamp < CLEANUP_INTERVAL_MS) {
    return;
  }

  cleanupPromise = (async () => {
    try {
      await purgeLocalUsersNotInSupabase(config);
      lastCleanupTimestamp = Date.now();
    } catch (err) {
      console.error("Failed to purge orphaned local users", err);
    } finally {
      cleanupPromise = null;
    }
  })();

  await cleanupPromise.catch(() => {});
}

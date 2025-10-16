import type { Request, Response } from "express";
import { z } from "zod";
import { query } from "../db";
import {
  SUPABASE_USER_COLUMNS,
  ensureOrphanCleanup,
  filterRowsByAuth,
  getSupabaseAdminConfig,
  getUserFromPrimaryDb,
  listUsersFromPrimaryDb,
  markLocalUsersDeleted,
  parseContentRange,
  sanitizeSearchTerm,
  type SupabaseUserRow,
} from "../services/userMaintenance";

const signupSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  businessName: z.string().optional().default(""),
  businessLocation: z.string().optional().default(""),
  industry: z.string().optional().default(""),
  companySize: z.string().optional().default(""),
  plan: z.enum(["free", "plus", "pro"]).optional().default("free"),
  createdAt: z.string().optional(),
});

export async function handleSyncSignup(req: Request, res: Response) {
  const doDbUpsert = async (u: any, created: string) => {
    await query(
      `INSERT INTO public.app_users (id, email, first_name, last_name, business_name, business_location, industry, company_size, plan, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         business_name = EXCLUDED.business_name,
         business_location = EXCLUDED.business_location,
         industry = EXCLUDED.industry,
         company_size = EXCLUDED.company_size,
         plan = EXCLUDED.plan`,
      [
        u.id,
        u.email.toLowerCase(),
        u.firstName,
        u.lastName,
        u.businessName,
        u.businessLocation,
        u.industry,
        u.companySize,
        u.plan,
        created,
      ],
    );
  };

  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false });
    const u = parsed.data;
    const created = u.createdAt ?? new Date().toISOString();

    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    // Prefer writing to Supabase (Table Editor visibility), upsert to avoid duplicates
    if (supabaseUrl && supabaseKey) {
      try {
        const resp = await fetch(
          `${supabaseUrl}/rest/v1/app_users?on_conflict=id`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Prefer: "return=representation,resolution=merge-duplicates",
            } as any,
            body: JSON.stringify({
              id: u.id,
              email: u.email.toLowerCase(),
              first_name: u.firstName,
              last_name: u.lastName,
              business_name: u.businessName,
              business_location: u.businessLocation,
              industry: u.industry,
              company_size: u.companySize,
              plan: u.plan,
              created_at: created,
            }),
          },
        );
        if (!resp.ok) {
          const text = await resp.text();
          console.error("Supabase REST upsert failed:", resp.status, text);
          return res.status(500).json({
            ok: false,
            error: "supabase_rest_failed",
            status: resp.status,
          });
        }
      } catch (err2) {
        console.error("Supabase REST error:", err2);
        return res.status(500).json({ ok: false, error: "rest_error" });
      }
    }

    // Also try to mirror into primary DB if configured (non-blocking)
    try {
      await doDbUpsert(u, created);
    } catch (err) {
      console.warn("Primary DB upsert failed (continuing):", err);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("handleSyncSignup error:", e);
    return res.status(500).json({ ok: false, error: "unexpected" });
  }
}

export async function handleListUsers(req: Request, res: Response) {
  try {
    const q = String(req.query.q || "")
      .trim()
      .toLowerCase();
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 25));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const config = getSupabaseAdminConfig();

    if (!config) {
      const fallback = await listUsersFromPrimaryDb(q, limit, offset);
      return res.json({
        ok: true,
        data: fallback.rows,
        total: fallback.total,
        limit,
        offset,
      });
    }

    await ensureOrphanCleanup(config);

    const { supabaseUrl, serviceKey } = config;
    const url = new URL(`${supabaseUrl}/rest/v1/app_users`);
    url.searchParams.set("select", SUPABASE_USER_COLUMNS);
    url.searchParams.set("deleted_at", "is.null");
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    if (q) {
      const sanitized = sanitizeSearchTerm(q);
      if (sanitized) {
        const orFilter = [
          `email.ilike.*${sanitized}*`,
          `first_name.ilike.*${sanitized}*`,
          `last_name.ilike.*${sanitized}*`,
          `business_name.ilike.*${sanitized}*`,
        ].join(",");
        url.searchParams.set("or", `(${orFilter})`);
      }
    }

    const resp = await fetch(url.toString(), {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        Prefer: "count=exact",
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Supabase list users failed", resp.status, text);
      const fallback = await listUsersFromPrimaryDb(q, limit, offset);
      return res.json({
        ok: true,
        data: fallback.rows,
        total: fallback.total,
        limit,
        offset,
      });
    }

    const supabaseRows = (await resp.json()) as SupabaseUserRow[];
    const { rows: activeRows, removedIds } = await filterRowsByAuth(
      supabaseRows,
      config,
    );

    const headerTotal = parseContentRange(resp.headers.get("content-range"));
    const total =
      headerTotal !== null
        ? Math.max(0, headerTotal - removedIds.length)
        : activeRows.length;

    return res.json({ ok: true, data: activeRows, total, limit, offset });
  } catch (e) {
    console.error("handleListUsers error", e);
    return res.status(500).json({ ok: false });
  }
}

const updateSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  businessName: z.string().min(1).optional(),
  businessLocation: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  plan: z.enum(["free", "plus", "pro"]).optional(),
});

export async function handleUpdateUser(req: Request, res: Response) {
  try {
    const id = String(req.params.id || "");
    if (!id) return res.status(400).json({ ok: false });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false });
    const u = parsed.data;
    if (Object.keys(u).length === 0) return res.json({ ok: true });

    const sets: string[] = [];
    const params: any[] = [];

    if (u.email) {
      params.push(u.email.toLowerCase());
      sets.push(`email = $${params.length}`);
    }
    if (u.firstName) {
      params.push(u.firstName);
      sets.push(`first_name = $${params.length}`);
    }
    if (u.lastName) {
      params.push(u.lastName);
      sets.push(`last_name = $${params.length}`);
    }
    if (u.businessName) {
      params.push(u.businessName);
      sets.push(`business_name = $${params.length}`);
    }
    if (u.businessLocation !== undefined) {
      params.push(u.businessLocation);
      sets.push(`business_location = $${params.length}`);
    }
    if (u.industry !== undefined) {
      params.push(u.industry);
      sets.push(`industry = $${params.length}`);
    }
    if (u.companySize !== undefined) {
      params.push(u.companySize);
      sets.push(`company_size = $${params.length}`);
    }
    if (u.plan) {
      params.push(u.plan);
      sets.push(`plan = $${params.length}`);
    }

    params.push(id);
    await query(
      `UPDATE public.app_users SET ${sets.join(", ")} WHERE id = $${params.length}`,
      [...params],
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
}

export async function handleDeleteUser(req: Request, res: Response) {
  try {
    const id = String(req.params.id || "");
    if (!id) return res.status(400).json({ ok: false });

    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    if (supabaseUrl && serviceKey) {
      try {
        const restResp = await fetch(
          `${supabaseUrl}/rest/v1/app_users?id=eq.${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              Accept: "application/json",
            },
          } as RequestInit,
        );

        if (!restResp.ok && restResp.status !== 404) {
          const body = await restResp.text();
          console.error("Supabase REST delete failed", restResp.status, body);
          return res
            .status(500)
            .json({ ok: false, error: "supabase_delete_failed" });
        }
      } catch (err) {
        console.error("Supabase REST delete error", err);
        return res
          .status(500)
          .json({ ok: false, error: "supabase_delete_error" });
      }

      try {
        const authResp = await fetch(
          `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
            },
          },
        );

        if (!authResp.ok && authResp.status !== 404) {
          const body = await authResp.text();
          console.error("Supabase auth delete failed", authResp.status, body);
          return res
            .status(500)
            .json({ ok: false, error: "supabase_auth_delete_failed" });
        }
      } catch (err) {
        console.error("Supabase auth delete error", err);
        return res
          .status(500)
          .json({ ok: false, error: "supabase_auth_delete_error" });
      }
    }

    await query(`DELETE FROM public.app_users WHERE id = $1`, [id]);

    return res.json({ ok: true });
  } catch (e) {
    console.error("handleDeleteUser error", e);
    return res.status(500).json({ ok: false });
  }
}

export async function handleGetUser(req: Request, res: Response) {
  try {
    const id = String(req.params.id || "");
    if (!id) return res.status(400).json({ ok: false });

    const config = getSupabaseAdminConfig();
    if (!config) {
      const row = await getUserFromPrimaryDb(id);
      if (!row || row.deleted_at) {
        return res.status(404).json({ ok: false });
      }
      return res.json({ ok: true, data: row });
    }

    const { supabaseUrl, serviceKey } = config;
    const url = new URL(`${supabaseUrl}/rest/v1/app_users`);
    url.searchParams.set("select", SUPABASE_USER_COLUMNS);
    url.searchParams.set("id", `eq.${id}`);
    url.searchParams.set("deleted_at", "is.null");

    const resp = await fetch(url.toString(), {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
      if (resp.status === 404) {
        await markLocalUsersDeleted([id]);
        return res.status(404).json({ ok: false });
      }
      const text = await resp.text();
      console.error("Supabase get user failed", resp.status, text);
      const fallback = await getUserFromPrimaryDb(id);
      if (!fallback || fallback.deleted_at) {
        return res.status(404).json({ ok: false });
      }
      return res.json({ ok: true, data: fallback });
    }

    const supabaseRows = (await resp.json()) as SupabaseUserRow[];
    if (!supabaseRows.length) {
      await markLocalUsersDeleted([id]);
      return res.status(404).json({ ok: false });
    }

    const { rows: activeRows } = await filterRowsByAuth(supabaseRows, config);
    if (!activeRows.length) {
      return res.status(404).json({ ok: false });
    }

    return res.json({ ok: true, data: activeRows[0] });
  } catch (e) {
    console.error("handleGetUser error", e);
    return res.status(500).json({ ok: false });
  }
}

import type { Request, Response } from "express";
import {
  SUPABASE_USER_COLUMNS,
  ensureOrphanCleanup,
  filterRowsByAuth,
  getSupabaseAdminConfig,
  type SupabaseUserRow,
} from "../services/userMaintenance";

function toCompanySizeCategory(input: string): "small" | "medium" | "large" {
  const nums = (input.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  const max = nums.length ? Math.max(...nums) : 0;
  if (max <= 25) return "small";
  if (max <= 100) return "medium";
  return "large";
}

function toEmployeesRange(input: string): string {
  const m = input.match(/\d+\s*-\s*\d+/);
  if (m) return m[0].replace(/\s*/g, "");
  const max =
    (input.match(/\d+/g) || []).map(Number).sort((a, b) => b - a)[0] || 0;
  if (max <= 10) return "1-10";
  if (max <= 50) return "11-50";
  if (max <= 200) return "51-200";
  return "200+";
}

function parseLocation(input: string | null | undefined): {
  city: string;
  state: string;
  country: string;
} {
  const parts = (input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const city = parts[0] || "";
  const country = parts[parts.length - 1] || "";
  const state = parts.length === 3 ? parts[1] : "";
  return { city, state, country };
}

export async function handleDiscoveryList(req: Request, res: Response) {
  try {
    const config = getSupabaseAdminConfig();
    if (!config) {
      return res
        .status(500)
        .json({ ok: false, error: "supabase_not_configured" });
    }

    await ensureOrphanCleanup(config);

    const url = new URL(`${config.supabaseUrl}/rest/v1/app_users`);
    url.searchParams.set("select", SUPABASE_USER_COLUMNS);
    url.searchParams.set("deleted_at", "is.null");
    url.searchParams.set("order", "created_at.desc");

    const resp = await fetch(url.toString(), {
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
      const t = await resp.text();
      return res.status(500).json({
        ok: false,
        error: "supabase_fetch_failed",
        status: resp.status,
        body: t,
      });
    }

    const supabaseRows = (await resp.json()) as SupabaseUserRow[];
    const { rows: activeRows } = await filterRowsByAuth(supabaseRows, config);

    const data = activeRows.map((r) => {
      const { city, state, country } = parseLocation(r.business_location || "");
      const created = r.created_at || new Date().toISOString();
      const companySize = toCompanySizeCategory(r.company_size || "");
      const employees = toEmployeesRange(r.company_size || "");
      const businessName =
        r.business_name || (r.email ? r.email.split("@")[0] : "Business");
      const initials =
        businessName
          .trim()
          .split(/\s+/)
          .map((w) => (w[0] || "").toUpperCase())
          .slice(0, 2)
          .join("") || businessName.slice(0, 2).toUpperCase();

      return {
        id: `biz_${r.id}`,
        name: businessName,
        logo: initials,
        industry: r.industry || "General",
        description: `${businessName} is interested in building partnerships through Tradelink.`,
        email: r.email,
        phone: "",
        website: undefined,
        address: {
          street: "",
          city,
          state,
          postcode: "",
          country,
          coordinates: { lat: -41.2865, lng: 174.7762 },
        },
        companySize,
        foundedYear: new Date(created).getFullYear(),
        employees,
        revenue: undefined,
        verified: false,
        rating: 4.5,
        reviewCount: 0,
        responseTime: "< 24 hours",
        isDemo: false,
        registrationDate: created,
        lastActive: created,
        partnershipTypes: ["Employee Benefits", "Cross-Promotion"],
        seekingTypes: ["Partnerships", "Local Businesses"],
        tags: [r.industry || "", city, country].filter(Boolean),
        aiOverview: undefined,
        matchCriteria: [r.industry || ""].filter(Boolean),
        images: [],
        socialMedia: {},
      };
    });

    return res.json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "unexpected" });
  }
}

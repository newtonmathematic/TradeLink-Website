import { z } from "zod";
import type { Request, Response } from "express";
import {
  createBusinessBlock,
  createProposal,
  createProposalReport,
  getProposalForUser,
  listNotifications,
  listProposalsForUser,
  markNotificationRead,
  recordMessage,
  recordNegotiation,
  updateProposalStatus,
} from "../services/proposals";
import type {
  ProposalParticipantRole,
  ProposalStatus,
} from "@shared/proposals";

const partnerSelectionSchema = z.object({
  partnerId: z.string().min(1),
  partnerName: z.string().min(1),
  partnerIndustry: z.string().optional().nullable(),
  partnerLocation: z.string().optional().nullable(),
});

const outlineSchema = z.object({
  summary: z.string().min(1),
  focusKey: z.string().min(1),
  focusTitle: z.string().min(1),
  focusDescription: z.string().min(1),
});

const contributionsSchema = z.object({
  proposerContribution: z.string().min(1),
  recipientContribution: z.string().min(1),
});

const objectiveRowSchema = z.object({
  id: z.string().min(1),
  proposerOutcome: z.string().min(1),
  recipientOutcome: z.string().min(1),
});

const objectivesSchema = z.object({
  overview: z.string().min(1),
  rows: z.array(objectiveRowSchema).min(1),
});

const termsSchema = z.object({
  startDate: z.string().min(1),
  durationValue: z.coerce.number().nullable(),
  durationUnit: z.enum(["days", "months", "quarters", "years"]).nullable(),
  ongoing: z.boolean(),
  reviewFrequencyValue: z.coerce.number().positive(),
  reviewFrequencyUnit: z.enum(["weeks", "months", "quarters", "years"]),
  terminationOptions: z
    .array(z.enum(["breach", "nonPerformance", "mutualConsent"]))
    .min(1),
  additionalTerms: z.string().default(""),
  computedEndDate: z.string().nullable(),
});

const trackingKpiSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  measurementUnit: z.enum([
    "number",
    "percent",
    "currency",
    "time",
    "resources",
    "exposure",
  ]),
  targetValue: z.string().min(1),
  currency: z.string().nullable(),
  reportFrequencyValue: z.coerce.number().positive(),
  reportFrequencyUnit: z.enum(["days", "months", "years", "custom"]),
});

const trackingSchema = z.object({
  kpis: z.array(trackingKpiSchema).min(1),
});

const contentSchema = z.object({
  partnerSelection: partnerSelectionSchema,
  outline: outlineSchema,
  contributions: contributionsSchema,
  objectives: objectivesSchema,
  terms: termsSchema,
  tracking: trackingSchema,
  additionalNotes: z.string(),
});

const createProposalSchema = z.object({
  proposerId: z.string().min(1),
  proposerName: z.string().min(1),
  recipientId: z.string().min(1),
  recipientName: z.string().min(1),
  title: z.string().optional(),
  summary: z.string().optional(),
  content: contentSchema,
});

const messageSchema = z.object({
  content: z.string().min(1),
  senderName: z.string().min(1),
});

const negotiationSchema = z.object({
  content: contentSchema,
  summary: z.string().optional(),
  actorName: z.string().min(1),
});

const statusActionSchema = z.object({
  action: z.enum(["accept", "decline", "cancel"]),
  note: z.string().optional(),
  actorName: z.string().min(1),
});

const reportSchema = z.object({
  reason: z.string().min(1),
  details: z.string().optional(),
  actorName: z.string().min(1),
});

function getUserId(req: Request): string | null {
  const header = req.header("x-user-id")?.trim();
  if (header) return header;
  if (typeof req.query.userId === "string" && req.query.userId.trim()) {
    return req.query.userId.trim();
  }
  return null;
}

function resolveActorRole(
  result: Awaited<ReturnType<typeof getProposalForUser>>,
  userId: string,
): ProposalParticipantRole {
  if (!result) throw new Error("proposal_not_found");
  if (result.proposerId === userId) {
    return "proposer";
  }
  if (result.recipientId === userId) {
    return "recipient";
  }
  throw new Error("not_authorised");
}

export async function handleCreateProposal(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }

  const parsed = createProposalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        ok: false,
        error: "invalid_payload",
        details: parsed.error.flatten(),
      });
  }

  if (parsed.data.proposerId !== userId) {
    return res.status(403).json({ ok: false, error: "user_mismatch" });
  }

  try {
    const detail = await createProposal({
      proposerId: parsed.data.proposerId,
      proposerName: parsed.data.proposerName,
      recipientId: parsed.data.recipientId,
      recipientName: parsed.data.recipientName,
      title: parsed.data.title ?? null,
      summary: parsed.data.summary ?? null,
      content: parsed.data.content,
    });
    return res.json({ ok: true, data: detail });
  } catch (error) {
    console.error("createProposal failed", error);
    return res.status(500).json({ ok: false, error: "create_failed" });
  }
}

export async function handleListProposals(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  try {
    const items = await listProposalsForUser(userId);
    return res.json({ ok: true, data: items });
  } catch (error) {
    console.error("listProposals failed", error);
    return res.status(500).json({ ok: false, error: "list_failed" });
  }
}

export async function handleGetProposal(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  const { id } = req.params;
  try {
    const detail = await getProposalForUser(id, userId);
    if (!detail) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }
    return res.json({ ok: true, data: detail });
  } catch (error) {
    console.error("getProposal failed", error);
    return res.status(500).json({ ok: false, error: "fetch_failed" });
  }
}

export async function handleProposalAction(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  const { id } = req.params;
  const parsed = statusActionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        ok: false,
        error: "invalid_payload",
        details: parsed.error.flatten(),
      });
  }
  try {
    const detail = await getProposalForUser(id, userId);
    if (!detail) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }
    const role = resolveActorRole(detail, userId);
    const statusMap: Record<string, ProposalStatus> = {
      accept: "accepted",
      decline: "declined",
      cancel: "cancelled",
    };
    const updated = await updateProposalStatus({
      proposalId: id,
      actorId: userId,
      actorName: parsed.data.actorName,
      actorRole: role,
      status: statusMap[parsed.data.action],
      note: parsed.data.note,
    });
    return res.json({ ok: true, data: updated });
  } catch (error) {
    console.error("proposalAction failed", error);
    return res.status(500).json({ ok: false, error: "action_failed" });
  }
}

export async function handleProposalNegotiation(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  const { id } = req.params;
  const parsed = negotiationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        ok: false,
        error: "invalid_payload",
        details: parsed.error.flatten(),
      });
  }

  try {
    const detail = await getProposalForUser(id, userId);
    if (!detail) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }
    const role = resolveActorRole(detail, userId);
    const updated = await recordNegotiation({
      proposalId: id,
      actorId: userId,
      actorName: parsed.data.actorName,
      actorRole: role,
      content: parsed.data.content,
      summary: parsed.data.summary,
    });
    return res.json({ ok: true, data: updated });
  } catch (error) {
    console.error("proposalNegotiation failed", error);
    return res.status(500).json({ ok: false, error: "negotiation_failed" });
  }
}

export async function handleProposalMessage(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  const { id } = req.params;
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        ok: false,
        error: "invalid_payload",
        details: parsed.error.flatten(),
      });
  }

  try {
    const detail = await getProposalForUser(id, userId);
    if (!detail) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }
    const role = resolveActorRole(detail, userId);
    const message = await recordMessage({
      proposalId: id,
      senderId: userId,
      senderName: parsed.data.senderName,
      senderRole: role,
      content: parsed.data.content,
    });
    return res.json({ ok: true, data: message });
  } catch (error) {
    console.error("proposalMessage failed", error);
    return res.status(500).json({ ok: false, error: "message_failed" });
  }
}

export async function handleProposalNotifications(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  const unreadOnly = req.query.unread === "true";
  try {
    const notifications = await listNotifications({ userId, unreadOnly });
    return res.json({ ok: true, data: notifications });
  } catch (error) {
    console.error("listNotifications failed", error);
    return res.status(500).json({ ok: false, error: "notifications_failed" });
  }
}

export async function handleMarkNotificationRead(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  const { id } = req.params;
  try {
    await markNotificationRead(id);
    return res.json({ ok: true });
  } catch (error) {
    console.error("markNotificationRead failed", error);
    return res.status(500).json({ ok: false, error: "mark_failed" });
  }
}

export async function handleProposalReport(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  const { id } = req.params;
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        ok: false,
        error: "invalid_payload",
        details: parsed.error.flatten(),
      });
  }
  try {
    const detail = await getProposalForUser(id, userId);
    if (!detail) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }
    const role = resolveActorRole(detail, userId);
    const report = await createProposalReport({
      proposalId: id,
      reportedBy: userId,
      reporterRole: role,
      reason: parsed.data.reason,
      details: parsed.data.details,
    });
    return res.json({ ok: true, data: report });
  } catch (error) {
    console.error("proposalReport failed", error);
    return res.status(500).json({ ok: false, error: "report_failed" });
  }
}

export async function handleProposalBlock(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "missing_user" });
  }
  const { id } = req.params;
  try {
    const detail = await getProposalForUser(id, userId);
    if (!detail) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }
    const role = resolveActorRole(detail, userId);
    const otherId =
      role === "proposer" ? detail.recipientId : detail.proposerId;
    const block = await createBusinessBlock({
      blockerId: userId,
      blockedId: otherId,
    });
    return res.json({ ok: true, data: block });
  } catch (error) {
    console.error("proposalBlock failed", error);
    return res.status(500).json({ ok: false, error: "block_failed" });
  }
}

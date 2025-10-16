import type {
  BusinessBlock,
  ProposalContent,
  ProposalDetail,
  ProposalListItem,
  ProposalMessage,
  ProposalNotification,
  ProposalNotificationType,
  ProposalParticipantRole,
  ProposalReport,
  ProposalStatus,
  ProposalStepKey,
  ProposalVersion,
} from "@shared/proposals";
import { query } from "../db";

export interface CreateProposalInput {
  proposerId: string;
  proposerName: string;
  recipientId: string;
  recipientName: string;
  title?: string | null;
  summary?: string | null;
  content: ProposalContent;
}

interface ProposalRow {
  id: string;
  proposer_id: string;
  proposer_name: string;
  recipient_id: string;
  recipient_name: string;
  title: string;
  summary: string;
  partner_name: string;
  status: ProposalStatus;
  awaiting_party: ProposalParticipantRole | null;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
  unread_for_proposer: boolean;
  unread_for_recipient: boolean;
}

interface ProposalVersionRow {
  id: string;
  proposal_id: string;
  version_number: number;
  created_by: string;
  created_by_role: ProposalParticipantRole;
  created_at: string;
  step_data: ProposalContent;
  changes_summary: string | null;
  updated_steps: ProposalStepKey[] | null;
}

interface ProposalMessageRow {
  id: string;
  proposal_id: string;
  sender_id: string;
  sender_role: ProposalParticipantRole;
  sender_name: string;
  type: ProposalMessage["type"];
  content: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

interface ProposalNotificationRow {
  id: string;
  user_id: string;
  proposal_id: string;
  type: ProposalNotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

function mapProposalRow(row: ProposalRow): ProposalListItem {
  return {
    id: row.id,
    proposerId: row.proposer_id,
    proposerName: row.proposer_name,
    recipientId: row.recipient_id,
    recipientName: row.recipient_name,
    status: row.status,
    awaitingParty: row.awaiting_party,
    currentVersionId: row.current_version_id ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title,
    summary: row.summary,
    partnerName: row.partner_name,
    unreadForProposer: row.unread_for_proposer,
    unreadForRecipient: row.unread_for_recipient,
  };
}

function mapVersionRow(row: ProposalVersionRow): ProposalVersion {
  return {
    id: row.id,
    proposalId: row.proposal_id,
    versionNumber: row.version_number,
    createdBy: row.created_by,
    createdByRole: row.created_by_role,
    createdAt: row.created_at,
    stepData: row.step_data,
    changesSummary: row.changes_summary ?? undefined,
    updatedSteps: row.updated_steps ?? undefined,
  };
}

function mapMessageRow(row: ProposalMessageRow): ProposalMessage {
  return {
    id: row.id,
    proposalId: row.proposal_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    type: row.type,
    content: row.content,
    createdAt: row.created_at,
    payload: row.payload ?? undefined,
  };
}

function mapNotificationRow(
  row: ProposalNotificationRow,
): ProposalNotification {
  return {
    id: row.id,
    userId: row.user_id,
    proposalId: row.proposal_id,
    type: row.type,
    title: row.title,
    message: row.message,
    metadata: row.metadata ?? undefined,
    actionUrl: row.action_url,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

function determineUpdatedSteps(
  previous: ProposalContent,
  next: ProposalContent,
): ProposalStepKey[] {
  const keys: ProposalStepKey[] = [
    "partnerSelection",
    "outline",
    "contributions",
    "objectives",
    "terms",
    "tracking",
    "additionalNotes",
  ];
  const changed: ProposalStepKey[] = [];
  for (const key of keys) {
    const prevValue = previous[key];
    const nextValue = next[key];
    if (JSON.stringify(prevValue) !== JSON.stringify(nextValue)) {
      changed.push(key);
    }
  }
  return changed;
}

async function insertNotification(params: {
  userId: string;
  proposalId: string;
  type: ProposalNotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown> | null;
}): Promise<ProposalNotification> {
  const { rows } = await query<ProposalNotificationRow>(
    `INSERT INTO proposal_notifications (user_id, proposal_id, type, title, message, metadata, action_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      params.userId,
      params.proposalId,
      params.type,
      params.title,
      params.message,
      params.metadata ?? null,
      params.actionUrl ?? null,
    ],
  );
  return mapNotificationRow(rows[0]);
}

function buildDefaultTitle(
  content: ProposalContent,
  proposerName: string,
): string {
  const partnerName = content.partnerSelection.partnerName;
  const focusTitle = content.outline.focusTitle;
  if (focusTitle?.trim()) {
    return `${focusTitle} partnership`;
  }
  return `${proposerName} ↔ ${partnerName}`;
}

function buildDefaultSummary(content: ProposalContent): string {
  const summary = content.outline.summary?.trim();
  if (summary) return summary;
  const contributions = content.contributions;
  return `${contributions.proposerContribution} / ${contributions.recipientContribution}`;
}

async function loadProposalRow(
  proposalId: string,
): Promise<ProposalRow | null> {
  const { rows } = await query<ProposalRow>(
    `SELECT * FROM proposals WHERE id = $1`,
    [proposalId],
  );
  return rows[0] ?? null;
}

export async function createProposal(
  input: CreateProposalInput,
): Promise<ProposalDetail> {
  const title =
    input.title?.trim() || buildDefaultTitle(input.content, input.proposerName);
  const summary = input.summary?.trim() || buildDefaultSummary(input.content);
  const partnerName = input.content.partnerSelection.partnerName;

  const { rows: proposalRows } = await query<ProposalRow>(
    `INSERT INTO proposals (
       proposer_id,
       proposer_name,
       recipient_id,
       recipient_name,
       title,
       summary,
       partner_name,
       status,
       awaiting_party,
       unread_for_proposer,
       unread_for_recipient
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'awaiting_recipient', 'recipient', false, true)
     RETURNING *`,
    [
      input.proposerId,
      input.proposerName,
      input.recipientId,
      input.recipientName,
      title,
      summary,
      partnerName,
    ],
  );

  const proposal = proposalRows[0];

  const { rows: versionRows } = await query<ProposalVersionRow>(
    `INSERT INTO proposal_versions (
       proposal_id,
       version_number,
       created_by,
       created_by_role,
       step_data,
       changes_summary,
       updated_steps
     ) VALUES ($1, 1, $2, 'proposer', $3, NULL, ARRAY['partnerSelection','outline','contributions','objectives','terms','tracking','additionalNotes'])
     RETURNING *`,
    [proposal.id, input.proposerId, input.content],
  );

  const version = versionRows[0];

  await query(`UPDATE proposals SET current_version_id = $1 WHERE id = $2`, [
    version.id,
    proposal.id,
  ]);

  await query<ProposalMessageRow>(
    `INSERT INTO proposal_messages (
       proposal_id,
       sender_id,
       sender_role,
       sender_name,
       type,
       content,
       payload
     ) VALUES ($1, $2, 'proposer', $3, 'system', $4, $5)`,
    [
      proposal.id,
      input.proposerId,
      input.proposerName,
      "Proposal submitted",
      { versionNumber: version.version_number },
    ],
  );

  await insertNotification({
    userId: input.recipientId,
    proposalId: proposal.id,
    type: "new_proposal",
    title: `New proposal from ${input.proposerName}`,
    message: `${input.proposerName} has sent you a proposal about ${partnerName}.`,
    actionUrl: `/proposals/${proposal.id}`,
    metadata: {
      proposerName: input.proposerName,
      partnerName,
    },
  });

  return await getProposalForUser(proposal.id, input.proposerId);
}

export async function listProposalsForUser(
  userId: string,
): Promise<ProposalListItem[]> {
  const { rows } = await query<ProposalRow>(
    `SELECT *
     FROM proposals
     WHERE proposer_id = $1 OR recipient_id = $1
     ORDER BY updated_at DESC`,
    [userId],
  );

  return rows.map(mapProposalRow);
}

export async function getProposalForUser(
  proposalId: string,
  userId: string,
): Promise<ProposalDetail | null> {
  const proposal = await loadProposalRow(proposalId);
  if (!proposal) return null;
  if (proposal.proposer_id !== userId && proposal.recipient_id !== userId) {
    return null;
  }

  const { rows: versionRows } = await query<ProposalVersionRow>(
    `SELECT *
       FROM proposal_versions
      WHERE proposal_id = $1
      ORDER BY version_number ASC`,
    [proposalId],
  );

  const { rows: messageRows } = await query<ProposalMessageRow>(
    `SELECT * FROM proposal_messages WHERE proposal_id = $1 ORDER BY created_at ASC`,
    [proposalId],
  );

  const latestVersion = versionRows.find(
    (v) => v.id === proposal.current_version_id,
  );
  const content =
    latestVersion?.step_data ?? versionRows[versionRows.length - 1]?.step_data;
  if (!content) {
    throw new Error("Proposal content missing");
  }

  const detail: ProposalDetail = {
    ...mapProposalRow(proposal),
    content,
    versions: versionRows.map(mapVersionRow),
    messages: messageRows.map(mapMessageRow),
  };

  const unreadColumn =
    proposal.proposer_id === userId
      ? "unread_for_proposer"
      : "unread_for_recipient";
  if (proposal[unreadColumn as keyof ProposalRow]) {
    await query(`UPDATE proposals SET ${unreadColumn} = FALSE WHERE id = $1`, [
      proposalId,
    ]);
  }

  return detail;
}

export async function recordMessage(params: {
  proposalId: string;
  senderId: string;
  senderName: string;
  senderRole: ProposalParticipantRole;
  content: string;
  type?: ProposalMessage["type"];
  payload?: Record<string, unknown> | null;
  notifyOtherParty?: boolean;
}): Promise<ProposalMessage> {
  const type = params.type ?? "message";
  const { rows } = await query<ProposalMessageRow>(
    `INSERT INTO proposal_messages (
       proposal_id,
       sender_id,
       sender_role,
       sender_name,
       type,
       content,
       payload
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      params.proposalId,
      params.senderId,
      params.senderRole,
      params.senderName,
      type,
      params.content,
      params.payload ?? null,
    ],
  );

  const proposal = await loadProposalRow(params.proposalId);
  if (proposal) {
    const isProposer = params.senderRole === "proposer";
    const unreadColumn = isProposer
      ? "unread_for_recipient"
      : "unread_for_proposer";
    await query(
      `UPDATE proposals SET ${unreadColumn} = TRUE, updated_at = now() WHERE id = $1`,
      [params.proposalId],
    );
  }

  if (params.notifyOtherParty !== false) {
    const proposalRow = proposal ?? (await loadProposalRow(params.proposalId));
    if (proposalRow) {
      const recipientId =
        params.senderRole === "proposer"
          ? proposalRow.recipient_id
          : proposalRow.proposer_id;
      await insertNotification({
        userId: recipientId,
        proposalId: params.proposalId,
        type: type === "message" ? "message" : "negotiation_update",
        title:
          type === "message"
            ? `New message from ${params.senderName}`
            : `Proposal updated by ${params.senderName}`,
        message: params.content,
        actionUrl: `/proposals/${params.proposalId}`,
        metadata: params.payload ?? undefined,
      });
    }
  }

  return mapMessageRow(rows[0]);
}

export async function updateProposalStatus(params: {
  proposalId: string;
  actorId: string;
  actorName: string;
  actorRole: ProposalParticipantRole;
  status: Extract<ProposalStatus, "accepted" | "declined" | "cancelled">;
  note?: string;
}): Promise<ProposalDetail> {
  const proposal = await loadProposalRow(params.proposalId);
  if (!proposal) {
    throw new Error("proposal_not_found");
  }

  await query(
    `UPDATE proposals
       SET status = $1,
           awaiting_party = NULL,
           unread_for_proposer = CASE WHEN $2 = 'proposer' THEN unread_for_proposer ELSE TRUE END,
           unread_for_recipient = CASE WHEN $2 = 'recipient' THEN unread_for_recipient ELSE TRUE END,
           updated_at = now()
     WHERE id = $3`,
    [params.status, params.actorRole, params.proposalId],
  );

  const otherRole: ProposalParticipantRole =
    params.actorRole === "proposer" ? "recipient" : "proposer";
  const otherId =
    otherRole === "proposer" ? proposal.proposer_id : proposal.recipient_id;
  const otherName =
    otherRole === "proposer" ? proposal.proposer_name : proposal.recipient_name;

  const messageContent =
    params.note?.trim() ||
    (params.status === "accepted"
      ? `${params.actorName} accepted the proposal.`
      : params.status === "declined"
        ? `${params.actorName} declined the proposal.`
        : `${params.actorName} cancelled the proposal.`);

  await recordMessage({
    proposalId: params.proposalId,
    senderId: params.actorId,
    senderName: params.actorName,
    senderRole: params.actorRole,
    content: messageContent,
    type: "status_change",
    notifyOtherParty: false,
  });

  await insertNotification({
    userId: otherId,
    proposalId: params.proposalId,
    type: "status_change",
    title: `${params.actorName} ${params.status === "accepted" ? "accepted" : params.status === "declined" ? "declined" : "cancelled"} the proposal`,
    message:
      params.note?.trim() ||
      `${params.actorName} has ${params.status} the proposal with ${otherName}.`,
    actionUrl: `/proposals/${params.proposalId}`,
  });

  return await getProposalForUser(params.proposalId, params.actorId);
}

export async function recordNegotiation(params: {
  proposalId: string;
  actorId: string;
  actorName: string;
  actorRole: ProposalParticipantRole;
  content: ProposalContent;
  summary?: string;
}): Promise<ProposalDetail> {
  const proposal = await loadProposalRow(params.proposalId);
  if (!proposal) {
    throw new Error("proposal_not_found");
  }

  const { rows: currentVersionRows } = await query<ProposalVersionRow>(
    `SELECT * FROM proposal_versions WHERE id = $1`,
    [proposal.current_version_id],
  );
  const currentVersion = currentVersionRows[0];
  if (!currentVersion) {
    throw new Error("proposal_version_missing");
  }

  const updatedSteps = determineUpdatedSteps(
    currentVersion.step_data,
    params.content,
  );
  const { rows: versionRows } = await query<ProposalVersionRow>(
    `INSERT INTO proposal_versions (
       proposal_id,
       version_number,
       created_by,
       created_by_role,
       step_data,
       changes_summary,
       updated_steps
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      params.proposalId,
      currentVersion.version_number + 1,
      params.actorId,
      params.actorRole,
      params.content,
      params.summary ?? null,
      updatedSteps,
    ],
  );
  const newVersion = versionRows[0];

  const awaitingParty: ProposalParticipantRole =
    params.actorRole === "proposer" ? "recipient" : "proposer";

  const newStatus: ProposalStatus = "under_negotiation";

  await query(
    `UPDATE proposals
       SET current_version_id = $1,
           status = $2,
           awaiting_party = $3,
           summary = CASE WHEN $4 IS NULL OR length($4) = 0 THEN summary ELSE $4 END,
           updated_at = now(),
           unread_for_proposer = CASE WHEN $5 = 'proposer' THEN unread_for_proposer ELSE TRUE END,
           unread_for_recipient = CASE WHEN $5 = 'recipient' THEN unread_for_recipient ELSE TRUE END
     WHERE id = $6`,
    [
      newVersion.id,
      newStatus,
      awaitingParty,
      params.content.outline.summary ?? null,
      params.actorRole,
      params.proposalId,
    ],
  );

  const message = params.summary?.trim()
    ? params.summary.trim()
    : `${params.actorName} suggested updates to the proposal.`;

  await recordMessage({
    proposalId: params.proposalId,
    senderId: params.actorId,
    senderName: params.actorName,
    senderRole: params.actorRole,
    content: message,
    type: "negotiation_request",
    payload: {
      updatedSteps,
    },
    notifyOtherParty: false,
  });

  const otherId =
    awaitingParty === "proposer" ? proposal.proposer_id : proposal.recipient_id;

  await insertNotification({
    userId: otherId,
    proposalId: params.proposalId,
    type: "negotiation_update",
    title: `${params.actorName} proposed changes`,
    message,
    actionUrl: `/proposals/${params.proposalId}`,
    metadata: {
      updatedSteps,
    },
  });

  return await getProposalForUser(params.proposalId, params.actorId);
}

export async function createProposalReport(params: {
  proposalId: string;
  reportedBy: string;
  reporterRole: ProposalParticipantRole;
  reason: string;
  details?: string;
}): Promise<ProposalReport> {
  const { rows } = await query<ProposalReport>(
    `INSERT INTO proposal_reports (proposal_id, reported_by, reporter_role, reason, details)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      params.proposalId,
      params.reportedBy,
      params.reporterRole,
      params.reason,
      params.details ?? null,
    ],
  );
  return rows[0];
}

export async function createBusinessBlock(params: {
  blockerId: string;
  blockedId: string;
}): Promise<BusinessBlock> {
  const { rows } = await query<BusinessBlock>(
    `INSERT INTO business_blocks (blocker_id, blocked_id)
     VALUES ($1, $2)
     ON CONFLICT (blocker_id, blocked_id)
     DO UPDATE SET created_at = business_blocks.created_at
     RETURNING *`,
    [params.blockerId, params.blockedId],
  );
  return rows[0];
}

export async function listNotifications(params: {
  userId: string;
  unreadOnly?: boolean;
}): Promise<ProposalNotification[]> {
  const { rows } = await query<ProposalNotificationRow>(
    `SELECT * FROM proposal_notifications
      WHERE user_id = $1 AND ($2::boolean IS FALSE OR is_read = FALSE)
      ORDER BY created_at DESC
      LIMIT 200`,
    [params.userId, params.unreadOnly ?? false],
  );
  return rows.map(mapNotificationRow);
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  await query(
    `UPDATE proposal_notifications SET is_read = TRUE WHERE id = $1`,
    [notificationId],
  );
}

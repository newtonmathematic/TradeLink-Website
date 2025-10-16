export type ProposalStatus =
  | "draft"
  | "awaiting_recipient"
  | "awaiting_proposer"
  | "under_negotiation"
  | "accepted"
  | "declined"
  | "cancelled"
  | "expired";

export type ProposalParticipantRole = "proposer" | "recipient";

export type ProposalStepKey =
  | "partnerSelection"
  | "outline"
  | "contributions"
  | "objectives"
  | "terms"
  | "tracking"
  | "additionalNotes";

export type DurationUnit = "days" | "months" | "quarters" | "years";
export type ReviewUnit = "weeks" | "months" | "quarters" | "years";
export type MeasurementUnit =
  | "number"
  | "percent"
  | "currency"
  | "time"
  | "resources"
  | "exposure";
export type FrequencyUnit = "days" | "months" | "years" | "custom";
export type TerminationOption = "breach" | "nonPerformance" | "mutualConsent";

export interface PartnerSelectionStep {
  partnerId: string;
  partnerName: string;
  partnerIndustry?: string;
  partnerLocation?: string;
}

export interface OutlineStep {
  summary: string;
  focusKey: string;
  focusTitle: string;
  focusDescription: string;
}

export interface ContributionsStep {
  proposerContribution: string;
  recipientContribution: string;
}

export interface ObjectiveRow {
  id: string;
  proposerOutcome: string;
  recipientOutcome: string;
}

export interface ObjectivesStep {
  overview: string;
  rows: ObjectiveRow[];
}

export interface TermsStep {
  startDate: string;
  durationValue: number | null;
  durationUnit: DurationUnit | null;
  ongoing: boolean;
  reviewFrequencyValue: number;
  reviewFrequencyUnit: ReviewUnit;
  terminationOptions: TerminationOption[];
  additionalTerms: string;
  computedEndDate: string | null;
}

export interface TrackingKpiRow {
  id: string;
  name: string;
  measurementUnit: MeasurementUnit;
  targetValue: string;
  currency: string | null;
  reportFrequencyValue: number;
  reportFrequencyUnit: FrequencyUnit;
}

export interface TrackingStep {
  kpis: TrackingKpiRow[];
}

export interface ProposalContentMap {
  partnerSelection: PartnerSelectionStep;
  outline: OutlineStep;
  contributions: ContributionsStep;
  objectives: ObjectivesStep;
  terms: TermsStep;
  tracking: TrackingStep;
  additionalNotes: string;
}

export type ProposalContent = {
  [K in ProposalStepKey]: ProposalContentMap[K];
};

export type ProposalStepPatch = {
  [K in ProposalStepKey]: {
    stepKey: K;
    value: Partial<ProposalContentMap[K]>;
  };
}[ProposalStepKey];

export interface ProposalNegotiationChange extends ProposalStepPatch {
  changeType: "request_change" | "add_content";
  summary: string;
}

export interface ProposalVersion {
  id: string;
  proposalId: string;
  versionNumber: number;
  createdBy: string;
  createdByRole: ProposalParticipantRole;
  createdAt: string;
  stepData: ProposalContent;
  changesSummary?: string;
  updatedSteps?: ProposalStepKey[];
}

export type ProposalMessageType =
  | "message"
  | "status_change"
  | "system"
  | "negotiation_request"
  | "negotiation_response";

export interface ProposalMessage {
  id: string;
  proposalId: string;
  senderId: string;
  senderRole: ProposalParticipantRole;
  senderName: string;
  type: ProposalMessageType;
  content: string;
  createdAt: string;
  payload?: Record<string, unknown> | null;
}

export type ProposalNotificationType =
  | "new_proposal"
  | "status_change"
  | "negotiation_update"
  | "message";

export interface ProposalNotification {
  id: string;
  userId: string;
  proposalId: string;
  type: ProposalNotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ProposalListItem {
  id: string;
  proposerId: string;
  proposerName: string;
  recipientId: string;
  recipientName: string;
  status: ProposalStatus;
  awaitingParty: ProposalParticipantRole | null;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  summary: string;
  partnerName: string;
  unreadForProposer: boolean;
  unreadForRecipient: boolean;
}

export interface ProposalDetail extends ProposalListItem {
  content: ProposalContent;
  versions: ProposalVersion[];
  messages: ProposalMessage[];
}

export interface ProposalReport {
  id: string;
  proposalId: string;
  reportedBy: string;
  reporterRole: ProposalParticipantRole;
  reason: string;
  details?: string;
  createdAt: string;
}

export interface BusinessBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

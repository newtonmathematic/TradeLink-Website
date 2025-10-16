import type {
  ProposalContent,
  ProposalDetail,
  ProposalListItem,
  ProposalMessage,
  ProposalNotification,
} from "@shared/proposals";

const API_BASE = "/api/proposals";

export type TemplateCategory =
  | "informal_local"
  | "formal_enterprise"
  | "service_exchange"
  | "employee_benefits";

export interface DealTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  structure: string;
  requiredFields: string[];
  sampleValues?: Record<string, string>;
  isPopular?: boolean;
}

const templates: DealTemplate[] = [
  {
    id: "template_001",
    name: "Employee Discount Exchange",
    category: "informal_local",
    description:
      "Simple mutual employee discount programme between local partners",
    structure:
      "Employees of [Business A] receive [Discount A]% discount at [Business B], while employees of [Business B] receive [Discount B]% discount at [Business A].",
    requiredFields: ["Business A", "Business B", "Discount A", "Discount B"],
    sampleValues: {
      "Discount A": "15",
      "Discount B": "10",
    },
    isPopular: true,
  },
  {
    id: "template_002",
    name: "Joint Marketing Campaign",
    category: "service_exchange",
    description:
      "Coordinate a shared marketing initiative with cross-promotion responsibilities",
    structure:
      "[Business A] and [Business B] collaborate on a joint marketing campaign focused on [Campaign Focus]. [Business A] will provide [Contribution A], while [Business B] delivers [Contribution B]. The campaign will run for [Campaign Duration] with shared reporting every [Reporting Cadence].",
    requiredFields: [
      "Business A",
      "Business B",
      "Campaign Focus",
      "Contribution A",
      "Contribution B",
      "Campaign Duration",
      "Reporting Cadence",
    ],
    sampleValues: {
      "Campaign Focus": "community engagement",
      "Contribution A": "social media promotion",
      "Contribution B": "on-site events",
      "Campaign Duration": "8 weeks",
      "Reporting Cadence": "fortnightly",
    },
  },
  {
    id: "template_003",
    name: "Annual Service Agreement",
    category: "formal_enterprise",
    description:
      "Formal year-long agreement outlining service delivery and review points",
    structure:
      "[Business A] will provide [Services] to [Business B] starting [Start Date]. The agreement runs for [Duration] with renewal discussions every [Review Frequency]. Pricing is set at [Pricing Model] with payment terms of [Payment Terms].",
    requiredFields: [
      "Business A",
      "Business B",
      "Services",
      "Start Date",
      "Duration",
      "Review Frequency",
      "Pricing Model",
      "Payment Terms",
    ],
    sampleValues: {
      Services: "IT support and maintenance",
      "Start Date": "1 March 2025",
      Duration: "12 months",
      "Review Frequency": "quarterly",
      "Pricing Model": "$4,500 per quarter",
      "Payment Terms": "Net 30",
    },
    isPopular: true,
  },
  {
    id: "template_004",
    name: "Wellness Benefits Programme",
    category: "employee_benefits",
    description:
      "Provide ongoing wellness benefits to partner employees with defined redemption rules",
    structure:
      "[Business A] offers [Benefit Package] to employees of [Business B] with a [Discount Rate]% discount. Benefits include [Included Services] with a monthly allocation of [Allocation Details]. Programme reviews occur every [Review Frequency].",
    requiredFields: [
      "Business A",
      "Business B",
      "Benefit Package",
      "Discount Rate",
      "Included Services",
      "Allocation Details",
      "Review Frequency",
    ],
    sampleValues: {
      "Benefit Package": "gym access and wellness workshops",
      "Discount Rate": "25",
      "Included Services": "group classes, nutrition coaching",
      "Allocation Details": "4 class passes per month",
      "Review Frequency": "6 months",
    },
  },
];

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export type ProposalAction = "accept" | "decline" | "cancel";

export interface CreateProposalPayload {
  proposerId: string;
  proposerName: string;
  recipientId: string;
  recipientName: string;
  title?: string;
  summary?: string;
  content: ProposalContent;
}

interface NegotiationPayload {
  content: ProposalContent;
  summary?: string;
  actorName: string;
}

interface MessagePayload {
  senderName: string;
  content: string;
}

interface ReportPayload {
  reason: string;
  details?: string;
  actorName: string;
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: Record<string, unknown> | null;
  signal?: AbortSignal;
}

const listeners = new Set<() => void>();

function notifySubscribers() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error("ProposalService subscriber error", error);
    }
  });
}

async function request<T>(
  userId: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal } = options;
  const headers = new Headers();
  headers.set("x-user-id", userId);

  const init: RequestInit = { method, headers, signal };

  if (method !== "GET") {
    headers.set("Content-Type", "application/json");
    const payload = body ?? {};
    init.body = JSON.stringify(payload);
  }

  const response = await fetch(path, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse<T>;
  if (!json.ok) {
    throw new Error(json.error || "Unknown error");
  }
  return json.data as T;
}

export class ProposalService {
  static subscribe(callback: () => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  static async list(userId: string): Promise<ProposalListItem[]> {
    return request<ProposalListItem[]>(userId, `${API_BASE}`);
  }

  static async get(
    userId: string,
    proposalId: string,
  ): Promise<ProposalDetail> {
    return request<ProposalDetail>(userId, `${API_BASE}/${proposalId}`);
  }

  static async create(
    userId: string,
    payload: CreateProposalPayload,
  ): Promise<ProposalDetail> {
    const detail = await request<ProposalDetail>(userId, `${API_BASE}`, {
      method: "POST",
      body: payload,
    });
    notifySubscribers();
    return detail;
  }

  static async act(
    userId: string,
    proposalId: string,
    actorName: string,
    action: ProposalAction,
    note?: string,
  ): Promise<ProposalDetail> {
    const detail = await request<ProposalDetail>(
      userId,
      `${API_BASE}/${proposalId}/actions`,
      {
        method: "POST",
        body: { action, note, actorName },
      },
    );
    notifySubscribers();
    return detail;
  }

  static async negotiate(
    userId: string,
    proposalId: string,
    payload: NegotiationPayload,
  ): Promise<ProposalDetail> {
    const detail = await request<ProposalDetail>(
      userId,
      `${API_BASE}/${proposalId}/negotiations`,
      {
        method: "POST",
        body: payload,
      },
    );
    notifySubscribers();
    return detail;
  }

  static async sendMessage(
    userId: string,
    proposalId: string,
    payload: MessagePayload,
  ): Promise<ProposalMessage> {
    const message = await request<ProposalMessage>(
      userId,
      `${API_BASE}/${proposalId}/messages`,
      {
        method: "POST",
        body: payload,
      },
    );
    notifySubscribers();
    return message;
  }

  static async report(
    userId: string,
    proposalId: string,
    payload: ReportPayload,
  ) {
    const report = await request(userId, `${API_BASE}/${proposalId}/report`, {
      method: "POST",
      body: payload,
    });
    notifySubscribers();
    return report;
  }

  static async block(userId: string, proposalId: string) {
    const block = await request(userId, `${API_BASE}/${proposalId}/block`, {
      method: "POST",
      body: {},
    });
    notifySubscribers();
    return block;
  }

  static async notifications(
    userId: string,
    options?: { unreadOnly?: boolean },
  ): Promise<ProposalNotification[]> {
    const params = options?.unreadOnly ? "?unread=true" : "";
    return request<ProposalNotification[]>(
      userId,
      `${API_BASE}/notifications${params}`,
    );
  }

  static async markNotificationRead(userId: string, notificationId: string) {
    await request<void>(
      userId,
      `${API_BASE}/notifications/${notificationId}/read`,
      { method: "POST", body: {} },
    );
  }

  static getTemplates(): DealTemplate[] {
    return templates;
  }

  static getTemplatesByCategory(category: TemplateCategory): DealTemplate[] {
    return templates.filter((template) => template.category === category);
  }

  static getTemplateById(id: string): DealTemplate | null {
    return templates.find((template) => template.id === id) ?? null;
  }

  static getPopularTemplates(): DealTemplate[] {
    return templates.filter((template) => template.isPopular);
  }
}

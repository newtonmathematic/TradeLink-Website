export type TicketType = "contact" | "abuse" | "technical";

export interface SupportTicket {
  id: string;
  businessId: string;
  type: TicketType;
  subject: string;
  message: string;
  targetBusinessId?: string;
  email?: string;
  createdAt: string;
  status: "open" | "closed";
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

const KEY_TICKETS = "tradelink_support_tickets";
const KEY_FAQS = "tradelink_support_faqs";

let tickets: SupportTicket[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY_TICKETS) || "[]");
  } catch {
    return [];
  }
})();
let faqs: FAQItem[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY_FAQS) || "[]");
  } catch {
    return [];
  }
})();

if (faqs.length === 0) {
  faqs = [
    {
      id: "f1",
      q: "How do I start a partnership?",
      a: "Select Create Proposal in the sidebar, choose a partner, and follow the guided steps to propose terms.",
    },
    {
      id: "f2",
      q: "How do messaging approvals work?",
      a: "The recipient previews your first message and can accept or decline before the chat becomes active.",
    },
    {
      id: "f3",
      q: "How do I verify my business?",
      a: "Open Verification, upload your roster, generate QR codes, and complete checks as prompted.",
    },
    {
      id: "f4",
      q: "Why can't I message a business?",
      a: "They may have blocked you or declined your chat. You can still propose deals if allowed.",
    },
  ];
  try {
    localStorage.setItem(KEY_FAQS, JSON.stringify(faqs));
  } catch {}
}

const saveTickets = () => {
  try {
    localStorage.setItem(KEY_TICKETS, JSON.stringify(tickets));
  } catch {}
};

export class SupportService {
  static listFAQs(): FAQItem[] {
    return [...faqs];
  }
  static searchFAQs(query: string): FAQItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.listFAQs();
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }
  static createTicket(
    input: Omit<SupportTicket, "id" | "createdAt" | "status">,
  ): SupportTicket {
    const t: SupportTicket = {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: "open",
      ...input,
    };
    tickets.push(t);
    saveTickets();
    return t;
  }
  static listTickets(businessId: string): SupportTicket[] {
    return tickets
      .filter((t) => t.businessId === businessId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

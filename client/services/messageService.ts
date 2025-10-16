import {
  BusinessService,
  type BusinessProfile,
} from "@/services/businessService";
import { BlockService } from "@/services/blockService";

export type ConversationStatus = "pending" | "active" | "declined";

export interface Message {
  id: string;
  conversationId: string;
  senderBusinessId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: [string, string]; // business ids
  createdAt: string;
  updatedAt: string;
  status: ConversationStatus;
  createdBy: string; // business id
  pendingApprovalFor?: string; // recipient business id when pending
  messages: Message[]; // includes the first message
}

const MSG_STORAGE_KEY = "tradelink_conversations";
let subscribers: Array<() => void> = [];

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

let store: Conversation[] = safeParse<Conversation[]>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem(MSG_STORAGE_KEY)
    : null,
  [],
);

const save = () => {
  try {
    localStorage.setItem(MSG_STORAGE_KEY, JSON.stringify(store));
  } catch {}
};

const notify = () => {
  save();
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
};

const sortByUpdatedDesc = (a: Conversation, b: Conversation) =>
  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

function normalizePair(a: string, b: string): [string, string] {
  return a < b ? ([a, b] as [string, string]) : ([b, a] as [string, string]);
}

export class MessageService {
  static subscribe(cb: () => void): () => void {
    subscribers.push(cb);
    return () => {
      subscribers = subscribers.filter((x) => x !== cb);
    };
  }

  static listConversations(businessId: string): Conversation[] {
    return store
      .filter((c) => c.participants.includes(businessId))
      .sort(sortByUpdatedDesc);
  }

  static getConversationById(id: string): Conversation | undefined {
    return store.find((c) => c.id === id);
  }

  static getConversationBetween(
    a: string,
    b: string,
  ): Conversation | undefined {
    const pair = normalizePair(a, b);
    return store.find(
      (c) =>
        c.participants[0] === pair[0] &&
        c.participants[1] === pair[1] &&
        c.status !== "declined",
    );
  }

  static getRecipientUserId(businessId: string): string | null {
    if (businessId.startsWith("biz_")) return businessId.slice(4);
    return null;
  }

  static startConversation(
    fromBusinessId: string,
    toBusinessId: string,
    firstMessage: string,
  ): Conversation {
    if (!firstMessage.trim()) {
      throw new Error("Message cannot be empty");
    }
    if (
      BlockService.isBlocked(toBusinessId, fromBusinessId) ||
      BlockService.isBlocked(fromBusinessId, toBusinessId)
    ) {
      throw new Error("Messaging is blocked between these businesses");
    }
    const existing = this.getConversationBetween(fromBusinessId, toBusinessId);
    if (existing && existing.status === "active") {
      // If already active, append as a new message instead of creating duplicate conv
      this.sendMessage(existing.id, fromBusinessId, firstMessage);
      const conv = this.getConversationById(existing.id);
      if (!conv) throw new Error("Conversation not found after send");
      return conv;
    }

    const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const pair = normalizePair(fromBusinessId, toBusinessId);

    const message: Message = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversationId: id,
      senderBusinessId: fromBusinessId,
      content: firstMessage,
      createdAt: now,
    };

    const conv: Conversation = {
      id,
      participants: pair,
      createdAt: now,
      updatedAt: now,
      status: "pending",
      createdBy: fromBusinessId,
      pendingApprovalFor: toBusinessId,
      messages: [message],
    };

    store.unshift(conv);
    notify();

    return conv;
  }

  static approveConversation(
    conversationId: string,
    approverBusinessId: string,
  ) {
    const conv = this.getConversationById(conversationId);
    if (!conv) throw new Error("Conversation not found");
    if (conv.status !== "pending") return;
    if (
      conv.pendingApprovalFor &&
      conv.pendingApprovalFor !== approverBusinessId
    ) {
      throw new Error("Only the recipient can approve this conversation");
    }
    conv.status = "active";
    conv.pendingApprovalFor = undefined;
    conv.updatedAt = new Date().toISOString();
    notify();
  }

  static declineConversation(
    conversationId: string,
    declinerBusinessId: string,
  ) {
    const conv = this.getConversationById(conversationId);
    if (!conv) throw new Error("Conversation not found");
    if (conv.status !== "pending") return;
    if (
      conv.pendingApprovalFor &&
      conv.pendingApprovalFor !== declinerBusinessId
    ) {
      throw new Error("Only the recipient can decline this conversation");
    }
    conv.status = "declined";
    conv.updatedAt = new Date().toISOString();
    notify();
  }

  static ensureConversation(
    fromBusinessId: string,
    toBusinessId: string,
  ): Conversation {
    const existing = this.getConversationBetween(fromBusinessId, toBusinessId);
    if (existing) return existing;
    return this.startConversation(
      fromBusinessId,
      toBusinessId,
      "Hello, I'd like to connect.",
    );
  }

  static sendMessage(
    conversationId: string,
    fromBusinessId: string,
    content: string,
  ) {
    const conv = this.getConversationById(conversationId);
    if (!conv) throw new Error("Conversation not found");
    if (conv.status !== "active") {
      throw new Error("Conversation is not active");
    }
    if (!conv.participants.includes(fromBusinessId)) {
      throw new Error("Sender is not part of the conversation");
    }
    const otherId = conv.participants.find((p) => p !== fromBusinessId)!;
    if (
      BlockService.isBlocked(otherId, fromBusinessId) ||
      BlockService.isBlocked(fromBusinessId, otherId)
    ) {
      throw new Error("Messaging is blocked between these businesses");
    }
    const msg: Message = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversationId: conversationId,
      senderBusinessId: fromBusinessId,
      content: content,
      createdAt: new Date().toISOString(),
    };
    conv.messages.push(msg);
    conv.updatedAt = msg.createdAt;
    // keep most recent first
    store = store.sort(sortByUpdatedDesc);
    notify();
  }

  static getOtherParticipant(
    conv: Conversation,
    myBusinessId: string,
  ): BusinessProfile | null {
    const otherId = conv.participants.find((p) => p !== myBusinessId);
    if (!otherId) return null;
    return BusinessService.getBusinessById(otherId);
  }
}

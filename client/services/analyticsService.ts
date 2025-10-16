export type AnalyticsEventType = "redemption" | "partnership" | "negotiation";

export interface AnalyticsEvent {
  id: string;
  businessId: string; // current user's business id
  type: AnalyticsEventType;
  value?: number;
  meta?: Record<string, any>;
  createdAt: string; // ISO
}

const STORAGE_KEY = "tradelink_analytics_events";
let subs: Array<() => void> = [];

const parse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};

let events: AnalyticsEvent[] = parse(
  typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null,
  [],
);

const persist = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch {} };
const notify = () => { persist(); subs.forEach((cb)=>{ try{cb();}catch{}}); };

export class AnalyticsService {
  static subscribe(cb: () => void) { subs.push(cb); return () => { subs = subs.filter(x=>x!==cb); }; }
  static list(businessId?: string): AnalyticsEvent[] {
    return businessId ? events.filter(e=>e.businessId===businessId) : [...events];
  }
  static record(evt: Omit<AnalyticsEvent, "id"|"createdAt"> & { createdAt?: string }) {
    const e: AnalyticsEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      createdAt: evt.createdAt || new Date().toISOString(),
      ...evt,
    };
    events.push(e); notify(); return e;
  }
  static clearAll() { events = []; notify(); }

  static aggregateByPeriod(businessId: string, period: "week"|"month", type?: AnalyticsEventType) {
    const now = new Date();
    const buckets: { label: string; value: number }[] = [];
    const count = 12; // last 12 weeks/months
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now);
      if (period === "week") {
        d.setDate(now.getDate() - i * 7);
        const start = new Date(d); start.setDate(d.getDate() - d.getDay()); start.setHours(0,0,0,0);
        const end = new Date(start); end.setDate(start.getDate()+7);
        const label = `${start.getMonth()+1}/${start.getDate()}`;
        const v = this.list(businessId).filter(e=>(!type||e.type===type) && new Date(e.createdAt)>=start && new Date(e.createdAt)<end).length;
        buckets.push({ label, value: v });
      } else {
        const start = new Date(d.getFullYear(), d.getMonth()-i, 1);
        const end = new Date(start.getFullYear(), start.getMonth()+1, 1);
        const label = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,"0")}`;
        const v = this.list(businessId).filter(e=>(!type||e.type===type) && new Date(e.createdAt)>=start && new Date(e.createdAt)<end).length;
        buckets.push({ label, value: v });
      }
    }
    return buckets;
  }
}

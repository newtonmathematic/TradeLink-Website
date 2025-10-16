const KEY = "tradelink_blocked";

type Store = { [businessId: string]: string[] };

let store: Store = (()=>{ try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } })();

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} };

export class BlockService {
  static block(businessId: string, targetId: string) {
    if (!store[businessId]) store[businessId] = [];
    if (!store[businessId].includes(targetId)) store[businessId].push(targetId);
    save();
  }
  static unblock(businessId: string, targetId: string) {
    if (!store[businessId]) return;
    store[businessId] = store[businessId].filter((x)=> x !== targetId);
    save();
  }
  static isBlocked(businessId: string, targetId: string) {
    return !!store[businessId]?.includes(targetId);
  }
  static listBlocked(businessId: string) {
    return [...(store[businessId] || [])];
  }
}

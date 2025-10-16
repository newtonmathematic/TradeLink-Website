export interface Employee { id: string; name: string; email: string; active: boolean; }
export interface QRCode { id: string; employeeId: string; svgDataUrl: string; createdAt: string; }
export interface DigitalPass { id: string; employeeId: string; title: string; expiresAt?: string; createdAt: string; }
export interface RedemptionLog { id: string; employeeId: string; partner?: string; value?: number; createdAt: string; }

const KEY = "tradelink_verification";

type Store = {
  [businessId: string]: {
    employees: Employee[];
    qrcodes: QRCode[];
    passes: DigitalPass[];
    logs: RedemptionLog[];
  };
};

let subscribers: Array<() => void> = [];

const parse = <T>(raw: string | null, fallback: T): T => { if (!raw) return fallback; try { return JSON.parse(raw) as T; } catch { return fallback; } };
let store: Store = parse(typeof localStorage!=="undefined"?localStorage.getItem(KEY):null, {} as Store);

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} };
const notify = () => { save(); subscribers.forEach(cb=>{ try{cb();}catch{}}); };

function ensure(businessId: string) {
  if (!store[businessId]) store[businessId] = { employees: [], qrcodes: [], passes: [], logs: [] };
  return store[businessId];
}

function simpleQrSvg(content: string): string {
  const encoded = encodeURIComponent(content);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='100%' height='100%' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12'>${encoded}</text><rect x='10' y='10' width='20' height='20' fill='black'/><rect x='226' y='10' width='20' height='20' fill='black'/><rect x='10' y='226' width='20' height='20' fill='black'/></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

export class VerificationService {
  static subscribe(cb: () => void) { subscribers.push(cb); return () => { subscribers = subscribers.filter(x=>x!==cb); }; }

  static listEmployees(businessId: string) { return ensure(businessId).employees; }
  static addEmployee(businessId: string, name: string, email: string) {
    const e = { id: `emp_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name, email, active: true };
    ensure(businessId).employees.push(e); notify(); return e;
  }
  static uploadRoster(businessId: string, text: string) {
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    for (const line of lines) {
      const [name, email] = line.split(/,|;|\t/).map(s=>s.trim());
      if (name) this.addEmployee(businessId, name, email || "");
    }
  }

  static generateQr(businessId: string, employeeId: string) {
    const content = `${businessId}:${employeeId}:${Date.now()}`;
    const svgDataUrl = simpleQrSvg(content);
    const qr = { id: `qr_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, employeeId, svgDataUrl, createdAt: new Date().toISOString() };
    ensure(businessId).qrcodes.push(qr); notify(); return qr;
  }
  static listQrs(businessId: string) { return ensure(businessId).qrcodes; }

  static createPass(businessId: string, employeeId: string, title: string, expiresAt?: string) {
    const pass = { id: `pass_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, employeeId, title, expiresAt, createdAt: new Date().toISOString() };
    ensure(businessId).passes.push(pass); notify(); return pass;
  }
  static listPasses(businessId: string) { return ensure(businessId).passes; }

  static logRedemption(businessId: string, employeeId: string, partner?: string, value?: number) {
    const log = { id: `log_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, employeeId, partner, value, createdAt: new Date().toISOString() };
    ensure(businessId).logs.push(log); notify(); return log;
  }
  static listLogs(businessId: string) { return ensure(businessId).logs.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); }
}

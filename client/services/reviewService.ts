export interface Review {
  id: string;
  businessId: string; // target business being reviewed
  reviewerBusinessId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

const REVIEWS_KEY = "tradelink_reviews";
let subs: Array<() => void> = [];

function load(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (raw) return JSON.parse(raw) as Review[];
  } catch {}
  return [];
}
let store: Review[] = load();
function save() {
  try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(store)); } catch {}
}
function notify() {
  save();
  subs.forEach((cb) => { try { cb(); } catch {} });
}

export class ReviewService {
  static subscribe(cb: () => void): () => void {
    subs.push(cb);
    return () => { subs = subs.filter((x) => x !== cb); };
  }

  static listForBusiness(businessId: string): Review[] {
    return store.filter((r) => r.businessId === businessId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getAggregate(businessId: string): { average: number; count: number } {
    const list = this.listForBusiness(businessId);
    if (list.length === 0) return { average: 0, count: 0 };
    const sum = list.reduce((acc, r) => acc + (isFinite(r.rating) ? r.rating : 0), 0);
    const avg = sum / list.length;
    return { average: Math.round(avg * 10) / 10, count: list.length };
  }

  // One review per reviewer; calling again updates existing
  static submitReview(businessId: string, reviewerBusinessId: string, reviewerName: string, rating: number, comment: string): Review {
    const now = new Date().toISOString();
    rating = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
    const existingIdx = store.findIndex((r) => r.businessId === businessId && r.reviewerBusinessId === reviewerBusinessId);
    if (existingIdx >= 0) {
      const updated: Review = { ...store[existingIdx], rating, comment, createdAt: now, reviewerName };
      store[existingIdx] = updated;
      notify();
      return updated;
    }
    const review: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      businessId,
      reviewerBusinessId,
      reviewerName,
      rating,
      comment,
      createdAt: now,
    };
    store.unshift(review);
    notify();
    return review;
  }

  static deleteReview(reviewId: string, requesterBusinessId: string) {
    const idx = store.findIndex((r) => r.id === reviewId && r.reviewerBusinessId === requesterBusinessId);
    if (idx >= 0) {
      store.splice(idx, 1);
      notify();
    }
  }
}

import { supabase } from "@/lib/supabaseClient";

export interface BusinessProfile {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  email: string;
  phone: string;
  website?: string;

  // Location details
  address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };

  // Business details
  companySize: string;
  foundedYear: number;
  employees: string;
  revenue?: string;

  // Partnership details
  verified: boolean;
  rating: number;
  reviewCount: number;
  responseTime: string;

  // Profile metadata
  isDemo: boolean;
  registrationDate: string;
  lastActive: string;

  // Partnership preferences
  partnershipTypes: string[];
  seekingTypes: string[];
  tags: string[];

  // AI-generated content
  aiOverview?: string;
  matchCriteria: string[];

  // Media
  images?: string[];
  socialMedia?: Record<string, string>;
}

export interface OpenRequest {
  id: string;
  businessId: string;
  business: string;
  logo: string;
  title: string;
  description: string;
  value: string;
  posted: string;
  expires: string;
  responses: number;
  industry: string;
  type: "open" | "targeted";
  requirements?: string[];
  preferredPartners?: string[];
  isDemo: boolean;
}

export interface FilterOptions {
  search?: string;
  country?: string;
  city?: string;
  state?: string;
  postcode?: string;
  industry?: string[];
  companySize?: string[];
  verified?: boolean;
  rating?: number;
  distance?: number;
  partnershipTypes?: string[];
  excludeDemo?: boolean;
  sortBy?: "relevance" | "distance" | "rating" | "newest" | "company_size";
}

// Mock data with comprehensive business profiles
const mockBusinesses: BusinessProfile[] = [
  {
    id: "bus_001",
    name: "Metro Coffee Roasters",
    logo: "MC",
    industry: "Food & Beverage",
    description:
      "Premium specialty coffee roastery with three locations across the city. We source directly from farmers and focus on sustainable practices. Looking for B2B partnerships for office coffee programs and employee benefits.",
    email: "partnerships@metrocoffee.co.nz",
    phone: "+64 9 123 4567",
    website: "https://metrocoffee.co.nz",
    address: {
      street: "123 Queen Street",
      city: "Auckland",
      state: "Auckland",
      postcode: "1010",
      country: "New Zealand",
      coordinates: { lat: -36.8485, lng: 174.7633 },
    },
    companySize: "small",
    foundedYear: 2018,
    employees: "15-25",
    revenue: "$500K - $1M",
    verified: true,
    rating: 4.8,
    reviewCount: 142,
    responseTime: "< 2 hours",
    isDemo: false,
    registrationDate: "2024-01-15",
    lastActive: "2024-12-08",
    partnershipTypes: [
      "Employee Benefits",
      "Cross-Promotion",
      "Service Exchange",
    ],
    seekingTypes: [
      "Office Catering",
      "Marketing Partnerships",
      "Employee Perks",
    ],
    tags: ["Coffee", "Sustainable", "Local", "Artisan"],
    aiOverview:
      "Metro Coffee Roasters is an excellent partnership opportunity for businesses looking to enhance employee satisfaction with premium coffee benefits. Their strong local presence and commitment to sustainability aligns well with modern corporate values.",
    matchCriteria: [
      "Employee Wellness",
      "Local Business",
      "Sustainability",
      "Food & Beverage",
    ],
    images: ["coffee-shop-1.jpg", "coffee-beans.jpg"],
    socialMedia: {
      instagram: "@metrocoffee",
      facebook: "MetroCoffeeRoasters",
      linkedin: "metro-coffee-roasters",
    },
  },
  {
    id: "bus_002",
    name: "TechHub Coworking",
    logo: "TH",
    industry: "Coworking & Office Space",
    description:
      "Modern coworking space in the heart of Wellington's tech district. We provide flexible workspace solutions, meeting rooms, and networking opportunities for startups and growing businesses.",
    email: "hello@techhub.co.nz",
    phone: "+64 4 987 6543",
    website: "https://techhub.co.nz",
    address: {
      street: "456 Lambton Quay",
      city: "Wellington",
      state: "Wellington",
      postcode: "6011",
      country: "New Zealand",
      coordinates: { lat: -41.2865, lng: 174.7762 },
    },
    companySize: "medium",
    foundedYear: 2020,
    employees: "35-50",
    revenue: "$1M - $5M",
    verified: true,
    rating: 4.9,
    reviewCount: 89,
    responseTime: "< 1 hour",
    isDemo: false,
    registrationDate: "2024-02-20",
    lastActive: "2024-12-08",
    partnershipTypes: [
      "Space Sharing",
      "Event Partnerships",
      "Service Exchange",
    ],
    seekingTypes: ["Professional Services", "Catering", "Tech Services"],
    tags: ["Coworking", "Tech", "Networking", "Modern"],
    aiOverview:
      "TechHub offers valuable partnership opportunities through their extensive network of tech professionals and flexible event spaces. Ideal for businesses wanting to connect with the startup ecosystem.",
    matchCriteria: [
      "Technology",
      "Professional Services",
      "Event Space",
      "Networking",
    ],
    images: ["coworking-1.jpg", "meeting-room.jpg"],
    socialMedia: {
      linkedin: "techhub-wellington",
      twitter: "@techhubwgtn",
    },
  },
  {
    id: "bus_003",
    name: "Green Valley Fitness",
    logo: "GV",
    industry: "Health & Fitness",
    description:
      "Full-service fitness center offering personal training, group classes, and corporate wellness programs. We specialize in creating healthy workplace cultures through fitness partnerships.",
    email: "corporate@greenvalleyfitness.co.nz",
    phone: "+64 3 555 7890",
    website: "https://greenvalleyfitness.co.nz",
    address: {
      street: "789 Colombo Street",
      city: "Christchurch",
      state: "Canterbury",
      postcode: "8013",
      country: "New Zealand",
      coordinates: { lat: -43.5321, lng: 172.6362 },
    },
    companySize: "medium",
    foundedYear: 2015,
    employees: "25-40",
    revenue: "$800K - $2M",
    verified: true,
    rating: 4.7,
    reviewCount: 203,
    responseTime: "< 3 hours",
    isDemo: false,
    registrationDate: "2024-01-08",
    lastActive: "2024-12-07",
    partnershipTypes: [
      "Corporate Wellness",
      "Employee Benefits",
      "Health Programs",
    ],
    seekingTypes: [
      "Healthcare Partnerships",
      "Nutrition Services",
      "Corporate Clients",
    ],
    tags: ["Fitness", "Wellness", "Corporate", "Health"],
    aiOverview:
      "Green Valley Fitness excels in corporate wellness partnerships, helping businesses improve employee health and productivity. Their established programs and proven results make them an ideal wellness partner.",
    matchCriteria: [
      "Employee Wellness",
      "Corporate Benefits",
      "Health & Fitness",
      "Team Building",
    ],
    images: ["gym-1.jpg", "fitness-class.jpg"],
    socialMedia: {
      facebook: "GreenValleyFitness",
      instagram: "@greenvalleyfitness",
    },
  },
  // Demo businesses (should be filtered out when excludeDemo is true)
  {
    id: "demo_001",
    name: "Demo Bakery",
    logo: "DB",
    industry: "Food & Beverage",
    description: "This is a demo business for testing purposes.",
    email: "demo@example.com",
    phone: "+64 9 000 0000",
    address: {
      street: "123 Demo Street",
      city: "Auckland",
      state: "Auckland",
      postcode: "1010",
      country: "New Zealand",
      coordinates: { lat: -36.8485, lng: 174.7633 },
    },
    companySize: "small",
    foundedYear: 2024,
    employees: "1-5",
    verified: false,
    rating: 4.0,
    reviewCount: 0,
    responseTime: "N/A",
    isDemo: true,
    registrationDate: "2024-12-01",
    lastActive: "2024-12-01",
    partnershipTypes: ["Demo"],
    seekingTypes: ["Demo"],
    tags: ["Demo", "Test"],
    matchCriteria: ["Demo"],
  },
];

// Open requests store (no demo seed)
const OPEN_REQ_STORAGE_KEY = "tradelink_open_requests";
let openRequestSubscribers: Array<() => void> = [];

const loadOpenRequestStore = (): OpenRequest[] => {
  try {
    const raw = localStorage.getItem(OPEN_REQ_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OpenRequest[];
  } catch {}
  return [];
};

let openRequestStore: OpenRequest[] = loadOpenRequestStore();

const saveOpenRequestStore = () => {
  try {
    localStorage.setItem(
      OPEN_REQ_STORAGE_KEY,
      JSON.stringify(openRequestStore),
    );
  } catch {}
};

const notifyOpenRequests = () => {
  saveOpenRequestStore();
  openRequestSubscribers.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
};

const BUSINESS_REFRESH_INTERVAL_MS = 0;
let businessSubscribers: Array<() => void> = [];
let businessStore: BusinessProfile[] = [];
let lastBusinessFetch = 0;
let businessRefreshPromise: Promise<void> | null = null;

const notifyBusiness = () => {
  businessSubscribers.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
};

export class BusinessService {
  static async refreshFromApi(force = false): Promise<void> {
    const now = Date.now();
    if (
      !force &&
      businessStore.length > 0 &&
      now - lastBusinessFetch < BUSINESS_REFRESH_INTERVAL_MS
    ) {
      if (businessRefreshPromise) {
        await businessRefreshPromise.catch(() => {});
      }
      return;
    }

    if (businessRefreshPromise) {
      await businessRefreshPromise.catch(() => {});
      return;
    }

    businessRefreshPromise = (async () => {
      try {
        const resp = await fetch("/api/discovery/businesses");
        if (!resp.ok) return;
        const j = await resp.json();
        if (j && j.ok && Array.isArray(j.data)) {
          businessStore = j.data as BusinessProfile[];
          lastBusinessFetch = Date.now();
          notifyBusiness();
        }
      } catch (err) {
        console.warn("Failed to refresh businesses from API", err);
      } finally {
        businessRefreshPromise = null;
      }
    })();

    await businessRefreshPromise.catch(() => {});
  }

  static async ensureLoaded(options: { force?: boolean } = {}): Promise<void> {
    await this.refreshFromApi(options.force ?? false);
  }

  static getBusinesses(filters: FilterOptions = {}): BusinessProfile[] {
    let results = [...businessStore];

    // Permanently exclude known demo business by name
    results = results.filter(
      (b) => b.name.toLowerCase() !== "coffee & more".toLowerCase(),
    );

    // Filter out demo accounts if requested
    if (filters.excludeDemo) {
      results = results.filter((business) => !business.isDemo);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (business) =>
          business.name.toLowerCase().includes(searchLower) ||
          business.industry.toLowerCase().includes(searchLower) ||
          business.description.toLowerCase().includes(searchLower) ||
          business.tags.some((tag) =>
            tag.toLowerCase().includes(searchLower),
          ) ||
          business.address.city.toLowerCase().includes(searchLower),
      );
    }

    // Apply location filters
    if (filters.country) {
      results = results.filter(
        (business) =>
          business.address.country.toLowerCase() ===
          filters.country?.toLowerCase(),
      );
    }

    if (filters.city) {
      results = results.filter((business) =>
        business.address.city
          .toLowerCase()
          .includes(filters.city?.toLowerCase() || ""),
      );
    }

    if (filters.state) {
      results = results.filter((business) =>
        business.address.state
          .toLowerCase()
          .includes(filters.state?.toLowerCase() || ""),
      );
    }

    if (filters.postcode) {
      results = results.filter((business) =>
        business.address.postcode.includes(filters.postcode || ""),
      );
    }

    // Apply industry filter
    if (filters.industry && filters.industry.length > 0) {
      results = results.filter((business) =>
        filters.industry?.includes(business.industry),
      );
    }

    // Apply company size filter
    if (filters.companySize && filters.companySize.length > 0) {
      results = results.filter((business) =>
        filters.companySize?.includes(business.companySize),
      );
    }

    // Apply verified filter
    if (filters.verified !== undefined) {
      results = results.filter(
        (business) => business.verified === filters.verified,
      );
    }

    // Apply rating filter
    if (filters.rating) {
      results = results.filter(
        (business) => business.rating >= filters.rating!,
      );
    }

    // Apply partnership type filter
    if (filters.partnershipTypes && filters.partnershipTypes.length > 0) {
      results = results.filter((business) =>
        business.partnershipTypes.some((type) =>
          filters.partnershipTypes?.includes(type),
        ),
      );
    }

    // Sort results
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case "rating":
            return b.rating - a.rating;
          case "newest":
            return (
              new Date(b.registrationDate).getTime() -
              new Date(a.registrationDate).getTime()
            );
          case "company_size":
            const sizeOrder = { small: 1, medium: 2, large: 3 };
            return (
              (sizeOrder[b.companySize as keyof typeof sizeOrder] || 0) -
              (sizeOrder[a.companySize as keyof typeof sizeOrder] || 0)
            );
          default:
            return 0;
        }
      });
    }

    return results;
  }

  static getBusinessById(id: string): BusinessProfile | null {
    return businessStore.find((business) => business.id === id) || null;
  }

  static getOpenRequests(filters: FilterOptions = {}): OpenRequest[] {
    let results = [...openRequestStore];

    if (filters.excludeDemo) {
      results = results.filter((r) => !r.isDemo);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) ||
          r.business.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.industry.toLowerCase().includes(searchLower),
      );
    }

    return results;
  }

  static getOpenRequestById(id: string): OpenRequest | null {
    return openRequestStore.find((r) => r.id === id) || null;
  }

  static upsertOpenRequest(r: OpenRequest) {
    const idx = openRequestStore.findIndex((x) => x.id === r.id);
    if (idx >= 0) openRequestStore[idx] = r;
    else openRequestStore.push(r);
    notifyOpenRequests();
  }

  static deleteOpenRequest(id: string) {
    openRequestStore = openRequestStore.filter((r) => r.id !== id);
    notifyOpenRequests();
  }

  static subscribeOpenRequests(callback: () => void): () => void {
    openRequestSubscribers.push(callback);
    return () => {
      openRequestSubscribers = openRequestSubscribers.filter(
        (cb) => cb !== callback,
      );
    };
  }

  static getIndustries(): string[] {
    const businesses = this.getBusinesses({ excludeDemo: true });
    return [...new Set(businesses.map((b) => b.industry))].sort();
  }

  static getCities(): string[] {
    const businesses = this.getBusinesses({ excludeDemo: true });
    return [...new Set(businesses.map((b) => b.address.city))].sort();
  }

  static getStates(): string[] {
    const businesses = this.getBusinesses({ excludeDemo: true });
    return [...new Set(businesses.map((b) => b.address.state))].sort();
  }

  static getCountries(): string[] {
    const businesses = this.getBusinesses({ excludeDemo: true });
    return [...new Set(businesses.map((b) => b.address.country))].sort();
  }

  static getCompanySizes(): string[] {
    return ["small", "medium", "large"];
  }

  static getPartnershipTypes(): string[] {
    const businesses = this.getBusinesses({ excludeDemo: true });
    const types = businesses.flatMap((b) => b.partnershipTypes || []);
    return [...new Set(types)].sort();
  }

  // Generate AI overview for a business (mock implementation)
  static generateAIOverview(business: BusinessProfile): string {
    if (business.aiOverview) return business.aiOverview;

    return `${business.name} is a ${business.industry.toLowerCase()} business located in ${business.address.city}. With ${business.employees} employees and a ${business.rating}-star rating, they specialize in ${business.tags.join(", ")}. This business is an excellent partner for organizations looking for ${business.seekingTypes.join(", ").toLowerCase()} opportunities.`;
  }

  // Calculate distance between two coordinates (simplified)
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Register or update a business (for future use)
  static upsertBusiness(b: BusinessProfile) {
    const idx = businessStore.findIndex((x) => x.id === b.id);
    if (idx >= 0) businessStore[idx] = b;
    else businessStore.push(b);
    notifyBusiness();
  }

  static subscribe(callback: () => void): () => void {
    businessSubscribers.push(callback);
    return () => {
      businessSubscribers = businessSubscribers.filter((cb) => cb !== callback);
    };
  }

  static deleteBusiness(id: string) {
    businessStore = businessStore.filter((b) => b.id !== id);
    notifyBusiness();
  }
}

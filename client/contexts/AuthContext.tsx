import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BusinessService,
  type BusinessProfile,
} from "@/services/businessService";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  businessLocation: string;
  industry: string;
  companySize: string;
  plan: "free" | "plus" | "pro";
  createdAt: string;
  avatar?: string;
}

export interface Subscription {
  id: string;
  plan: "free" | "plus" | "pro";
  status: "active" | "expired" | "overdue" | "cancelled" | "suspended";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  autoRenew: boolean;
  daysOverdue?: number;
  squareSubscriptionId?: string;
  squareCustomerId?: string;
  paymentMethodLast4?: string;
  lastPaymentDate?: string;
  lastPaymentStatus?: "success" | "failed" | "pending";
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  description: string;
  date: string;
  paymentMethod: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "overdue";
  date: string;
  dueDate: string;
  downloadUrl?: string;
}

export interface UsageMetrics {
  partnershipsUsed: number;
  partnershipsLimit: number;
  monthlyRedemptions: number;
  storageUsed: number; // in MB
  apiCallsUsed: number;
}

export interface DashboardData {
  partnerships: Array<{
    id: string;
    partner: string;
    logo: string;
    deal: string;
    status: string;
    redemptions: number;
    value: string;
    progress: number;
  }>;
  analytics: {
    activePartnerships: number;
    valueExchanged: string;
    recentRedemptions: number;
    activeNegotiations: number;
  };
  recentActivity: Array<{
    id: string;
    type: "redemption" | "proposal" | "negotiation";
    business: string;
    employee: string;
    action: string;
    time: string;
    value: string;
  }>;
  recommendations: Array<{
    id: string;
    name: string;
    logo: string;
    industry: string;
    distance: string;
    match: number;
    employees: string;
    description: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  invoices: Invoice[];
  usageMetrics: UsageMetrics | null;
  dashboardData: DashboardData | null;
  isAuthenticated: boolean;
  isAccountRestricted: boolean;
  accountRestriction: AccountRestriction | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
    businessLocation: string;
    industry: string;
    companySize: string;
    password: string;
    plan: "free" | "plus" | "pro";
    paymentData?: any;
  }) => Promise<{ success: boolean; error?: string }>;
  finalizePendingSignup: () => Promise<{ success: boolean; error?: string }>;
  cancelPendingSignup: () => void;
  logout: () => void;
  updateDashboardData: (data: Partial<DashboardData>) => void;
  addPartnership: (partnership: {
    partner: string;
    deal: string;
    value: string;
  }) => void;
  addRedemption: (partnership: string, employee: string, value: string) => void;
  upgradeSubscription: (
    plan: "plus" | "pro",
    paymentData: any,
  ) => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
  updatePaymentMethod: (
    paymentMethod: PaymentMethod,
  ) => Promise<{ success: boolean; error?: string }>;
  checkSubscriptionLimits: (feature: string) => {
    allowed: boolean;
    message?: string;
    requiresUpgrade?: boolean;
  };
  canAccessFeature: (feature: string) => boolean;
  getCurrentPlanLimits: () => any;
  hasPaymentIssues: () => boolean;
  updateUserProfile: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Plan limits configuration
const PLAN_LIMITS = {
  free: {
    partnerships: 3,
    storage: 100, // MB
    apiCalls: 100,
    monthlyRedemptions: 50,
    features: ["basic_discovery", "email_support"],
    restrictions: [],
  },
  plus: {
    partnerships: 15,
    storage: 1000, // MB
    apiCalls: 1000,
    monthlyRedemptions: 500,
    features: [
      "advanced_discovery",
      "analytics",
      "priority_support",
      "qr_verification",
      "bulk_import",
      "custom_reports",
    ],
    restrictions: [],
  },
  pro: {
    partnerships: -1, // unlimited
    storage: 10000, // MB
    apiCalls: 10000,
    monthlyRedemptions: -1, // unlimited
    features: [
      "all_features",
      "api_access",
      "white_label",
      "dedicated_manager",
      "advanced_analytics",
      "multi_location",
      "custom_integrations",
      "priority_onboarding",
    ],
    restrictions: [],
  },
};

// Helper: map user to BusinessProfile for discovery listing
function toCompanySizeCategory(input: string): "small" | "medium" | "large" {
  const nums = (input.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  const max = nums.length ? Math.max(...nums) : 0;
  if (max <= 25) return "small";
  if (max <= 100) return "medium";
  return "large";
}

function toEmployeesRange(input: string): string {
  const m = input.match(/\d+\s*-\s*\d+/);
  if (m) return m[0].replace(/\s*/g, "");
  const max =
    (input.match(/\d+/g) || []).map(Number).sort((a, b) => b - a)[0] || 0;
  if (max <= 10) return "1-10";
  if (max <= 50) return "11-50";
  if (max <= 200) return "51-200";
  return "200+";
}

function parseLocation(input: string): {
  city: string;
  state: string;
  country: string;
} {
  const parts = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const city = parts[0] || "";
  const country = parts[parts.length - 1] || "";
  const state = parts.length === 3 ? parts[1] : "";
  return { city, state, country };
}

function logoFromName(name: string): string {
  const words = name.trim().split(/\s+/);
  const initials =
    (words[0]?.[0] || "").toUpperCase() + (words[1]?.[0] || "").toUpperCase();
  return initials || name.slice(0, 2).toUpperCase();
}

function buildBusinessFromUser(user: User): BusinessProfile {
  const { city, state, country } = parseLocation(user.businessLocation || "");
  const now = new Date().toISOString();
  return {
    id: `biz_${user.id}`,
    name: user.businessName,
    logo: logoFromName(user.businessName),
    industry: user.industry || "General",
    description: `${user.businessName} is interested in building partnerships through Tradelink.`,
    email: user.email,
    phone: "",
    website: undefined,
    address: {
      street: "",
      city: city || "",
      state: state || "",
      postcode: "",
      country: country || "",
      coordinates: { lat: -41.2865, lng: 174.7762 },
    },
    companySize: toCompanySizeCategory(user.companySize || ""),
    foundedYear: new Date(user.createdAt).getFullYear(),
    employees: toEmployeesRange(user.companySize || ""),
    revenue: undefined,
    verified: false,
    rating: 4.5,
    reviewCount: 0,
    responseTime: "< 24 hours",
    isDemo: false,
    registrationDate: now,
    lastActive: now,
    partnershipTypes: ["Employee Benefits", "Cross-Promotion"],
    seekingTypes: ["Partnerships", "Local Businesses"],
    tags: [user.industry, city, country].filter(Boolean) as string[],
    aiOverview: undefined,
    matchCriteria: [user.industry || ""].filter(Boolean) as string[],
    images: [],
    socialMedia: {},
  };
}

// Features that require specific plans
const FEATURE_REQUIREMENTS = {
  advanced_analytics: ["plus", "pro"],
  api_access: ["pro"],
  white_label: ["pro"],
  bulk_import: ["plus", "pro"],
  custom_reports: ["plus", "pro"],
  multi_location: ["pro"],
  custom_integrations: ["pro"],
  qr_verification: ["plus", "pro"],
  priority_support: ["plus", "pro"],
  dedicated_manager: ["pro"],
};

// Account restriction reasons
type RestrictionReason =
  | "overdue_payment"
  | "subscription_expired"
  | "account_suspended"
  | "payment_failed";

interface AccountRestriction {
  reason: RestrictionReason;
  message: string;
  severity: "warning" | "error" | "critical";
  actionRequired: string;
  canAccessBilling: boolean;
}

// Mock users database
const mockUsers: Array<User & { password: string }> = [
  {
    id: "1",
    email: "demo@coffeeshop.com",
    password: "password123",
    firstName: "John",
    lastName: "Smith",
    businessName: "Coffee & More",
    businessLocation: "Auckland, New Zealand",
    industry: "Food & Beverage",
    companySize: "11-50 employees",
    plan: "plus",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    email: "sarah@urbancuts.com",
    password: "password123",
    firstName: "Sarah",
    lastName: "Johnson",
    businessName: "Urban Cuts Barbershop",
    businessLocation: "Wellington, New Zealand",
    industry: "Beauty & Personal Care",
    companySize: "1-10 employees",
    plan: "free",
    createdAt: "2024-02-01T14:30:00Z",
  },
];

// Mock subscription data
const getMockSubscription = (user: User, paymentData?: any): Subscription => {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (user.plan === "free") {
    return {
      id: "sub_free",
      plan: "free",
      status: "active",
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
      amount: 0,
      currency: "NZD",
      autoRenew: false,
    };
  }

  return {
    id: `sub_${user.id}`,
    plan: user.plan,
    status: "active",
    currentPeriodStart: periodStart.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    nextBillingDate: nextBilling.toISOString(),
    amount: user.plan === "plus" ? 29 : 99,
    currency: "NZD",
    autoRenew: true,
    squareSubscriptionId: paymentData?.subscriptionId,
    squareCustomerId: paymentData?.customerId,
    paymentMethodLast4: "1111", // Mock last 4 digits
    lastPaymentDate: paymentData ? new Date().toISOString() : undefined,
    lastPaymentStatus:
      paymentData?.status === "success" ? "success" : undefined,
  };
};

// Mock usage metrics
const getMockUsageMetrics = (
  user: User,
  isNewUser: boolean = false,
): UsageMetrics => {
  const limits = PLAN_LIMITS[user.plan];

  // New users start with zero usage
  if (isNewUser) {
    return {
      partnershipsUsed: 0,
      partnershipsLimit: limits.partnerships,
      monthlyRedemptions: 0,
      storageUsed: 0,
      apiCallsUsed: 0,
    };
  }

  // Existing demo users get sample data
  return {
    partnershipsUsed: user.plan === "free" ? 2 : user.plan === "plus" ? 8 : 25,
    partnershipsLimit: limits.partnerships,
    monthlyRedemptions:
      user.plan === "free" ? 5 : user.plan === "plus" ? 47 : 156,
    storageUsed: user.plan === "free" ? 45 : user.plan === "plus" ? 250 : 1200,
    apiCallsUsed: user.plan === "free" ? 23 : user.plan === "plus" ? 234 : 1567,
  };
};

// Mock payment methods
const getMockPaymentMethods = (): PaymentMethod[] => [
  {
    id: "pm_1",
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
];

// Mock transactions
const getMockTransactions = (): Transaction[] => [
  {
    id: "txn_1",
    amount: 29.0,
    currency: "NZD",
    status: "success",
    description: "Plus Plan - Monthly Subscription",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "txn_2",
    amount: 29.0,
    currency: "NZD",
    status: "success",
    description: "Plus Plan - Monthly Subscription",
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "Visa •••• 4242",
  },
];

// Mock invoices
const getMockInvoices = (): Invoice[] => [
  {
    id: "inv_1",
    number: "INV-2024-001",
    amount: 29.0,
    currency: "NZD",
    status: "paid",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Default dashboard data
const getDefaultDashboardData = (
  user: User,
  isNewUser: boolean = false,
): DashboardData => {
  // New users start with zero values
  if (isNewUser) {
    return {
      partnerships: [],
      analytics: {
        activePartnerships: 0,
        valueExchanged: "$0",
        recentRedemptions: 0,
        activeNegotiations: 0,
      },
      recentActivity: [],
      recommendations: [],
    };
  }

  // Existing users: start without placeholders
  return {
    partnerships: [],
    analytics: {
      activePartnerships: 0,
      valueExchanged: "$0",
      recentRedemptions: 0,
      activeNegotiations: 0,
    },
    recentActivity: [],
    recommendations: [],
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check account restrictions
  const getAccountRestriction = (): AccountRestriction | null => {
    if (!subscription) return null;

    // Critical: Account suspended
    if (subscription.status === "suspended") {
      return {
        reason: "account_suspended",
        message: "Your account has been suspended due to payment issues.",
        severity: "critical",
        actionRequired:
          "Please update your payment method and contact support.",
        canAccessBilling: true,
      };
    }

    // Critical: Overdue payment (3+ days)
    if (
      subscription.status === "overdue" &&
      subscription.daysOverdue &&
      subscription.daysOverdue >= 3
    ) {
      return {
        reason: "overdue_payment",
        message: `Your payment is ${subscription.daysOverdue} days overdue. Account access is restricted.`,
        severity: "critical",
        actionRequired:
          "Please update your payment method immediately to restore access.",
        canAccessBilling: true,
      };
    }

    // Warning: Payment overdue (1-2 days)
    if (
      subscription.status === "overdue" &&
      subscription.daysOverdue &&
      subscription.daysOverdue < 3
    ) {
      return {
        reason: "overdue_payment",
        message: `Your payment is ${subscription.daysOverdue} day(s) overdue.`,
        severity: "warning",
        actionRequired:
          "Please update your payment method to avoid account restrictions.",
        canAccessBilling: true,
      };
    }

    // Error: Subscription expired
    if (subscription.status === "expired") {
      return {
        reason: "subscription_expired",
        message: "Your subscription has expired.",
        severity: "error",
        actionRequired:
          "Please renew your subscription to continue using premium features.",
        canAccessBilling: true,
      };
    }

    // Error: Last payment failed
    if (subscription.lastPaymentStatus === "failed") {
      return {
        reason: "payment_failed",
        message: "Your last payment failed.",
        severity: "error",
        actionRequired: "Please update your payment method or retry payment.",
        canAccessBilling: true,
      };
    }

    return null;
  };

  const accountRestriction = getAccountRestriction();
  const isAccountRestricted = accountRestriction?.severity === "critical";

  // Load user data from localStorage on app start and sync plan with server (Supabase)
  useEffect(() => {
    const storedUser = localStorage.getItem("tradelink_user");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (!userData.businessLocation) userData.businessLocation = "";
        if (!userData.industry) userData.industry = "";
        if (!userData.companySize) userData.companySize = "";

        setUser(userData);
        setIsAuthenticated(true);

        // Ensure business appears in discovery
        try {
          BusinessService.upsertBusiness(buildBusinessFromUser(userData));
        } catch {}

        // Initial subscription and related data using stored plan
        const applyUserPlan = (u: User) => {
          const sub = getMockSubscription(u);
          setSubscription(sub);
          setUsageMetrics(getMockUsageMetrics(u));
          if (u.plan !== "free") {
            setPaymentMethods(getMockPaymentMethods());
            setTransactions(getMockTransactions());
            setInvoices(getMockInvoices());
          }
        };
        applyUserPlan(userData as User);

        // Load dashboard data
        const storedDashboard = localStorage.getItem("tradelink_dashboard");
        if (storedDashboard) {
          setDashboardData(JSON.parse(storedDashboard));
        } else {
          const defaultData = getDefaultDashboardData(userData);
          setDashboardData(defaultData);
          localStorage.setItem(
            "tradelink_dashboard",
            JSON.stringify(defaultData),
          );
        }

        // Sync latest plan from server DB (Supabase)
        (async () => {
          try {
            const resp = await fetch(`/api/users/${userData.id}`);
            if (resp.ok) {
              const j = await resp.json();
              const serverPlan = j?.data?.plan as User["plan"] | undefined;
              if (serverPlan && serverPlan !== userData.plan) {
                const updated: User = { ...userData, plan: serverPlan };
                setUser(updated);
                localStorage.setItem("tradelink_user", JSON.stringify(updated));
                applyUserPlan(updated);
              }
            }
          } catch {}
        })();
      } catch (error) {
        console.error("Error loading user data:", error);
        localStorage.removeItem("tradelink_user");
        localStorage.removeItem("tradelink_dashboard");
      }
    }
  }, []);

  // Check subscription status daily
  useEffect(() => {
    if (subscription && subscription.plan !== "free") {
      const now = new Date();
      const periodEnd = new Date(subscription.currentPeriodEnd);

      if (now > periodEnd) {
        const daysOverdue = Math.floor(
          (now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24),
        );
        const newStatus = daysOverdue >= 3 ? "overdue" : "expired";

        setSubscription((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                daysOverdue,
              }
            : null,
        );
      }
    }
  }, [subscription]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check password overrides set by reset-password flow
    const rawOverrides = localStorage.getItem("tradelink_passwords");
    const overrides: Record<string, string> = rawOverrides
      ? JSON.parse(rawOverrides)
      : {};

    const record = mockUsers.find((u) => u.email === email);
    const valid = record
      ? overrides[email]
        ? overrides[email] === password
        : record.password === password
      : false;

    if (!record || !valid) {
      return { success: false, error: "Invalid email or password" };
    }

    const { password: _, ...userData } = record;

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("tradelink_user", JSON.stringify(userData));

    // Ensure business appears in discovery
    try {
      BusinessService.upsertBusiness(buildBusinessFromUser(userData));
    } catch {}

    // Load subscription and related data
    const sub = getMockSubscription(userData);
    setSubscription(sub);
    setUsageMetrics(getMockUsageMetrics(userData));
    setPaymentMethods(getMockPaymentMethods());
    setTransactions(getMockTransactions());
    setInvoices(getMockInvoices());

    // Load dashboard data
    const userDashboard = getDefaultDashboardData(userData);
    setDashboardData(userDashboard);
    localStorage.setItem("tradelink_dashboard", JSON.stringify(userDashboard));

    return { success: true };
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
    businessLocation: string;
    industry: string;
    companySize: string;
    password: string;
    plan: "free" | "plus" | "pro";
    paymentData?: any;
  }): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const existingUser = mockUsers.find((u) => u.email === userData.email);
    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    if (userData.plan !== "free") {
      if (!userData.paymentData || userData.paymentData.status !== "success") {
        return { success: false, error: "Payment is required for paid plans" };
      }
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      businessName: userData.businessName,
      businessLocation: userData.businessLocation,
      industry: userData.industry,
      companySize: userData.companySize,
      plan: userData.plan,
      createdAt: new Date().toISOString(),
    };

    // Persist pending signup (await verification)
    localStorage.setItem(
      "tradelink_pending_signup",
      JSON.stringify({
        user: newUser,
        password: userData.password,
        paymentData: userData.paymentData || null,
      }),
    );

    // Sync to server/Neon (non-blocking)
    try {
      await fetch("/api/users/sync-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUser }),
      });
    } catch {}

    return { success: true };
  };

  const finalizePendingSignup = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const raw = localStorage.getItem("tradelink_pending_signup");
      if (!raw) return { success: false, error: "No pending signup" };
      const { user: pendingUser, password, paymentData } = JSON.parse(raw);

      // Commit user to mock DB
      const exists = mockUsers.find((u) => u.email === pendingUser.email);
      if (!exists) {
        mockUsers.push({ ...pendingUser, password });
      }

      // Set auth session
      setUser(pendingUser);
      setIsAuthenticated(true);
      localStorage.setItem("tradelink_user", JSON.stringify(pendingUser));

      try {
        BusinessService.upsertBusiness(buildBusinessFromUser(pendingUser));
      } catch {}

      const sub = getMockSubscription(pendingUser, paymentData);
      setSubscription(sub);
      setUsageMetrics(getMockUsageMetrics(pendingUser, true));
      if (pendingUser.plan !== "free") {
        setPaymentMethods(getMockPaymentMethods());
        setTransactions(getMockTransactions());
        setInvoices(getMockInvoices());
      }

      const userDashboard = getDefaultDashboardData(pendingUser, true);
      setDashboardData(userDashboard);
      localStorage.setItem(
        "tradelink_dashboard",
        JSON.stringify(userDashboard),
      );

      // Onboarding flag
      try {
        localStorage.setItem(
          `tradelink_onboarding_pending_${pendingUser.id}`,
          "1",
        );
      } catch {}

      localStorage.removeItem("tradelink_pending_signup");
      return { success: true };
    } catch (e) {
      return { success: false, error: "Failed to finalize signup" };
    }
  };

  const cancelPendingSignup = () => {
    localStorage.removeItem("tradelink_pending_signup");
  };

  const logout = () => {
    setUser(null);
    setSubscription(null);
    setPaymentMethods([]);
    setTransactions([]);
    setInvoices([]);
    setUsageMetrics(null);
    setDashboardData(null);
    setIsAuthenticated(false);
    localStorage.removeItem("tradelink_user");
    localStorage.removeItem("tradelink_dashboard");
  };

  const updateDashboardData = (data: Partial<DashboardData>) => {
    if (!user || !dashboardData) return;

    const updatedData = { ...dashboardData, ...data };
    setDashboardData(updatedData);
    localStorage.setItem("tradelink_dashboard", JSON.stringify(updatedData));
  };

  const addPartnership = (partnership: {
    partner: string;
    deal: string;
    value: string;
  }) => {
    if (!user || !dashboardData || !usageMetrics) return;

    // Check subscription limits
    const limits = checkSubscriptionLimits("partnerships");
    if (!limits.allowed) {
      alert(limits.message);
      return;
    }

    const newPartnership = {
      id: Date.now().toString(),
      partner: partnership.partner,
      logo: partnership.partner.substring(0, 2).toUpperCase(),
      deal: partnership.deal,
      status: "Active",
      redemptions: 0,
      value: partnership.value,
      progress: 0,
    };

    const updatedDashboard = {
      ...dashboardData,
      partnerships: [...dashboardData.partnerships, newPartnership],
      analytics: {
        ...dashboardData.analytics,
        activePartnerships: dashboardData.analytics.activePartnerships + 1,
      },
    };

    setDashboardData(updatedDashboard);
    localStorage.setItem(
      "tradelink_dashboard",
      JSON.stringify(updatedDashboard),
    );

    // Update usage metrics
    const updatedUsage = {
      ...usageMetrics,
      partnershipsUsed: usageMetrics.partnershipsUsed + 1,
    };
    setUsageMetrics(updatedUsage);

    // Add recent activity
    const newActivity = {
      id: Date.now().toString(),
      type: "proposal" as const,
      business: partnership.partner,
      employee: "System",
      action: `created new partnership: ${partnership.deal}`,
      time: "Just now",
      value: partnership.value,
    };

    const updatedDashboardWithActivity = {
      ...updatedDashboard,
      recentActivity: [newActivity, ...updatedDashboard.recentActivity].slice(
        0,
        10,
      ),
    };

    setDashboardData(updatedDashboardWithActivity);
    localStorage.setItem(
      "tradelink_dashboard",
      JSON.stringify(updatedDashboardWithActivity),
    );

    // Record analytics event
    try {
      const businessId = `biz_${user.id}`;
      import("@/services/analyticsService").then(({ AnalyticsService }) => {
        try {
          AnalyticsService.record({
            businessId,
            type: "partnership",
            meta: {
              partner: partnership.partner,
              deal: partnership.deal,
              value: partnership.value,
            },
          });
        } catch {}
      });
    } catch {}
  };

  const addRedemption = (
    partnership: string,
    employee: string,
    value: string,
  ) => {
    if (!user || !dashboardData || !usageMetrics) return;

    // Find and update the partnership
    const updatedPartnerships = dashboardData.partnerships.map((p) => {
      if (p.partner === partnership) {
        return {
          ...p,
          redemptions: p.redemptions + 1,
          progress: Math.min(p.progress + 10, 100), // Increase progress
        };
      }
      return p;
    });

    // Parse and update total value exchanged
    const currentValue = parseFloat(
      dashboardData.analytics.valueExchanged.replace(/[\$,]/g, ""),
    );
    const redeemValue = parseFloat(value.replace(/[\$,]/g, ""));
    const newTotalValue = currentValue + redeemValue;

    const updatedDashboard = {
      ...dashboardData,
      partnerships: updatedPartnerships,
      analytics: {
        ...dashboardData.analytics,
        valueExchanged: `$${newTotalValue.toLocaleString()}`,
        recentRedemptions: dashboardData.analytics.recentRedemptions + 1,
      },
    };

    // Add recent activity
    const newActivity = {
      id: Date.now().toString(),
      type: "redemption" as const,
      business: partnership,
      employee: employee,
      action: "redeemed partnership benefit",
      time: "Just now",
      value: value,
    };

    const updatedDashboardWithActivity = {
      ...updatedDashboard,
      recentActivity: [newActivity, ...updatedDashboard.recentActivity].slice(
        0,
        10,
      ),
    };

    setDashboardData(updatedDashboardWithActivity);
    localStorage.setItem(
      "tradelink_dashboard",
      JSON.stringify(updatedDashboardWithActivity),
    );

    // Update usage metrics
    const updatedUsage = {
      ...usageMetrics,
      monthlyRedemptions: usageMetrics.monthlyRedemptions + 1,
    };
    setUsageMetrics(updatedUsage);

    // Record analytics event for charts
    try {
      const businessId = `biz_${user.id}`;
      const amount = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
      import("@/services/analyticsService").then(({ AnalyticsService }) => {
        try {
          AnalyticsService.record({
            businessId,
            type: "redemption",
            value: amount,
            meta: { partnership, employee },
          });
        } catch {}
      });
    } catch {}
  };

  const upgradeSubscription = async (
    plan: "plus" | "pro",
    paymentData: any,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "User not authenticated" };

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update user plan
    const updatedUser = { ...user, plan };
    setUser(updatedUser);
    localStorage.setItem("tradelink_user", JSON.stringify(updatedUser));

    // Update subscription
    const newSubscription = getMockSubscription(updatedUser);
    setSubscription(newSubscription);

    // Update usage metrics
    setUsageMetrics(getMockUsageMetrics(updatedUser));

    return { success: true };
  };

  const cancelSubscription = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!subscription)
      return { success: false, error: "No active subscription" };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubscription((prev) => (prev ? { ...prev, autoRenew: false } : null));

    return { success: true };
  };

  const updatePaymentMethod = async (
    paymentMethod: PaymentMethod,
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPaymentMethods((prev) => {
      const updated = prev.map((pm) => ({ ...pm, isDefault: false }));
      return [...updated, { ...paymentMethod, isDefault: true }];
    });

    return { success: true };
  };

  const checkSubscriptionLimits = (
    feature: string,
  ): { allowed: boolean; message?: string; requiresUpgrade?: boolean } => {
    if (!user || !usageMetrics)
      return { allowed: false, message: "User not authenticated" };

    // Check account restrictions first
    if (isAccountRestricted && feature !== "billing") {
      return {
        allowed: false,
        message: accountRestriction?.message || "Account access is restricted",
        requiresUpgrade: false,
      };
    }

    const limits = PLAN_LIMITS[user.plan];

    switch (feature) {
      case "partnerships":
        if (limits.partnerships === -1) return { allowed: true };
        if (usageMetrics.partnershipsUsed >= limits.partnerships) {
          return {
            allowed: false,
            message: `You've reached your limit of ${limits.partnerships} partnerships. Upgrade to Plus or Pro to get more.`,
            requiresUpgrade: true,
          };
        }
        return { allowed: true };

      case "monthly_redemptions":
        if (limits.monthlyRedemptions === -1) return { allowed: true };
        if (usageMetrics.monthlyRedemptions >= limits.monthlyRedemptions) {
          return {
            allowed: false,
            message: `You've reached your limit of ${limits.monthlyRedemptions} monthly redemptions. Upgrade to get more.`,
            requiresUpgrade: true,
          };
        }
        return { allowed: true };

      case "storage":
        if (usageMetrics.storageUsed >= limits.storage) {
          return {
            allowed: false,
            message: `You've reached your storage limit of ${limits.storage}MB. Upgrade to get more.`,
            requiresUpgrade: true,
          };
        }
        return { allowed: true };

      case "api_calls":
        if (usageMetrics.apiCallsUsed >= limits.apiCalls) {
          return {
            allowed: false,
            message: `You've reached your API call limit of ${limits.apiCalls}. Upgrade to get more.`,
            requiresUpgrade: true,
          };
        }
        return { allowed: true };

      // Feature-based restrictions
      default:
        const requiredPlans =
          FEATURE_REQUIREMENTS[feature as keyof typeof FEATURE_REQUIREMENTS];
        if (requiredPlans && !requiredPlans.includes(user.plan)) {
          const planNames = requiredPlans
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" or ");
          return {
            allowed: false,
            message: `This feature is available on ${planNames} plans only.`,
            requiresUpgrade: true,
          };
        }
        return { allowed: true };
    }
  };

  // Check if user can access a specific feature
  const canAccessFeature = (feature: string): boolean => {
    const limits = checkSubscriptionLimits(feature);
    return limits.allowed;
  };

  // Get user's current plan limits
  const getCurrentPlanLimits = () => {
    if (!user) return null;
    return PLAN_LIMITS[user.plan];
  };

  // Check if account has payment issues
  const hasPaymentIssues = (): boolean => {
    return (
      accountRestriction?.reason === "overdue_payment" ||
      accountRestriction?.reason === "payment_failed" ||
      accountRestriction?.reason === "account_suspended"
    );
  };

  const updateUserProfile = (partial: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    setUser(updated);
    localStorage.setItem("tradelink_user", JSON.stringify(updated));
    try {
      BusinessService.upsertBusiness(buildBusinessFromUser(updated));
    } catch {}
  };

  const value: AuthContextType = {
    user,
    subscription,
    paymentMethods,
    transactions,
    invoices,
    usageMetrics,
    dashboardData,
    isAuthenticated,
    isAccountRestricted,
    accountRestriction,
    login,
    signup,
    finalizePendingSignup,
    cancelPendingSignup,
    logout,
    updateDashboardData,
    addPartnership,
    addRedemption,
    upgradeSubscription,
    cancelSubscription,
    updatePaymentMethod,
    checkSubscriptionLimits,
    canAccessFeature,
    getCurrentPlanLimits,
    hasPaymentIssues,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

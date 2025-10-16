import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Cpu,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Search,
  Share2,
  Sparkles,
  Target,
  Trash2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateProposalModal } from "@/contexts/CreateProposalContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  BusinessService,
  type BusinessProfile,
} from "@/services/businessService";
import { ProposalService } from "@/services/proposalService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ProposalContent } from "@shared/proposals";

const companySizeLabels: Record<string, string> = {
  small: "1-25 employees",
  medium: "25-100 employees",
  large: "100+ employees",
};

type Step = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type PartnershipFocusOption = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type ObjectiveRow = {
  id: string;
  myGoal: string;
  partnerGoal: string;
};

const steps: Step[] = [
  { key: "partner-selection", label: "Partner Selection", icon: Users },
  { key: "outline", label: "Outline", icon: ClipboardList },
  { key: "contributions", label: "Contributions", icon: Handshake },
  { key: "objectives-outcomes", label: "Objectives", icon: Target },
  { key: "terms-details", label: "Terms & Details", icon: FileText },
  { key: "tracking", label: "Tracking", icon: BarChart3 },
  { key: "additional-notes", label: "Additional Notes", icon: MessageSquare },
  { key: "review-submit", label: "Review & Submit", icon: CheckCircle2 },
];

const partnershipFocusOptions: PartnershipFocusOption[] = [
  {
    key: "marketing-collaboration",
    title: "Marketing Collaboration",
    description:
      "Co-create campaigns, promotions, and storytelling that amplify both brands.",
    icon: Megaphone,
  },
  {
    key: "supply-partnership",
    title: "Supply Partnership",
    description:
      "Align supply chains to secure consistent materials, logistics, and inventory support.",
    icon: Package,
  },
  {
    key: "educational-alliance",
    title: "Educational Alliance",
    description:
      "Deliver shared learning programs, certifications, and knowledge exchange initiatives.",
    icon: GraduationCap,
  },
  {
    key: "event-collaboration",
    title: "Event Collaboration",
    description:
      "Co-host experiences, workshops, or pop-ups that engage both partner communities.",
    icon: Calendar,
  },
  {
    key: "co-development",
    title: "Co-Development",
    description:
      "Build new offerings together with joint product roadmaps and innovation sprints.",
    icon: Lightbulb,
  },
  {
    key: "distribution-agreement",
    title: "Distribution Agreement",
    description:
      "Expand reach through shared channels, bundled offerings, and referral pathways.",
    icon: Share2,
  },
  {
    key: "joint-venture",
    title: "Joint Venture",
    description:
      "Formalize a shared entity that blends resources, leadership, and risk management.",
    icon: Handshake,
  },
  {
    key: "sponsorship",
    title: "Sponsorship",
    description:
      "Provide financial or in-kind support that fuels strategic programs and activations.",
    icon: Sparkles,
  },
  {
    key: "technology-integration",
    title: "Technology Integration",
    description:
      "Connect platforms and workflows to deliver seamless digital experiences for users.",
    icon: Cpu,
  },
  {
    key: "research-partnership",
    title: "Research Partnership",
    description:
      "Collaborate on studies, pilots, and insights that advance shared knowledge goals.",
    icon: FlaskConical,
  },
];

type DurationUnit = "days" | "months" | "quarters" | "years";
type ReviewUnit = "weeks" | "months" | "quarters" | "years";

type TerminationKey = "breach" | "nonPerformance" | "mutualConsent";

const terminationOptions: Array<{ key: TerminationKey; label: string }> = [
  { key: "breach", label: "Breach of agreement" },
  { key: "nonPerformance", label: "Non-performance" },
  { key: "mutualConsent", label: "Mutual consent" },
];

const durationUnitOptions: Array<{ value: DurationUnit; label: string }> = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "quarters", label: "Quarters" },
  { value: "years", label: "Years" },
];

const reviewUnitOptions: Array<{ value: ReviewUnit; label: string }> = [
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "quarters", label: "Quarters" },
  { value: "years", label: "Years" },
];

type MeasurementUnit =
  | "number"
  | "percent"
  | "currency"
  | "time"
  | "resources"
  | "exposure";

type FrequencyUnit = "days" | "months" | "years" | "custom";

type KpiRow = {
  id: string;
  name: string;
  measurementUnit: MeasurementUnit;
  targetValue: string;
  currency: string;
  reportFrequencyValue: string;
  reportFrequencyUnit: FrequencyUnit;
};

const measurementUnitOptions: Array<{ value: MeasurementUnit; label: string }> =
  [
    { value: "number", label: "Number" },
    { value: "percent", label: "%" },
    { value: "currency", label: "$" },
    { value: "time", label: "Time" },
    { value: "resources", label: "Resources" },
    { value: "exposure", label: "Exposure/Reach" },
  ];

const currencyOptions: Array<{ value: string; label: string }> = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "JPY", label: "JPY — Japanese Yen" },
];

const defaultCurrency = currencyOptions[0].value;

const measurementUnitDisplay: Record<MeasurementUnit, string> = {
  number: "Number",
  percent: "%",
  currency: "Currency",
  time: "Time",
  resources: "Resources",
  exposure: "Exposure/Reach",
};

function formatKpiTarget(row: KpiRow): string {
  const value = row.targetValue.trim();
  if (!value) {
    return "—";
  }
  switch (row.measurementUnit) {
    case "currency":
      return `${row.currency} ${value}`;
    case "percent":
      return `${value}%`;
    case "number":
      return value;
    case "time":
    case "resources":
    case "exposure":
      return `${value} ${measurementUnitDisplay[row.measurementUnit]}`;
    default:
      return value;
  }
}

const reportFrequencyUnitOptions: Array<{
  value: FrequencyUnit;
  label: string;
}> = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
  { value: "custom", label: "Custom" },
];

const reportFrequencyUnitLabel: Record<FrequencyUnit, string> = {
  days: "Days",
  months: "Months",
  years: "Years",
  custom: "Custom",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function calculateEndDate(
  startDate: string,
  durationValue: string,
  durationUnit: DurationUnit,
): Date | null {
  const parsedStart = startDate ? new Date(startDate) : null;
  const numericValue = Number(durationValue);
  if (
    !parsedStart ||
    Number.isNaN(parsedStart.getTime()) ||
    !numericValue ||
    numericValue <= 0
  ) {
    return null;
  }

  const endDate = new Date(parsedStart.getTime());

  switch (durationUnit) {
    case "days":
      endDate.setDate(endDate.getDate() + numericValue);
      break;
    case "months":
      endDate.setMonth(endDate.getMonth() + numericValue);
      break;
    case "quarters":
      endDate.setMonth(endDate.getMonth() + numericValue * 3);
      break;
    case "years":
      endDate.setFullYear(endDate.getFullYear() + numericValue);
      break;
    default:
      break;
  }

  return endDate;
}

function createObjectiveRow(): ObjectiveRow {
  return {
    id: Math.random().toString(36).slice(2, 9),
    myGoal: "",
    partnerGoal: "",
  };
}

function createKpiRow(): KpiRow {
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: "",
    measurementUnit: "number",
    targetValue: "",
    currency: defaultCurrency,
    reportFrequencyValue: "",
    reportFrequencyUnit: "months",
  };
}

function isValidKpiRow(row: KpiRow): boolean {
  const hasName = row.name.trim().length > 0;
  const hasTarget = row.targetValue.trim().length > 0;
  const frequencyNumber = Number(row.reportFrequencyValue);
  const hasFrequency =
    row.reportFrequencyValue.trim().length > 0 &&
    !Number.isNaN(frequencyNumber) &&
    frequencyNumber > 0;
  const hasCurrency =
    row.measurementUnit !== "currency" || row.currency.trim().length > 0;
  return hasName && hasTarget && hasFrequency && hasCurrency;
}

function extractUserIdFromBusinessId(businessId: string): string {
  return businessId.replace(/^(biz_|bus_)/i, "");
}

function StepTimeline({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      {steps.map((step, index) => {
        const status =
          index === activeStep
            ? "active"
            : index < activeStep
              ? "complete"
              : "upcoming";

        return (
          <div
            key={step.key}
            className="flex flex-col items-center gap-2 px-2 text-center"
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200",
                status === "active" &&
                  "border-[#0f172a] bg-[#0f172a]/10 text-[#0f172a] shadow-sm",
                status === "complete" &&
                  "border-[#0f172a] bg-[#0f172a] text-white",
                status === "upcoming" &&
                  "border-gray-200 bg-white text-gray-400",
              )}
              aria-current={status === "active" ? "step" : undefined}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "max-w-[120px] text-xs font-medium leading-tight text-gray-500 sm:text-sm",
                status === "active" && "text-[#0f172a]",
                status === "complete" && "text-gray-700",
              )}
            >
              {step.label}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "block h-1 w-10 rounded-full transition-colors duration-200",
                status === "active" && "bg-[#0f172a]",
                status === "complete" && "bg-[#0f172a]/70",
                status === "upcoming" && "bg-gray-200",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

function StepPlaceholder({ step }: { step: Step }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0f172a]/10 text-[#0f172a]">
        <step.icon className="h-8 w-8" />
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold text-gray-900">{step.label}</h3>
        <p className="max-w-sm text-sm text-gray-600">Step coming soon.</p>
      </div>
    </div>
  );
}

function BusinessCard({
  business,
  selected,
  onSelect,
}: {
  business: BusinessProfile;
  selected: boolean;
  onSelect: () => void;
}) {
  const initials =
    business.logo?.trim().slice(0, 2).toUpperCase() ||
    business.name.slice(0, 2).toUpperCase();

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      className={cn(
        "group flex h-full flex-col rounded-3xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2",
        selected
          ? "border-[#0f172a] bg-white shadow-xl shadow-[#0f172a]/10"
          : "border-gray-200 bg-white hover:-translate-y-1 hover:shadow-lg",
      )}
    >
      <CardContent className="flex h-full min-h-0 flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-base font-semibold text-white",
                selected && "scale-105",
              )}
            >
              {initials}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                {business.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{business.industry}</span>
                <span className="hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {business.address.city}, {business.address.country}
                </span>
              </div>
            </div>
          </div>
          {business.verified && (
            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
              Verified
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600">{business.description}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-2 font-medium text-gray-700">
            <Users className="h-4 w-4 text-[#0f172a]/60" />
            {companySizeLabels[business.companySize] ?? business.companySize}
          </span>
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 transition",
              selected
                ? "border-[#0f172a] bg-[#0f172a] text-white"
                : "border-gray-200 bg-gray-50 text-gray-400",
            )}
            aria-label={selected ? "Selected" : "Select"}
          >
            {selected ? "✓" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function PartnershipTypeCard({
  option,
  selected,
  onSelect,
}: {
  option: PartnershipFocusOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border-2 bg-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2",
        selected
          ? "border-[#0f172a] shadow-xl shadow-[#0f172a]/15"
          : "border-gray-200 hover:-translate-y-1 hover:border-[#0f172a]/60 hover:shadow-lg",
      )}
    >
      <CardContent className="flex h-full min-h-0 flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow",
              selected && "scale-105 shadow-lg",
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition",
              selected
                ? "border-[#0f172a] bg-[#0f172a] text-white shadow"
                : "border-transparent text-gray-300",
            )}
            aria-hidden="true"
          >
            ✓
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {option.title}
          </h3>
          <p className="text-sm leading-relaxed text-gray-600">
            {option.description}
          </p>
        </div>
        <span
          className={cn(
            "mt-auto inline-flex items-center gap-2 text-xs font-medium text-[#0f172a] opacity-0 transition-opacity duration-200",
            selected && "opacity-100",
            !selected && "group-hover:opacity-100",
          )}
        >
          {selected ? "Selected focus" : "Choose this focus"}
        </span>
      </CardContent>
    </Card>
  );
}

export default function CreateProposalModal() {
  const {
    isOpen,
    closeModal,
    options,
    selectedPartnerId,
    setSelectedPartnerId,
    mode,
    proposalId,
    initialProposal,
  } = useCreateProposalModal();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState(options?.startStep ?? 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string | "_all">("_all");
  const [sizeFilter, setSizeFilter] = useState<string | "_all">("_all");
  const [countryFilter, setCountryFilter] = useState<string | "_all">("_all");
  const [selectedPartnershipKey, setSelectedPartnershipKey] = useState<
    string | null
  >(null);
  const [startDate, setStartDate] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("months");
  const [durationOngoing, setDurationOngoing] = useState(false);
  const [reviewValue, setReviewValue] = useState("");
  const [reviewUnit, setReviewUnit] = useState<ReviewUnit>("months");
  const [terminationSelections, setTerminationSelections] = useState<
    TerminationKey[]
  >([]);
  const [additionalTerms, setAdditionalTerms] = useState("");
  const [myContribution, setMyContribution] = useState("");
  const [partnerContribution, setPartnerContribution] = useState("");
  const [partnershipOverview, setPartnershipOverview] = useState("");
  const [objectiveRows, setObjectiveRows] = useState<ObjectiveRow[]>(() => [
    createObjectiveRow(),
  ]);
  const [kpiRows, setKpiRows] = useState<KpiRow[]>(() => [createKpiRow()]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [version, setVersion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [negotiationSummary, setNegotiationSummary] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      setSearchTerm("");
      setIndustryFilter("_all");
      setSizeFilter("_all");
      setCountryFilter("_all");
      setSelectedPartnerId(null);
      setSelectedPartnershipKey(null);
      setStartDate("");
      setDurationValue("");
      setDurationUnit("months");
      setDurationOngoing(false);
      setReviewValue("");
      setReviewUnit("months");
      setTerminationSelections([]);
      setAdditionalTerms("");
      setMyContribution("");
      setPartnerContribution("");
      setPartnershipOverview("");
      setObjectiveRows([createObjectiveRow()]);
      setKpiRows([createKpiRow()]);
      setAdditionalNotes("");
      setNegotiationSummary("");
      return;
    }

    setActiveStep(options?.startStep ?? 0);

    let isMounted = true;
    BusinessService.ensureLoaded().finally(() => {
      if (isMounted) {
        setVersion((value) => value + 1);
      }
    });

    const unsubscribe = BusinessService.subscribe(() => {
      setVersion((value) => value + 1);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, options?.startStep, setSelectedPartnerId]);

  useEffect(() => {
    if (!isOpen || !options?.partnerId) {
      return;
    }

    const existing = BusinessService.getBusinessById(options.partnerId);
    if (existing) {
      setSelectedPartnerId(options.partnerId);
    }
  }, [isOpen, options?.partnerId, setSelectedPartnerId, version]);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }
    setSelectedPartnershipKey(null);
    setStartDate("");
    setDurationValue("");
    setDurationUnit("months");
    setDurationOngoing(false);
    setReviewValue("");
    setReviewUnit("months");
    setTerminationSelections([]);
    setAdditionalTerms("");
    setMyContribution("");
    setPartnerContribution("");
    setPartnershipOverview("");
    setObjectiveRows([createObjectiveRow()]);
    setKpiRows([createKpiRow()]);
    setAdditionalNotes("");
  }, [selectedPartnerId, mode]);

  useEffect(() => {
    if (!isOpen || mode !== "negotiate" || !initialProposal) {
      return;
    }
    const content = initialProposal.content;
    if (content.partnerSelection.partnerId) {
      setSelectedPartnerId(content.partnerSelection.partnerId);
    }
    setSelectedPartnershipKey(content.outline.focusKey || null);
    setStartDate(content.terms.startDate ?? "");
    setDurationOngoing(Boolean(content.terms.ongoing));
    setDurationValue(
      !content.terms.ongoing && content.terms.durationValue != null
        ? String(content.terms.durationValue)
        : "",
    );
    setDurationUnit(content.terms.durationUnit ?? "months");
    setReviewValue(
      content.terms.reviewFrequencyValue != null
        ? String(content.terms.reviewFrequencyValue)
        : "",
    );
    setReviewUnit(content.terms.reviewFrequencyUnit ?? "months");
    setTerminationSelections(content.terms.terminationOptions ?? []);
    setAdditionalTerms(content.terms.additionalTerms ?? "");
    setMyContribution(content.contributions.proposerContribution ?? "");
    setPartnerContribution(content.contributions.recipientContribution ?? "");
    setPartnershipOverview(content.objectives.overview ?? "");
    const mappedObjectives = (content.objectives.rows ?? []).map((row) => ({
      id: row.id || Math.random().toString(36).slice(2, 9),
      myGoal: row.proposerOutcome ?? "",
      partnerGoal: row.recipientOutcome ?? "",
    }));
    setObjectiveRows(
      mappedObjectives.length > 0 ? mappedObjectives : [createObjectiveRow()],
    );
    setKpiRows(
      (content.tracking.kpis ?? []).map((kpi) => ({
        id: kpi.id || Math.random().toString(36).slice(2, 9),
        name: kpi.name ?? "",
        measurementUnit: kpi.measurementUnit,
        targetValue: kpi.targetValue ?? "",
        currency: kpi.currency ?? defaultCurrency,
        reportFrequencyValue:
          kpi.reportFrequencyValue != null
            ? String(kpi.reportFrequencyValue)
            : "",
        reportFrequencyUnit: kpi.reportFrequencyUnit,
      })),
    );
    if ((content.tracking.kpis ?? []).length === 0) {
      setKpiRows([createKpiRow()]);
    }
    setAdditionalNotes(content.additionalNotes ?? "");
  }, [isOpen, mode, initialProposal, setSelectedPartnerId]);

  const myBusinessId = user ? `biz_${user.id}` : null;
  const isNegotiation = mode === "negotiate";

  const industries = useMemo(() => BusinessService.getIndustries(), [version]);

  const countries = useMemo(() => BusinessService.getCountries(), [version]);

  const companySizes = useMemo(
    () => BusinessService.getCompanySizes(),
    [version],
  );

  const businesses = useMemo(() => {
    const filters = {
      excludeDemo: true,
      search: searchTerm || undefined,
      industry: industryFilter !== "_all" ? [industryFilter] : undefined,
      companySize: sizeFilter !== "_all" ? [sizeFilter] : undefined,
      country: countryFilter !== "_all" ? countryFilter : undefined,
      sortBy: "relevance" as const,
    };

    let results = BusinessService.getBusinesses(filters);
    if (myBusinessId) {
      results = results.filter((business) => business.id !== myBusinessId);
    }
    return results;
  }, [
    searchTerm,
    industryFilter,
    sizeFilter,
    countryFilter,
    version,
    myBusinessId,
  ]);

  const selectedPartner = useMemo(
    () =>
      selectedPartnerId
        ? BusinessService.getBusinessById(selectedPartnerId)
        : null,
    [selectedPartnerId, version],
  );

  const currentBusiness = useMemo(
    () => (myBusinessId ? BusinessService.getBusinessById(myBusinessId) : null),
    [myBusinessId, version],
  );

  const myBusinessName =
    currentBusiness?.name ?? user?.businessName ?? "Your company";
  const partnerBusinessName = selectedPartner?.name ?? "Partner";

  const selectedFocus = useMemo(
    () =>
      partnershipFocusOptions.find(
        (option) => option.key === selectedPartnershipKey,
      ) ?? null,
    [selectedPartnershipKey],
  );

  const hasValidObjectiveRow = useMemo(
    () =>
      objectiveRows.some((row) => row.myGoal.trim() && row.partnerGoal.trim()),
    [objectiveRows],
  );

  const hasValidKpiRows = useMemo(
    () => kpiRows.length > 0 && kpiRows.every((row) => isValidKpiRow(row)),
    [kpiRows],
  );

  const endDateLabel = useMemo(() => {
    if (durationOngoing) {
      return "End Date: N/A";
    }
    if (!startDate) {
      return "End Date: —";
    }
    const end = calculateEndDate(startDate, durationValue, durationUnit);
    return end ? `End Date: ${formatDate(end)}` : "End Date: —";
  }, [durationOngoing, startDate, durationValue, durationUnit]);

  const buildProposalContent = (): ProposalContent | null => {
    if (!selectedPartner || !selectedPartnerId) {
      return null;
    }
    const focus = partnershipFocusOptions.find(
      (option) => option.key === selectedPartnershipKey,
    );
    if (!focus) {
      return null;
    }
    const partnerLocation = [
      selectedPartner.address.city,
      selectedPartner.address.state,
      selectedPartner.address.country,
    ]
      .filter(Boolean)
      .join(", ");

    const outlineSummary = `${myBusinessName} and ${partnerBusinessName} will engage in a Mutual Partnership designed to create shared value through ${focus.title}.`;

    const computedEndDate = durationOngoing
      ? null
      : (() => {
          const end = calculateEndDate(startDate, durationValue, durationUnit);
          return end ? end.toISOString() : null;
        })();

    const objectives = objectiveRows.map((row) => ({
      id: row.id,
      proposerOutcome: row.myGoal.trim(),
      recipientOutcome: row.partnerGoal.trim(),
    }));

    const kpis = kpiRows.map((row) => ({
      id: row.id,
      name: row.name.trim(),
      measurementUnit: row.measurementUnit,
      targetValue: row.targetValue.trim(),
      currency: row.measurementUnit === "currency" ? row.currency : null,
      reportFrequencyValue: Number(row.reportFrequencyValue),
      reportFrequencyUnit: row.reportFrequencyUnit,
    }));

    return {
      partnerSelection: {
        partnerId: selectedPartnerId,
        partnerName: selectedPartner.name,
        partnerIndustry: selectedPartner.industry,
        partnerLocation,
      },
      outline: {
        summary: outlineSummary,
        focusKey: selectedPartnershipKey ?? "",
        focusTitle: focus.title,
        focusDescription: focus.description,
      },
      contributions: {
        proposerContribution: myContribution.trim(),
        recipientContribution: partnerContribution.trim(),
      },
      objectives: {
        overview: partnershipOverview.trim(),
        rows: objectives,
      },
      terms: {
        startDate,
        durationValue:
          !durationOngoing && durationValue.trim()
            ? Number(durationValue)
            : null,
        durationUnit: durationOngoing ? null : durationUnit,
        ongoing: durationOngoing,
        reviewFrequencyValue: Number(reviewValue),
        reviewFrequencyUnit: reviewUnit,
        terminationOptions: terminationSelections,
        additionalTerms: additionalTerms.trim(),
        computedEndDate,
      },
      tracking: {
        kpis,
      },
      additionalNotes: additionalNotes.trim(),
    };
  };

  const progress = ((activeStep + 1) / steps.length) * 100;
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  const submitProposal = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "You need to be signed in",
        description: "Log in to send proposals.",
      });
      return;
    }
    const content = buildProposalContent();
    if (!content) {
      toast({
        variant: "destructive",
        title: "Incomplete proposal",
        description: "Please complete all required fields before continuing.",
      });
      return;
    }
    const recipientBusinessId = content.partnerSelection.partnerId;
    const recipientId = extractUserIdFromBusinessId(recipientBusinessId);
    const recipientName = content.partnerSelection.partnerName?.trim();
    const proposerName = myBusinessName?.trim();

    if (!recipientId || !recipientName || !proposerName) {
      toast({
        variant: "destructive",
        title: "Missing business details",
        description:
          "Please ensure both businesses have complete profiles before submitting.",
      });
      setIsSubmitting(false);
      return;
    }
    const title = content.outline.focusTitle
      ? `${content.outline.focusTitle} Partnership`
      : `${proposerName} ↔ ${recipientName}`;

    setIsSubmitting(true);
    try {
      if (isNegotiation) {
        if (!proposalId) {
          throw new Error("proposal_not_found");
        }
        await ProposalService.negotiate(user.id, proposalId, {
          content,
          summary: negotiationSummary.trim() || undefined,
          actorName: proposerName,
        });
        toast({
          title: "Updates sent",
          description: `${recipientName} will review your requested changes.`,
        });
      } else {
        await ProposalService.create(user.id, {
          proposerId: user.id,
          proposerName,
          recipientId,
          recipientName,
          title,
          summary: content.outline.summary,
          content,
        });
        toast({
          title: "Proposal submitted",
          description: `${recipientName} has been notified.`,
        });
      }
      closeModal();
    } catch (error) {
      console.error("submitProposal failed", error);
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast({
        variant: "destructive",
        title: "Unable to complete request",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPrimaryDisabled =
    (activeStep === 0 && !selectedPartnerId) ||
    (activeStep === 1 && !selectedPartnershipKey) ||
    (activeStep === 2 &&
      (!myContribution.trim() || !partnerContribution.trim())) ||
    (activeStep === 3 &&
      (!partnershipOverview.trim() || !hasValidObjectiveRow)) ||
    (activeStep === 4 &&
      (!startDate ||
        (!durationOngoing && (!durationValue || Number(durationValue) <= 0)) ||
        !reviewValue ||
        Number(reviewValue) <= 0 ||
        terminationSelections.length === 0)) ||
    (activeStep === 5 && !hasValidKpiRows) ||
    isSubmitting;

  const primaryButtonLabel = isLastStep
    ? isNegotiation
      ? isSubmitting
        ? "Sending updates..."
        : "Send updates"
      : isSubmitting
        ? "Submitting..."
        : "Submit proposal"
    : "Next";

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handlePrimaryAction = () => {
    if (isPrimaryDisabled) {
      return;
    }

    if (isLastStep) {
      void submitProposal();
      return;
    }

    handleNext();
  };

  const handleEditNavigate = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  const handleAddObjectiveRow = () => {
    setObjectiveRows((prev) => [...prev, createObjectiveRow()]);
  };

  const handleRemoveObjectiveRow = (id: string) => {
    setObjectiveRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.id !== id) : prev,
    );
  };

  const handleObjectiveChange = (
    id: string,
    field: "myGoal" | "partnerGoal",
    value: string,
  ) => {
    setObjectiveRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleAddKpiRow = () => {
    setKpiRows((prev) => [...prev, createKpiRow()]);
  };

  const handleRemoveKpiRow = (id: string) => {
    setKpiRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.id !== id) : prev,
    );
  };

  const handleKpiFieldChange = <K extends keyof KpiRow>(
    id: string,
    field: K,
    value: KpiRow[K],
  ) => {
    setKpiRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleMeasurementUnitChange = (id: string, unit: MeasurementUnit) => {
    setKpiRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) {
          return row;
        }
        return {
          ...row,
          measurementUnit: unit,
          currency:
            unit === "currency"
              ? row.currency || defaultCurrency
              : row.currency,
        };
      }),
    );
  };

  const handleTerminationToggle = (key: TerminationKey, checked: boolean) => {
    setTerminationSelections((prev) => {
      if (checked) {
        return prev.includes(key) ? prev : [...prev, key];
      }
      return prev.filter((item) => item !== key);
    });
  };

  const handleDurationOngoingChange = (checked: boolean) => {
    setDurationOngoing(checked);
    if (checked) {
      setDurationValue("");
    }
  };

  const renderPartnerSelectionStep = () => (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, industry, or keywords"
            aria-label="Search businesses"
            className="h-11 rounded-xl border-gray-200 pl-9 focus-visible:ring-[#0f172a]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="h-11 w-[180px] rounded-xl border-gray-200">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="_all">All industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger className="h-11 w-[170px] rounded-xl border-gray-200">
              <SelectValue placeholder="Company size" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="_all">Any size</SelectItem>
              {companySizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {companySizeLabels[size] ?? size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="h-11 w-[170px] rounded-xl border-gray-200">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="_all">Any location</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            className="h-11 rounded-xl border border-transparent px-5 text-sm text-gray-600 transition hover:border-gray-200"
            onClick={() => {
              setSearchTerm("");
              setIndustryFilter("_all");
              setSizeFilter("_all");
              setCountryFilter("_all");
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {businesses.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
            <Handshake className="mb-4 h-10 w-10 text-blue-400" />
            <p className="text-lg font-medium text-gray-700">
              No matching businesses yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Adjust your search or filters to discover more potential partners.
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  selected={selectedPartnerId === business.id}
                  onSelect={() => setSelectedPartnerId(business.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOutlineStep = () => {
    if (!selectedPartner) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
          <ClipboardList className="mb-4 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-gray-700">
            Select a partner to continue
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Choose a business in the previous step to outline your partnership
            focus together.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        <div className="rounded-3xl border border-blue-100 bg-blue-50/70 px-6 py-5 shadow-sm">
          <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
            <span className="font-semibold text-gray-900">
              {myBusinessName}
            </span>{" "}
            and{" "}
            <span className="font-semibold text-gray-900">
              {partnerBusinessName}
            </span>{" "}
            will engage in a Mutual Partnership designed to create shared value
            through{" "}
            <span
              className={cn(
                "font-semibold",
                selectedFocus ? "text-[#0f172a]" : "text-gray-400 italic",
              )}
            >
              {selectedFocus
                ? selectedFocus.title
                : "select a partnership focus"}
            </span>
            .
          </p>
          {!selectedFocus && (
            <p className="mt-3 text-sm text-gray-500">
              Choose a partnership focus below to complete this outline
              statement.
            </p>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {partnershipFocusOptions.map((option) => (
                <PartnershipTypeCard
                  key={option.key}
                  option={option}
                  selected={selectedPartnershipKey === option.key}
                  onSelect={() => setSelectedPartnershipKey(option.key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContributionsStep = () => {
    if (!selectedPartner) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
          <Handshake className="mb-4 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-gray-700">
            Select a partner to continue
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Choose a business earlier in the flow to outline mutual
            contributions.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="h-full rounded-3xl border border-gray-200 shadow-sm">
            <CardContent className="flex h-full min-h-0 flex-col gap-4 p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
                  Contribution from {myBusinessName}
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {myBusinessName} will provide {partnerBusinessName} with
                </h3>
              </div>
              <Textarea
                value={myContribution}
                onChange={(event) => setMyContribution(event.target.value)}
                placeholder="Describe what you're offering — e.g., products, services, funding, expertise, marketing exposure, training, etc."
                className="min-h-[180px] resize-none rounded-2xl border-gray-200 bg-gray-50/60 p-4 text-gray-700 focus-visible:ring-[#0f172a]"
              />
              <p className="text-xs text-gray-500">
                Tip: Be specific so your partner understands the scope and scale
                of support.
              </p>
            </CardContent>
          </Card>

          <Card className="h-full rounded-3xl border border-gray-200 shadow-sm">
            <CardContent className="flex h-full min-h-0 flex-col gap-4 p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-purple-600">
                  Contribution from {partnerBusinessName}
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {partnerBusinessName} will provide {myBusinessName} with
                </h3>
              </div>
              <Textarea
                value={partnerContribution}
                onChange={(event) => setPartnerContribution(event.target.value)}
                placeholder="Describe what your partner is offering — e.g., products, services, funding, expertise, marketing exposure, training, etc."
                className="min-h-[180px] resize-none rounded-2xl border-gray-200 bg-gray-50/60 p-4 text-gray-700 focus-visible:ring-[#0f172a]"
              />
              <p className="text-xs text-gray-500">
                Tip: Capture how this contribution complements what you provide.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50/70 px-6 py-4 text-sm text-gray-600">
          Align the exchange so both sides feel equitable. Clear, balanced
          contributions set the tone for a successful partnership.
        </div>
      </div>
    );
  };

  const renderObjectivesStep = () => {
    if (!selectedPartner) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
          <Target className="mb-4 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-gray-700">
            Select a partner to continue
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Choose a business earlier in the flow to capture shared objectives
            and outcomes.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <p className="text-xl font-semibold text-gray-900">
              This partnership aims to achieve
              <span className="text-[#0f172a]">&nbsp;shared value</span>
              &nbsp;through
            </p>
            <Textarea
              value={partnershipOverview}
              onChange={(event) => setPartnershipOverview(event.target.value)}
              placeholder="Describe the shared goals — e.g., increased reach, sales growth, product improvement, community engagement, etc."
              className="min-h-[160px] resize-none rounded-2xl border-gray-200 bg-gray-50/60 p-4 text-gray-700 focus-visible:ring-[#0f172a]"
            />
            <p className="text-xs text-gray-500">
              Outline the big-picture impact you expect for both organisations.
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex h-full min-h-0 flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
                  Objectives & Outcomes
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  Align goals for {myBusinessName} and {partnerBusinessName}
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddObjectiveRow}
                className="flex items-center gap-2 rounded-full border-dashed px-4 py-2 text-sm"
              >
                <Plus className="h-4 w-4" /> Add objective
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto pr-1">
                <div className="rounded-2xl border border-gray-200">
                  <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4 rounded-t-2xl bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-600 md:grid">
                    <span>Objectives / Outcomes for {myBusinessName}</span>
                    <span>Objectives / Outcomes for {partnerBusinessName}</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <div className="space-y-4 p-4 md:p-6">
                    {objectiveRows.map((row, index) => (
                      <div
                        key={row.id}
                        className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:p-5"
                      >
                        <div className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 md:hidden">
                            Objectives for {myBusinessName}
                          </span>
                          <Textarea
                            value={row.myGoal}
                            onChange={(event) =>
                              handleObjectiveChange(
                                row.id,
                                "myGoal",
                                event.target.value,
                              )
                            }
                            placeholder="Describe expected outcomes for {myBusinessName}"
                            className="min-h-[120px] resize-none rounded-2xl border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 focus-visible:ring-[#0f172a]"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 md:hidden">
                            Objectives for {partnerBusinessName}
                          </span>
                          <Textarea
                            value={row.partnerGoal}
                            onChange={(event) =>
                              handleObjectiveChange(
                                row.id,
                                "partnerGoal",
                                event.target.value,
                              )
                            }
                            placeholder="Describe expected outcomes for {partnerBusinessName}"
                            className="min-h-[120px] resize-none rounded-2xl border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 focus-visible:ring-[#0f172a]"
                          />
                        </div>
                        <div className="flex items-start justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveObjectiveRow(row.id)}
                            disabled={objectiveRows.length === 1}
                            className="h-10 w-10 rounded-full text-gray-500 hover:text-red-600 disabled:opacity-40"
                            aria-label={
                              objectiveRows.length === 1
                                ? "At least one objective row is required"
                                : `Remove row ${index + 1}`
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Capture measurable outcomes that show how success looks for each
              business.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTermsStep = () => {
    if (!selectedPartner) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
          <FileText className="mb-4 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-gray-700">
            Select a partner to continue
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Choose a business earlier in the flow to outline terms and
            partnership logistics.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        <Card className="flex-1 rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex h-full min-h-0 flex-col gap-6 p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
                Terms & Details
              </p>
              <h3 className="text-xl font-semibold text-gray-900">
                Outline the logistics of this partnership
              </h3>
              <p className="text-sm text-gray-600">
                Define the timeline, cadence, and guardrails that keep both
                businesses aligned.
              </p>
            </div>

            <div className="space-y-5">
              <section className="rounded-3xl border border-gray-100 bg-gray-50/60 p-5">
                <div className="space-y-3">
                  <Label
                    htmlFor="partnership-start-date"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Partnership start date
                  </Label>
                  <Input
                    id="partnership-start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-11 rounded-2xl border-gray-200 bg-white text-gray-700 focus-visible:ring-[#0f172a]"
                  />
                  <p className="text-xs text-gray-500">
                    Use your preferred dd/mm/yy format when exporting documents.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-100 bg-gray-50/60 p-5">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Duration
                    </p>
                    <p className="text-xs text-gray-500">
                      Specify how long this agreement lasts or mark it as
                      ongoing.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <Input
                      type="number"
                      min={1}
                      value={durationValue}
                      onChange={(event) => setDurationValue(event.target.value)}
                      disabled={durationOngoing}
                      placeholder="Value"
                      className="h-11 rounded-2xl border-gray-200 bg-white text-gray-700 focus-visible:ring-[#0f172a] disabled:cursor-not-allowed"
                    />
                    <Select
                      value={durationUnit}
                      onValueChange={(value) =>
                        setDurationUnit(value as DurationUnit)
                      }
                      disabled={durationOngoing}
                    >
                      <SelectTrigger className="h-11 rounded-2xl border-gray-200 bg-white text-gray-700 disabled:cursor-not-allowed">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationUnitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Checkbox
                      id="duration-ongoing"
                      checked={durationOngoing}
                      onCheckedChange={(checked) =>
                        handleDurationOngoingChange(Boolean(checked))
                      }
                    />
                    <Label
                      htmlFor="duration-ongoing"
                      className="text-sm text-gray-600"
                    >
                      Ongoing / Forever
                    </Label>
                  </div>
                  <p className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-medium text-gray-700">
                    {endDateLabel}
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-100 bg-gray-50/60 p-5">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Partnership review frequency
                    </p>
                    <p className="text-xs text-gray-500">
                      Decide how often both teams will reconnect on progress.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <Input
                      type="number"
                      min={1}
                      value={reviewValue}
                      onChange={(event) => setReviewValue(event.target.value)}
                      placeholder="Value"
                      className="h-11 rounded-2xl border-gray-200 bg-white text-gray-700 focus-visible:ring-[#0f172a]"
                    />
                    <Select
                      value={reviewUnit}
                      onValueChange={(value) =>
                        setReviewUnit(value as ReviewUnit)
                      }
                    >
                      <SelectTrigger className="h-11 rounded-2xl border-gray-200 bg-white text-gray-700">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {reviewUnitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-100 bg-gray-50/60 p-5">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Termination conditions
                    </p>
                    <p className="text-xs text-gray-500">
                      Set the scenarios that allow either side to exit the
                      partnership.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {terminationOptions.map((option) => {
                      const checked = terminationSelections.includes(
                        option.key,
                      );
                      return (
                        <label
                          key={option.key}
                          htmlFor={`termination-${option.key}`}
                          className="flex items-center gap-3 rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-gray-600 transition hover:border-[#0f172a]/30"
                        >
                          <Checkbox
                            id={`termination-${option.key}`}
                            checked={checked}
                            onCheckedChange={(state) =>
                              handleTerminationToggle(
                                option.key,
                                Boolean(state),
                              )
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Select at least one condition to protect both parties.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-100 bg-gray-50/60 p-5">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Additional terms / notes (optional)
                    </p>
                    <p className="text-xs text-gray-500">
                      Capture any bespoke clauses, payment details, or
                      operational reminders.
                    </p>
                  </div>
                  <Textarea
                    id="additional-terms"
                    value={additionalTerms}
                    onChange={(event) => setAdditionalTerms(event.target.value)}
                    placeholder="Add any specific clauses, payment terms, or operational notes to remember."
                    className="min-h-[160px] resize-none rounded-2xl border border-gray-200 bg-white p-4 text-gray-700 focus-visible:ring-[#0f172a]"
                  />
                  <p className="text-xs text-gray-500">
                    Keep this section updated as negotiations evolve.
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTrackingStep = () => {
    if (!selectedPartner) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
          <BarChart3 className="mb-4 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-gray-700">
            Select a partner to continue
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Choose a business earlier in the flow to outline key performance
            indicators together.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
              Tracking
            </p>
            <h3 className="text-xl font-semibold text-gray-900">
              KPIs to track
            </h3>
            <p className="text-sm text-gray-600">
              Align on the success metrics you will monitor across this
              partnership. Clear KPIs make progress easy to evaluate during
              review sessions.
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex h-full min-h-0 flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
                  KPIs to Track
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  Monitor results for {myBusinessName} and {partnerBusinessName}
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddKpiRow}
                className="flex items-center gap-2 rounded-full border-dashed px-4 py-2 text-sm"
              >
                <Plus className="h-4 w-4" /> Add KPI
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto pr-1">
                <div className="rounded-2xl border border-gray-200">
                  <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-4 rounded-t-2xl bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-600 lg:grid">
                    <span>KPI Name</span>
                    <span>Target & Measurement</span>
                    <span>Report Frequency</span>
                    <span className="text-right">Actions</span>
                  </div>
                  <div className="space-y-4 p-4 lg:p-6">
                    {kpiRows.map((row, index) => {
                      const isCurrency = row.measurementUnit === "currency";

                      const measurementSelect = (
                        <Select
                          value={row.measurementUnit}
                          onValueChange={(value) =>
                            handleMeasurementUnitChange(
                              row.id,
                              value as MeasurementUnit,
                            )
                          }
                        >
                          <SelectTrigger className="h-11 rounded-2xl border-gray-200 bg-gray-50/60 text-sm text-gray-700">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {measurementUnitOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );

                      const currencySelect = isCurrency ? (
                        <Select
                          value={row.currency}
                          onValueChange={(value) =>
                            handleKpiFieldChange(row.id, "currency", value)
                          }
                        >
                          <SelectTrigger className="h-11 rounded-2xl border border-gray-200 bg-gray-50/60 text-sm text-gray-700">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {currencyOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null;

                      return (
                        <div
                          key={row.id}
                          className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:p-5"
                        >
                          <div className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                              KPI Name
                            </span>
                            <Input
                              value={row.name}
                              onChange={(event) =>
                                handleKpiFieldChange(
                                  row.id,
                                  "name",
                                  event.target.value,
                                )
                              }
                              placeholder="e.g., Qualified leads per month"
                              className="h-11 rounded-2xl border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus-visible:ring-[#0f172a]"
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                              Target & Measurement
                            </span>
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                              <Input
                                value={row.targetValue}
                                onChange={(event) =>
                                  handleKpiFieldChange(
                                    row.id,
                                    "targetValue",
                                    event.target.value,
                                  )
                                }
                                placeholder="Target value"
                                className="h-11 rounded-2xl border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus-visible:ring-[#0f172a]"
                              />
                              {measurementSelect}
                            </div>
                            {currencySelect && (
                              <div className="grid gap-2 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] sm:items-center">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Currency
                                </span>
                                {currencySelect}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                              Report Frequency
                            </span>
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                              <Input
                                type="number"
                                min={1}
                                value={row.reportFrequencyValue}
                                onChange={(event) =>
                                  handleKpiFieldChange(
                                    row.id,
                                    "reportFrequencyValue",
                                    event.target.value,
                                  )
                                }
                                placeholder="Value"
                                className="h-11 rounded-2xl border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus-visible:ring-[#0f172a]"
                              />
                              <Select
                                value={row.reportFrequencyUnit}
                                onValueChange={(value) =>
                                  handleKpiFieldChange(
                                    row.id,
                                    "reportFrequencyUnit",
                                    value as FrequencyUnit,
                                  )
                                }
                              >
                                <SelectTrigger className="h-11 rounded-2xl border-gray-200 bg-gray-50/60 text-sm text-gray-700">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {reportFrequencyUnitOptions.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-start justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveKpiRow(row.id)}
                              disabled={kpiRows.length === 1}
                              className="h-10 w-10 rounded-full text-gray-500 hover:text-red-600 disabled:opacity-40"
                              aria-label={
                                kpiRows.length === 1
                                  ? "At least one KPI is required"
                                  : `Remove KPI ${index + 1}`
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Use these KPIs during check-ins to course-correct and celebrate
              wins together.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAdditionalNotesStep = () => {
    if (!selectedPartner) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
          <MessageSquare className="mb-4 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-gray-700">
            Select a partner to continue
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Choose a business earlier in the flow to add any final notes for
            your partnership.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
              Additional Notes
            </p>
            <h3 className="text-xl font-semibold text-gray-900">
              Add extra context for {myBusinessName} and {partnerBusinessName}
            </h3>
            <p className="text-sm text-gray-600">
              Capture optional terms, reminders, or clarifications that help
              both teams stay aligned. You can leave this blank if there's
              nothing to add right now.
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex h-full min-h-0 flex-col gap-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
                  Optional Field
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  Additional notes (optional)
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={handleNext}
                className="h-11 rounded-full px-5 text-sm text-gray-600 transition hover:text-[#0f172a]"
              >
                Skip for now
              </Button>
            </div>

            <Textarea
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Add any extra terms, requests, or context your partner should know."
              className="min-h-[260px] flex-1 resize-none rounded-3xl border-gray-200 bg-gray-50/60 p-4 text-gray-700 focus-visible:ring-[#0f172a]"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                These notes are optional and can be updated later if new details
                emerge.
              </span>
              <span>{additionalNotes.length} characters</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReviewStep = () => {
    if (!selectedPartner) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
          <CheckCircle2 className="mb-4 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-gray-700">
            Select a partner to continue
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Choose a business earlier in the flow to review and submit your
            proposal together.
          </p>
        </div>
      );
    }

    const terminationLabels = terminationOptions
      .filter((option) => terminationSelections.includes(option.key))
      .map((option) => option.label);

    const filledObjectives = objectiveRows.filter(
      (row) => row.myGoal.trim() || row.partnerGoal.trim(),
    );

    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
              Review
            </p>
            <h3 className="text-xl font-semibold text-gray-900">
              Proposal for {myBusinessName} & {partnerBusinessName}
            </h3>
            <p className="text-sm text-gray-600">
              Confirm each section below before submitting. Use the Edit action
              to jump back and adjust any detail that needs refinement.
            </p>
            {selectedFocus && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#0f172a]/10 bg-[#0f172a]/5 px-4 py-1.5 text-xs font-semibold text-[#0f172a]">
                Focus: {selectedFocus.title}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="flex h-full min-h-0 flex-col gap-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
                  Review & Submit
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  Make sure everything looks right
                </h3>
                <p className="text-sm text-gray-600">
                  This summary is read-only. Navigate back to the relevant step
                  if you need to update any information before submitting.
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-6 pr-4">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Outline
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNavigate(1)}
                        className="h-8 rounded-full px-3 text-xs text-gray-600 hover:text-[#0f172a]"
                      >
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">
                      <span className="font-semibold text-gray-900">
                        {myBusinessName}
                      </span>{" "}
                      and{" "}
                      <span className="font-semibold text-gray-900">
                        {partnerBusinessName}
                      </span>{" "}
                      will engage in a mutual partnership designed to create
                      shared value through{" "}
                      {selectedFocus ? (
                        <span className="font-semibold text-[#0f172a]">
                          {selectedFocus.title}
                        </span>
                      ) : (
                        <span className="font-semibold text-red-500">
                          No focus selected
                        </span>
                      )}
                      .
                    </p>
                    {selectedFocus?.description && (
                      <p className="mt-2 text-xs text-gray-500">
                        {selectedFocus.description}
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Contributions
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNavigate(2)}
                        className="h-8 rounded-full px-3 text-xs text-gray-600 hover:text-[#0f172a]"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {myBusinessName}
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          {myContribution}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                          {partnerBusinessName}
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          {partnerContribution}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Objectives & Outcomes
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNavigate(3)}
                        className="h-8 rounded-full px-3 text-xs text-gray-600 hover:text-[#0f172a]"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Overview
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          {partnershipOverview}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {filledObjectives.map((row) => (
                          <div
                            key={row.id}
                            className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2"
                          >
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                Outcomes for {myBusinessName}
                              </p>
                              <p className="mt-2 text-sm text-gray-700">
                                {row.myGoal}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                                Outcomes for {partnerBusinessName}
                              </p>
                              <p className="mt-2 text-sm text-gray-700">
                                {row.partnerGoal}
                              </p>
                            </div>
                          </div>
                        ))}
                        {filledObjectives.length === 0 && (
                          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-sm text-gray-500">
                            No objectives have been added yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Terms & Details
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNavigate(4)}
                        className="h-8 rounded-full px-3 text-xs text-gray-600 hover:text-[#0f172a]"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-700">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Start date
                        </p>
                        <p className="mt-1">
                          {startDate
                            ? formatDate(new Date(startDate))
                            : "Not set"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-700">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Duration
                        </p>
                        <p className="mt-1">
                          {durationOngoing
                            ? "Ongoing / Forever"
                            : durationValue
                              ? `${durationValue} ${durationUnitOptions.find((option) => option.value === durationUnit)?.label ?? durationUnit}`
                              : "Not set"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-700">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Review frequency
                        </p>
                        <p className="mt-1">
                          {reviewValue
                            ? `${reviewValue} ${reviewUnitOptions.find((option) => option.value === reviewUnit)?.label ?? reviewUnit}`
                            : "Not set"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-700">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Termination conditions
                        </p>
                        <p className="mt-1">
                          {terminationLabels.length > 0
                            ? terminationLabels.join(", ")
                            : "None selected"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Additional terms / notes
                      </p>
                      <p className="mt-2 text-sm text-gray-700">
                        {additionalTerms.trim()
                          ? additionalTerms
                          : "No additional terms provided."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Tracking / KPIs
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNavigate(5)}
                        className="h-8 rounded-full px-3 text-xs text-gray-600 hover:text-[#0f172a]"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {kpiRows.map((row, index) => (
                        <div
                          key={row.id}
                          className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-700"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900">
                              {index + 1}. {row.name}
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#0f172a]/10 bg-white px-3 py-1 text-xs font-medium text-[#0f172a]">
                              {measurementUnitDisplay[row.measurementUnit]}
                            </span>
                          </div>
                          <div className="mt-3 grid gap-3 md:grid-cols-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Target
                              </p>
                              <p className="mt-1">{formatKpiTarget(row)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Measurement unit
                              </p>
                              <p className="mt-1">
                                {measurementUnitDisplay[row.measurementUnit]}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Report frequency
                              </p>
                              <p className="mt-1">
                                {row.reportFrequencyValue}{" "}
                                {
                                  reportFrequencyUnitLabel[
                                    row.reportFrequencyUnit
                                  ]
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {kpiRows.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-sm text-gray-500">
                          No KPIs have been added yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Additional Notes
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNavigate(6)}
                        className="h-8 rounded-full px-3 text-xs text-gray-600 hover:text-[#0f172a]"
                      >
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700">
                      {additionalNotes.trim()
                        ? additionalNotes
                        : "No additional notes provided."}
                    </p>
                  </div>

                  {isNegotiation && (
                    <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                        Share context with your partner
                      </h4>
                      <Textarea
                        value={negotiationSummary}
                        onChange={(event) =>
                          setNegotiationSummary(event.target.value)
                        }
                        placeholder="Summarise the updates or requests you are sending back."
                        rows={4}
                        className="rounded-2xl border-blue-100 bg-white text-sm text-gray-700 focus-visible:ring-[#0f172a]"
                      />
                      <p className="mt-2 text-xs text-blue-700/80">
                        This message will appear alongside the updated proposal
                        so your partner understands what changed.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs text-amber-700">
              Need to tweak something? Use Edit below to jump straight to the
              step that needs an update.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (!open ? closeModal() : undefined)}
    >
      <DialogContent className="h-[92vh] w-full max-w-6xl overflow-hidden border-0 bg-white p-0 shadow-2xl">
        <div className="flex h-full min-h-0 flex-col">
          <header className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 px-8 pt-8 pb-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                  Guided proposal builder
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-gray-900">
                  Create a new partnership proposal
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-600">
                  Follow each step to shape the structure of your partnership
                  proposal.
                </p>
              </div>
              <div className="hidden items-center gap-4 md:flex">
                <Badge className="border-blue-200 bg-blue-100 text-blue-700">
                  {activeStep + 1} of {steps.length} steps
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
                <span
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <StepTimeline activeStep={activeStep} />
            </div>
          </header>

          <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto px-8 py-6">
            {activeStep === 0 ? (
              renderPartnerSelectionStep()
            ) : activeStep === 1 ? (
              renderOutlineStep()
            ) : activeStep === 2 ? (
              renderContributionsStep()
            ) : activeStep === 3 ? (
              renderObjectivesStep()
            ) : activeStep === 4 ? (
              renderTermsStep()
            ) : activeStep === 5 ? (
              renderTrackingStep()
            ) : activeStep === 6 ? (
              renderAdditionalNotesStep()
            ) : activeStep === 7 ? (
              renderReviewStep()
            ) : (
              <StepPlaceholder step={steps[activeStep]} />
            )}
          </main>

          <footer className="border-t border-gray-100 bg-white px-8 py-6">
            {isLastStep ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Badge
                      variant="outline"
                      className="border-gray-200 bg-gray-50 text-gray-600"
                    >
                      Step {activeStep + 1} of {steps.length}
                    </Badge>
                    <span>{steps[activeStep]?.label ?? ""}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={closeModal}
                    className="h-11 px-5"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 justify-center gap-2 rounded-full px-6 text-sm"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      {steps.slice(0, steps.length - 1).map((step, index) => (
                        <DropdownMenuItem
                          key={step.key}
                          onSelect={(_event) => {
                            handleEditNavigate(index);
                          }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-xs font-semibold text-gray-400">
                            {index + 1}.
                          </span>
                          {step.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    onClick={handlePrimaryAction}
                    className="h-11 rounded-full bg-[#0f172a] px-8 text-white shadow-lg transition-colors hover:bg-[#0c1220] disabled:bg-[#0f172a]/50 disabled:text-white/80 disabled:shadow-none"
                    disabled={isPrimaryDisabled}
                  >
                    {primaryButtonLabel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Badge
                    variant="outline"
                    className="border-gray-200 bg-gray-50 text-gray-600"
                  >
                    Step {activeStep + 1} of {steps.length}
                  </Badge>
                  <span>{steps[activeStep]?.label ?? ""}</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={closeModal}
                    className="h-11 px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="h-11 px-6"
                    disabled={isFirstStep}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePrimaryAction}
                    className="h-11 px-8 bg-[#0f172a] text-white shadow-lg transition-colors hover:bg-[#0c1220] disabled:bg-[#0f172a]/50 disabled:text-white/80 disabled:shadow-none"
                    disabled={isPrimaryDisabled}
                  >
                    {primaryButtonLabel}
                  </Button>
                </div>
              </div>
            )}
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { LucideIcon, Factory, PackageSearch, ShoppingBag, Users, Megaphone, Cpu, Share2, Coins, Stamp, Handshake, Truck, Layers, Sparkles, Gift, GraduationCap } from "lucide-react";

export type PartnershipTypeId =
  | "supplier"
  | "distributor"
  | "reseller"
  | "strategic_alliance"
  | "marketing"
  | "technology_integration"
  | "referral"
  | "investment"
  | "licensing"
  | "joint_venture"
  | "service"
  | "channel_expansion"
  | "co_branding"
  | "loyalty"
  | "education";

export interface PartnershipTemplateSection {
  id: string;
  title: string;
  defaultContent: string;
}

export interface PartnershipDeliverableField {
  id: string;
  label: string;
  placeholder: string;
}

export interface PartnershipKpiConfig {
  id: string;
  label: string;
  metric: string;
  description: string;
  defaultTarget?: string;
  frequency?: "weekly" | "monthly" | "quarterly" | "campaign" | "annual";
  trackingModes: Array<"automatic" | "manual">;
  requiresTracking: boolean;
}

export interface PartnershipTypeConfig {
  id: PartnershipTypeId;
  name: string;
  summary: string;
  outcomes: string[];
  templates: PartnershipTemplateSection[];
  deliverableFields: PartnershipDeliverableField[];
  pricingModels: string[];
  timelineSuggestions: string[];
  responsibilitySuggestions: string[];
  attachmentsHint: string;
  clausesHint: string;
  aiBrief: string;
  kpis: PartnershipKpiConfig[];
  requiresTracking: boolean;
  icon: LucideIcon;
}

export const PARTNERSHIP_TYPES: Record<PartnershipTypeId, PartnershipTypeConfig> = {
  supplier: {
    id: "supplier",
    name: "Supplier",
    summary:
      "Define how goods or materials will be supplied, ensuring clarity on quality standards, delivery cadence, and escalation paths.",
    outcomes: [
      "Reliable fulfillment with agreed lead times",
      "Consistent quality aligned to specification",
      "Transparent pricing with volume incentives",
    ],
    templates: [
      {
        id: "supply_scope",
        title: "Supply Scope",
        defaultContent:
          "Outline the products or materials provided, including SKUs, specifications, and compliance requirements.",
      },
      {
        id: "delivery_schedule",
        title: "Delivery Schedule",
        defaultContent:
          "Document shipment cadence, lead times, order cut-off windows, and logistics partners involved.",
      },
      {
        id: "quality_assurance",
        title: "Quality Assurance & Escalation",
        defaultContent:
          "Summarize inspection procedures, defect thresholds, and the escalation path for quality incidents.",
      },
      {
        id: "commercial_terms",
        title: "Commercial Terms",
        defaultContent:
          "Capture pricing tiers, payment terms, rebates, and any minimum order commitments.",
      },
    ],
    deliverableFields: [
      { id: "sku_list", label: "SKU / Material List", placeholder: "List the SKUs or material codes included" },
      { id: "delivery_windows", label: "Delivery Windows", placeholder: "Describe the dispatch and receipt windows" },
      { id: "quality_checks", label: "Quality Checks", placeholder: "Detail inspections or acceptance tests" },
    ],
    pricingModels: [
      "Unit-based pricing with volume breakpoints",
      "Consignment replenishment",
      "Cost-plus with quarterly adjustment",
    ],
    timelineSuggestions: [
      "Rolling 12-month supply horizon",
      "Quarterly capacity confirmation",
      "Monthly fulfillment review cadence",
    ],
    responsibilitySuggestions: [
      "Supplier maintains safety stock and provides weekly availability reports",
      "Buyer issues firm purchase orders with 14-day notice",
      "Joint review of quality incidents within 48 hours",
    ],
    attachmentsHint: "Attach product catalogs, compliance certificates, or logistics SLAs.",
    clausesHint: "Include force majeure clauses, liability limits, and substitution policies.",
    aiBrief:
      "Craft a supplier partnership summary including scope, delivery expectations, quality safeguards, and commercial alignment.",
    kpis: [
      {
        id: "on_time_fulfillment",
        label: "On-time Fulfillment",
        metric: "% of deliveries on or before agreed date",
        description: "Tracks reliability of shipment arrivals against the committed schedule.",
        defaultTarget: "≥ 96%",
        frequency: "monthly",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
      {
        id: "defect_rate",
        label: "Defect Rate",
        metric: "Defective units per 1,000 received",
        description: "Monitors quality performance across delivered batches.",
        defaultTarget: "≤ 2 / 1,000",
        frequency: "monthly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "lead_time",
        label: "Average Lead Time",
        metric: "Days from purchase order to receipt",
        description: "Measures responsiveness of the supply chain.",
        defaultTarget: "≤ 12 days",
        frequency: "monthly",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
    ],
    requiresTracking: true,
    icon: Factory,
  },
  distributor: {
    id: "distributor",
    name: "Distributor",
    summary:
      "Establish territory coverage, sales targets, and marketing support for downstream distribution partners.",
    outcomes: [
      "Expanded reach in priority territories",
      "Shared channel marketing execution",
      "Predictable replenishment and reporting cadence",
    ],
    templates: [
      {
        id: "territory_rights",
        title: "Territory & Rights",
        defaultContent:
          "Specify geographic or channel exclusivity, competitive boundaries, and performance gateways.",
      },
      {
        id: "sales_plan",
        title: "Sales Plan",
        defaultContent:
          "Detail quarterly revenue targets, key accounts, and promotional calendars.",
      },
      {
        id: "enablement",
        title: "Enablement & Support",
        defaultContent:
          "List training, co-op marketing funds, and systems access provided to the distributor.",
      },
      {
        id: "inventory_alignment",
        title: "Inventory & Logistics",
        defaultContent:
          "Describe ordering cadence, stock thresholds, and returns handling.",
      },
    ],
    deliverableFields: [
      { id: "territories", label: "Territories Covered", placeholder: "Outline regions or channels assigned" },
      { id: "quarterly_targets", label: "Quarterly Revenue Targets", placeholder: "Set revenue expectations per quarter" },
      { id: "marketing_support", label: "Marketing Support", placeholder: "List MDF, campaigns, or collateral" },
    ],
    pricingModels: [
      "Wholesale discount by tier",
      "Sell-in commit with rebate",
      "Performance-based incentive bonus",
    ],
    timelineSuggestions: [
      "Annual channel plan with quarterly checkpoints",
      "Monthly POS data submission",
      "Bi-annual joint business review",
    ],
    responsibilitySuggestions: [
      "Distributor provides monthly sell-through and inventory reports",
      "Supplier replenishes stock within 10 business days",
      "Joint marketing calendar agreed one quarter in advance",
    ],
    attachmentsHint: "Upload territory maps, price lists, or brand guidelines.",
    clausesHint: "Add exclusivity terms, non-compete provisions, and termination triggers.",
    aiBrief:
      "Summarize a distributor agreement with territory definition, sales targets, enablement commitments, and reporting cadence.",
    kpis: [
      {
        id: "sell_through",
        label: "Sell-through Rate",
        metric: "% of inventory sold-through vs sold-in",
        description: "Indicates distributor effectiveness at moving product downstream.",
        defaultTarget: "≥ 75%",
        frequency: "monthly",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
      {
        id: "revenue_generated",
        label: "Revenue Generated",
        metric: "Gross revenue per quarter",
        description: "Measures financial performance within assigned territories.",
        defaultTarget: "$500k per quarter",
        frequency: "quarterly",
        trackingModes: ["automatic"],
        requiresTracking: true,
      },
      {
        id: "inventory_turn",
        label: "Inventory Turnover",
        metric: "Number of turns per quarter",
        description: "Highlights inventory efficiency within distributor warehouses.",
        defaultTarget: "≥ 4 turns",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
    ],
    requiresTracking: true,
    icon: PackageSearch,
  },
  reseller: {
    id: "reseller",
    name: "Reseller",
    summary:
      "Equip resellers with the collateral, pricing, and support needed to represent and sell offerings effectively.",
    outcomes: [
      "Consistent messaging across reseller channel",
      "Clearly defined margin structure",
      "Responsive enablement and deal support",
    ],
    templates: [
      {
        id: "product_enablement",
        title: "Product Enablement",
        defaultContent:
          "Provide positioning guides, demo access, and certification requirements for reseller teams.",
      },
      {
        id: "deal_registration",
        title: "Deal Registration & Support",
        defaultContent:
          "Describe the process for registering opportunities, escalation paths, and solution engineering assistance.",
      },
      {
        id: "compensation",
        title: "Compensation & Margins",
        defaultContent:
          "Outline discounts, margin expectations, and incentive tiers tied to volume or product mix.",
      },
      {
        id: "service_expectations",
        title: "Service Expectations",
        defaultContent:
          "Set expectations for customer onboarding, support responsibilities, and renewal management.",
      },
    ],
    deliverableFields: [
      { id: "sales_kits", label: "Sales Kits Provided", placeholder: "List decks, datasheets, demos" },
      { id: "support_hours", label: "Support Availability", placeholder: "Define hours and channels for assistance" },
      { id: "margin_tiers", label: "Margin Tiers", placeholder: "Document base and performance margin levels" },
    ],
    pricingModels: [
      "Tiered discount off list",
      "Bundle-based pricing",
      "Subscription revenue share",
    ],
    timelineSuggestions: [
      "Monthly pipeline review",
      "Quarterly certification refresh",
      "Annual program renewal",
    ],
    responsibilitySuggestions: [
      "Reseller maintains certified specialists for key product lines",
      "Vendor delivers quarterly product roadmap briefings",
      "Shared escalation matrix for end-customer incidents",
    ],
    attachmentsHint: "Provide playbooks, brand assets, or certification rubrics.",
    clausesHint: "Include territory overlaps, lead distribution rules, and exclusivity terms.",
    aiBrief:
      "Produce a reseller program outline covering enablement, deal support, compensation, and service expectations.",
    kpis: [
      {
        id: "pipeline_created",
        label: "Pipeline Created",
        metric: "Qualified pipeline sourced per quarter",
        description: "Evaluates top-of-funnel health created by reseller efforts.",
        defaultTarget: "$300k",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "win_rate",
        label: "Win Rate",
        metric: "Closed-won deals vs registered opportunities",
        description: "Measures effectiveness of reseller sales motions.",
        defaultTarget: "≥ 35%",
        frequency: "quarterly",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
      {
        id: "customer_satisfaction",
        label: "Customer Satisfaction",
        metric: "Average post-sale satisfaction score",
        description: "Captures end-client sentiment on reseller delivery.",
        defaultTarget: "≥ 4.3/5",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: false,
      },
    ],
    requiresTracking: true,
    icon: ShoppingBag,
  },
  strategic_alliance: {
    id: "strategic_alliance",
    name: "Strategic Alliance",
    summary:
      "Coordinate joint initiatives, innovation roadmaps, and executive governance between aligned organizations.",
    outcomes: [
      "Shared innovation roadmap",
      "Executive steering cadence",
      "Mutually funded strategic initiatives",
    ],
    templates: [
      {
        id: "mission_alignment",
        title: "Alliance Mission",
        defaultContent:
          "Describe the shared vision, market thesis, and strategic objectives underpinning the alliance.",
      },
      {
        id: "governance",
        title: "Governance & Operating Rhythm",
        defaultContent:
          "Outline steering committees, workstreams, decision rights, and cadences for reviews.",
      },
      {
        id: "initiative_portfolio",
        title: "Joint Initiative Portfolio",
        defaultContent:
          "List prioritized projects, investment levels, owners, and success criteria.",
      },
      {
        id: "value_realization",
        title: "Value Realization",
        defaultContent:
          "Summarize benefits for each party, including revenue uplift, capability enhancement, or market entry.",
      },
    ],
    deliverableFields: [
      { id: "joint_projects", label: "Joint Projects", placeholder: "Detail co-funded or co-led initiatives" },
      { id: "governance_cadence", label: "Governance Cadence", placeholder: "Define steering meetings and reporting" },
      { id: "innovation_backlog", label: "Innovation Backlog", placeholder: "List experiments or pilots" },
    ],
    pricingModels: [
      "Shared investment pool",
      "Cost sharing with benefit split",
      "Milestone-based funding releases",
    ],
    timelineSuggestions: [
      "Bi-annual strategic summit",
      "Quarterly portfolio review",
      "Monthly workstream checkpoints",
    ],
    responsibilitySuggestions: [
      "Each party designates executive sponsor and alliance lead",
      "Shared reporting pack prepared ahead of steering meetings",
      "Joint marketing statements approved through governance board",
    ],
    attachmentsHint: "Link to strategy decks, governance charters, or initiative roadmaps.",
    clausesHint: "Cover IP ownership, confidentiality, and exit transitions.",
    aiBrief:
      "Draft a strategic alliance overview capturing mission alignment, governance rhythm, joint initiatives, and value creation.",
    kpis: [
      {
        id: "joint_revenue",
        label: "Joint Revenue",
        metric: "Revenue attributed to alliance initiatives",
        description: "Quantifies commercial impact of collaborative programs.",
        defaultTarget: "$5M annually",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "initiative_velocity",
        label: "Initiative Velocity",
        metric: "% of initiatives on-track vs plan",
        description: "Measures execution health across portfolio milestones.",
        defaultTarget: "≥ 85% on-track",
        frequency: "monthly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "executive_engagement",
        label: "Executive Engagement",
        metric: "Attendance rate at steering sessions",
        description: "Ensures ongoing alignment and sponsorship.",
        defaultTarget: "≥ 90%",
        frequency: "monthly",
        trackingModes: ["manual"],
        requiresTracking: false,
      },
    ],
    requiresTracking: true,
    icon: Users,
  },
  marketing: {
    id: "marketing",
    name: "Marketing",
    summary:
      "Plan co-marketing campaigns, shared creative assets, and lead management between partners.",
    outcomes: [
      "Coordinated campaign execution",
      "Shared creative and messaging assets",
      "Measurable pipeline impact",
    ],
    templates: [
      {
        id: "campaign_overview",
        title: "Campaign Overview",
        defaultContent:
          "Describe campaign theme, target audience, and channels to be utilized.",
      },
      {
        id: "content_plan",
        title: "Content & Creative Plan",
        defaultContent:
          "List assets, landing pages, and creative responsibilities for each partner.",
      },
      {
        id: "lead_management",
        title: "Lead Management & Nurture",
        defaultContent:
          "Define lead capture, routing logic, follow-up SLAs, and shared CRM visibility.",
      },
      {
        id: "measurement",
        title: "Measurement & Optimization",
        defaultContent:
          "Outline KPIs, reporting cadence, and optimization feedback loops.",
      },
    ],
    deliverableFields: [
      { id: "campaign_assets", label: "Campaign Assets", placeholder: "List webinars, ebooks, ads, etc." },
      { id: "audience_segments", label: "Audience Segments", placeholder: "Define personas, industries, or accounts" },
      { id: "lead_routing", label: "Lead Routing Rules", placeholder: "Describe how leads are assigned" },
    ],
    pricingModels: [
      "Co-funded budget split",
      "Performance-based cost share",
      "In-kind media swaps",
    ],
    timelineSuggestions: [
      "Campaign launch timeline with creative deadlines",
      "Weekly performance sync",
      "Post-campaign retrospective",
    ],
    responsibilitySuggestions: [
      "Partner A manages creative production, Partner B handles media buys",
      "Shared dashboard updated weekly",
      "Sales enablement distributed two weeks before launch",
    ],
    attachmentsHint: "Upload creative briefs, media plans, or shared dashboards.",
    clausesHint: "Include brand approval processes, data usage rights, and lead sharing terms.",
    aiBrief:
      "Compose a co-marketing partnership summary covering campaign goals, assets, lead flows, and measurement cadence.",
    kpis: [
      {
        id: "campaign_roi",
        label: "Campaign ROI",
        metric: "Return on marketing investment",
        description: "Evaluates profitability of joint marketing spend.",
        defaultTarget: "> 250%",
        frequency: "campaign",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
      {
        id: "leads_generated",
        label: "Leads Generated",
        metric: "Qualified leads captured per campaign",
        description: "Measures demand creation effectiveness.",
        defaultTarget: "300 qualified leads",
        frequency: "campaign",
        trackingModes: ["automatic"],
        requiresTracking: true,
      },
      {
        id: "engagement_rate",
        label: "Engagement Rate",
        metric: "Average engagement across channels",
        description: "Monitors audience interaction with joint assets.",
        defaultTarget: "≥ 45% webinar attendance",
        frequency: "campaign",
        trackingModes: ["manual"],
        requiresTracking: false,
      },
    ],
    requiresTracking: true,
    icon: Megaphone,
  },
  technology_integration: {
    id: "technology_integration",
    name: "Technology / Integration",
    summary:
      "Align product roadmaps, integration scope, and joint support for technology ecosystems.",
    outcomes: [
      "Seamless product integration",
      "Shared go-to-market messaging",
      "Coordinated support experience",
    ],
    templates: [
      {
        id: "integration_scope",
        title: "Integration Scope",
        defaultContent:
          "Define use cases, APIs involved, data flows, and technical success criteria.",
      },
      {
        id: "joint_roadmap",
        title: "Joint Roadmap",
        defaultContent:
          "Capture integration milestones, shared features, and dependency management.",
      },
      {
        id: "support_model",
        title: "Support Model",
        defaultContent:
          "Clarify tiered support responsibilities, escalation paths, and status page sharing.",
      },
      {
        id: "security_compliance",
        title: "Security & Compliance",
        defaultContent:
          "Summarize data protection measures, certifications, and audit collaboration.",
      },
    ],
    deliverableFields: [
      { id: "use_cases", label: "Primary Use Cases", placeholder: "List core integration scenarios" },
      { id: "api_endpoints", label: "API Endpoints", placeholder: "Document APIs and versions leveraged" },
      { id: "joint_support", label: "Joint Support", placeholder: "Describe shared support workflows" },
    ],
    pricingModels: [
      "Revenue share on activated integrations",
      "Marketplace listing fees",
      "Co-selling incentives",
    ],
    timelineSuggestions: [
      "Integration beta period",
      "General availability launch",
      "Maintenance release cadence",
    ],
    responsibilitySuggestions: [
      "Each party maintains SDKs or connectors they publish",
      "Joint security review every six months",
      "Shared status communication for incidents affecting integration",
    ],
    attachmentsHint: "Reference architecture diagrams, API specs, or certification checklists.",
    clausesHint: "Document data ownership, SLA alignment, and roadmap change notice periods.",
    aiBrief:
      "Create a technology partnership brief covering integration scope, joint roadmap, support model, and compliance alignment.",
    kpis: [
      {
        id: "user_adoption",
        label: "User Adoption",
        metric: "Active accounts using the integration",
        description: "Measures uptake of the integrated solution.",
        defaultTarget: "1,000 active accounts",
        frequency: "monthly",
        trackingModes: ["automatic"],
        requiresTracking: true,
      },
      {
        id: "integration_uptime",
        label: "Integration Uptime",
        metric: "Availability percentage of joint integration endpoints",
        description: "Ensures reliability across shared touchpoints.",
        defaultTarget: "≥ 99.5%",
        frequency: "monthly",
        trackingModes: ["automatic"],
        requiresTracking: true,
      },
      {
        id: "support_tickets",
        label: "Joint Support Tickets",
        metric: "Tickets per 1,000 active users",
        description: "Tracks support burden and quality of integration experience.",
        defaultTarget: "≤ 5",
        frequency: "monthly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
    ],
    requiresTracking: true,
    icon: Cpu,
  },
  referral: {
    id: "referral",
    name: "Referral",
    summary:
      "Coordinate referral incentives, qualification criteria, and attribution processes between organizations.",
    outcomes: [
      "Predictable lead referrals",
      "Fair attribution and payout cycles",
      "Consistent feedback loops on conversion quality",
    ],
    templates: [
      {
        id: "program_overview",
        title: "Program Overview",
        defaultContent:
          "Define referral sources, qualification requirements, and ideal customer profile.",
      },
      {
        id: "submission_process",
        title: "Submission Process",
        defaultContent:
          "Describe how referrals are submitted, tracked, and acknowledged.",
      },
      {
        id: "compensation",
        title: "Compensation",
        defaultContent:
          "Outline payout structures, timing, and scenarios (closed-won, subscription milestones, etc.).",
      },
      {
        id: "feedback",
        title: "Feedback & Reporting",
        defaultContent:
          "Set expectations for referral status updates, conversion reporting, and qualitative feedback.",
      },
    ],
    deliverableFields: [
      { id: "referral_channels", label: "Referral Channels", placeholder: "List communities, partners, or customer bases" },
      { id: "qualification_rules", label: "Qualification Rules", placeholder: "Define industry, size, or solution fit" },
      { id: "payout_terms", label: "Payout Terms", placeholder: "Explain commission or reward timing" },
    ],
    pricingModels: [
      "Flat bounty per qualified referral",
      "Tiered commission based on deal size",
      "Revenue share for subscription lifetime",
    ],
    timelineSuggestions: [
      "Monthly referral review",
      "Quarterly incentive refresh",
      "Annual program optimization",
    ],
    responsibilitySuggestions: [
      "Referring partner submits leads within shared CRM or portal",
      "Receiving partner acknowledges and updates status within 3 business days",
      "Joint feedback loop meeting monthly",
    ],
    attachmentsHint: "Share referral portal guide, incentive tables, or qualification checklists.",
    clausesHint: "Document non-solicitation, customer ownership, and confidentiality agreements.",
    aiBrief:
      "Outline a referral partnership covering submission process, qualification rules, incentives, and reporting cadence.",
    kpis: [
      {
        id: "referrals_submitted",
        label: "Referrals Submitted",
        metric: "Qualified referrals per month",
        description: "Tracks volume flowing through the program.",
        defaultTarget: "20 per month",
        frequency: "monthly",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
      {
        id: "conversion_rate",
        label: "Conversion Rate",
        metric: "Closed-won referrals vs submitted",
        description: "Measures quality and fit of referred opportunities.",
        defaultTarget: "≥ 25%",
        frequency: "monthly",
        trackingModes: ["automatic"],
        requiresTracking: true,
      },
      {
        id: "payout_accuracy",
        label: "Payout Accuracy",
        metric: "On-time payouts vs due",
        description: "Ensures financial alignment on incentives.",
        defaultTarget: "100% on time",
        frequency: "monthly",
        trackingModes: ["manual"],
        requiresTracking: false,
      },
    ],
    requiresTracking: true,
    icon: Share2,
  },
  investment: {
    id: "investment",
    name: "Investment / Funding",
    summary:
      "Clarify funding tranches, governance, and milestone expectations for investment-driven partnerships.",
    outcomes: [
      "Shared growth milestones",
      "Structured governance oversight",
      "Transparent reporting on capital deployment",
    ],
    templates: [
      {
        id: "investment_thesis",
        title: "Investment Thesis",
        defaultContent:
          "Outline strategic rationale, market opportunity, and value creation plan.",
      },
      {
        id: "capital_structure",
        title: "Capital Structure & Use",
        defaultContent:
          "Detail investment size, instrument type, and planned allocation of funds.",
      },
      {
        id: "milestones",
        title: "Milestones",
        defaultContent:
          "List product, revenue, or operational milestones tied to funding tranches.",
      },
      {
        id: "governance",
        title: "Governance",
        defaultContent:
          "Describe board composition, reporting cadence, and information rights.",
      },
    ],
    deliverableFields: [
      { id: "funding_use", label: "Use of Funds", placeholder: "Break down allocation across initiatives" },
      { id: "milestone_plan", label: "Milestone Plan", placeholder: "Define KPI-based unlocks" },
      { id: "reporting_package", label: "Reporting Package", placeholder: "Outline monthly or quarterly reports" },
    ],
    pricingModels: [
      "Equity with valuation milestones",
      "Convertible note",
      "Revenue-based financing",
    ],
    timelineSuggestions: [
      "Funding tranche schedule",
      "Board meeting cadence",
      "Milestone review checkpoints",
    ],
    responsibilitySuggestions: [
      "Portfolio company delivers board materials 5 days before meeting",
      "Investor provides strategic introductions quarterly",
      "Joint scenario planning annually",
    ],
    attachmentsHint: "Add term sheets, cap tables, or financial models.",
    clausesHint: "Include liquidation preferences, covenants, and information rights.",
    aiBrief:
      "Summarize an investment partnership detailing thesis, capital use, milestones, and governance.",
    kpis: [
      {
        id: "revenue_growth",
        label: "Revenue Growth",
        metric: "Quarter-over-quarter revenue increase",
        description: "Monitors business performance against investment goals.",
        defaultTarget: "≥ 15% QoQ",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "burn_multiple",
        label: "Burn Multiple",
        metric: "Net burn / net new ARR",
        description: "Evaluates capital efficiency post-investment.",
        defaultTarget: "< 1.5",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "milestone_completion",
        label: "Milestone Completion",
        metric: "% of milestones hit vs plan",
        description: "Ensures execution aligns with funding tranches.",
        defaultTarget: "≥ 90%",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
    ],
    requiresTracking: true,
    icon: Coins,
  },
  licensing: {
    id: "licensing",
    name: "Licensing",
    summary:
      "Define IP usage rights, royalty structures, and compliance obligations for licensing partnerships.",
    outcomes: [
      "Clear IP scope and exclusivity",
      "Predictable royalty mechanics",
      "Enforced brand standards",
    ],
    templates: [
      {
        id: "licensed_assets",
        title: "Licensed Assets",
        defaultContent:
          "Describe intellectual property, trademarks, or technology included in the license.",
      },
      {
        id: "usage_rights",
        title: "Usage Rights",
        defaultContent:
          "Clarify territories, channels, and exclusivity levels granted.",
      },
      {
        id: "royalty_model",
        title: "Royalty Model",
        defaultContent:
          "Explain royalty rates, reporting cadence, and audit rights.",
      },
      {
        id: "compliance",
        title: "Compliance & Brand Standards",
        defaultContent:
          "Detail quality requirements, brand guidelines, and enforcement processes.",
      },
    ],
    deliverableFields: [
      { id: "ip_catalog", label: "IP Catalog", placeholder: "List patents, trademarks, or content" },
      { id: "usage_restrictions", label: "Usage Restrictions", placeholder: "Define forbidden uses or sub-licensing rules" },
      { id: "reporting_process", label: "Reporting Process", placeholder: "Describe royalty statement cadence and format" },
    ],
    pricingModels: [
      "Upfront license fee plus royalty",
      "Minimum guarantee with royalty",
      "Usage-based royalty only",
    ],
    timelineSuggestions: [
      "Royalty reporting deadlines",
      "Annual compliance audit",
      "License renewal window",
    ],
    responsibilitySuggestions: [
      "Licensee submits quarterly sales reports",
      "Licensor conducts annual brand compliance review",
      "Joint legal review ahead of renewals",
    ],
    attachmentsHint: "Add brand guidelines, IP registries, or product specifications.",
    clausesHint: "Include indemnification, audit rights, and renewal terms.",
    aiBrief:
      "Produce a licensing agreement summary including assets, usage rights, royalty model, and compliance expectations.",
    kpis: [
      {
        id: "royalty_compliance",
        label: "Royalty Compliance",
        metric: "On-time royalty report submissions",
        description: "Ensures payment timeliness and accuracy.",
        defaultTarget: "100%",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "brand_compliance",
        label: "Brand Compliance",
        metric: "Issues found per audit",
        description: "Tracks adherence to brand standards.",
        defaultTarget: "0 major issues",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "license_revenue",
        label: "License Revenue",
        metric: "Revenue generated from licensed products",
        description: "Measures financial performance of the license.",
        defaultTarget: "$1M annually",
        frequency: "quarterly",
        trackingModes: ["automatic"],
        requiresTracking: true,
      },
    ],
    requiresTracking: true,
    icon: Stamp,
  },
  joint_venture: {
    id: "joint_venture",
    name: "Joint Venture",
    summary:
      "Structure shared ownership vehicles, capital contributions, and operating models for joint ventures.",
    outcomes: [
      "Defined ownership and profit allocation",
      "Clear governance and management structure",
      "Integrated operating plan",
    ],
    templates: [
      {
        id: "venture_purpose",
        title: "Venture Purpose & Scope",
        defaultContent:
          "Explain the joint venture's mission, products/services, and market focus.",
      },
      {
        id: "capital_structure",
        title: "Capital Contributions",
        defaultContent:
          "Detail each party's capital, assets, or IP contributions and valuation.",
      },
      {
        id: "operating_model",
        title: "Operating Model",
        defaultContent:
          "Describe management team, shared services, and decision rights.",
      },
      {
        id: "profit_sharing",
        title: "Profit & Loss Sharing",
        defaultContent:
          "Outline profit distribution, reinvestment policies, and financial controls.",
      },
    ],
    deliverableFields: [
      { id: "contributions", label: "Contributions", placeholder: "List cash, assets, or IP contributed" },
      { id: "governance_board", label: "Governance Board", placeholder: "Define board composition and voting" },
      { id: "operating_plan", label: "Operating Plan", placeholder: "Summarize staffing, systems, and execution plan" },
    ],
    pricingModels: [
      "Equity ownership split",
      "Profit share against investment",
      "Managed services fee",
    ],
    timelineSuggestions: [
      "JV launch milestones",
      "Quarterly operating reviews",
      "Annual strategic reset",
    ],
    responsibilitySuggestions: [
      "Joint venture CEO appointed jointly",
      "Shared finance and compliance teams",
      "Annual audit cycle with both parent companies",
    ],
    attachmentsHint: "Attach shareholder agreements, capitalization tables, or operating budgets.",
    clausesHint: "Include buy-sell provisions, deadlock resolution, and dissolution terms.",
    aiBrief:
      "Draft a joint venture overview covering purpose, capital structure, operating model, and profit allocation.",
    kpis: [
      {
        id: "profitability",
        label: "Profitability",
        metric: "Net profit margin of the JV",
        description: "Tracks joint venture financial health.",
        defaultTarget: "≥ 18%",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "cash_contribution",
        label: "Capital Efficiency",
        metric: "Return on invested capital",
        description: "Ensures capital is deployed effectively.",
        defaultTarget: "> 1.8x",
        frequency: "annual",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "governance_compliance",
        label: "Governance Compliance",
        metric: "On-time submission of governance reports",
        description: "Maintains alignment with shareholder agreements.",
        defaultTarget: "100%",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: false,
      },
    ],
    requiresTracking: true,
    icon: Handshake,
  },
  service: {
    id: "service",
    name: "Service",
    summary:
      "Coordinate service delivery partnerships with clarity on SLAs, escalation, and customer experience.",
    outcomes: [
      "Reliable service delivery",
      "Documented escalation workflows",
      "Aligned customer satisfaction targets",
    ],
    templates: [
      {
        id: "service_scope",
        title: "Service Scope",
        defaultContent:
          "Define services provided, coverage hours, and service boundaries.",
      },
      {
        id: "sla",
        title: "Service Level Agreements",
        defaultContent:
          "Detail response times, resolution targets, and compensation for misses.",
      },
      {
        id: "escalation",
        title: "Escalation & Communication",
        defaultContent:
          "Summarize escalation tiers, communication channels, and stakeholder contacts.",
      },
      {
        id: "continuous_improvement",
        title: "Continuous Improvement",
        defaultContent:
          "Outline feedback loops, service reviews, and optimization initiatives.",
      },
    ],
    deliverableFields: [
      { id: "service_catalog", label: "Service Catalog", placeholder: "List included services or packages" },
      { id: "sla_metrics", label: "SLA Metrics", placeholder: "Document key response/resolution targets" },
      { id: "success_criteria", label: "Success Criteria", placeholder: "Define satisfaction or uptime goals" },
    ],
    pricingModels: [
      "Retainer-based pricing",
      "Usage/hourly billing",
      "Outcome-based fee",
    ],
    timelineSuggestions: [
      "Service launch checklist",
      "Monthly operational review",
      "Quarterly improvement workshop",
    ],
    responsibilitySuggestions: [
      "Service provider maintains knowledge base",
      "Client supplies access and context for escalations",
      "Joint CSAT survey every quarter",
    ],
    attachmentsHint: "Upload runbooks, service catalogs, or escalation matrices.",
    clausesHint: "Add liability limits, data handling requirements, and service credits.",
    aiBrief:
      "Create a service partnership summary covering scope, SLAs, escalation, and improvement plans.",
    kpis: [
      {
        id: "sla_attainment",
        label: "SLA Attainment",
        metric: "% of incidents resolved within SLA",
        description: "Validates service responsiveness.",
        defaultTarget: "≥ 95%",
        frequency: "monthly",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
      {
        id: "customer_csatscore",
        label: "Customer Satisfaction",
        metric: "Average CSAT score",
        description: "Captures end-user satisfaction with service delivery.",
        defaultTarget: "≥ 4.5/5",
        frequency: "monthly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "incident_volume",
        label: "Incident Volume",
        metric: "Incidents per 1000 users",
        description: "Helps track workload and proactive improvements.",
        defaultTarget: "< 8",
        frequency: "monthly",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
    ],
    requiresTracking: true,
    icon: Truck,
  },
  channel_expansion: {
    id: "channel_expansion",
    name: "Distribution Channel Expansion",
    summary:
      "Launch into new distribution channels with aligned merchandising, training, and inventory plans.",
    outcomes: [
      "Presence in new retail or digital channels",
      "Partner-enabled merchandising",
      "Synchronized inventory availability",
    ],
    templates: [
      {
        id: "channel_strategy",
        title: "Channel Strategy",
        defaultContent:
          "Describe new channel goals, target customer segments, and positioning.",
      },
      {
        id: "launch_plan",
        title: "Launch Plan",
        defaultContent:
          "Detail merchandising, promotions, and training needed for launch.",
      },
      {
        id: "inventory_plan",
        title: "Inventory & Operations",
        defaultContent:
          "Outline inventory allocation, replenishment cadence, and logistics coordination.",
      },
      {
        id: "performance_management",
        title: "Performance Management",
        defaultContent:
          "Define dashboards, review cadence, and optimization levers for the channel.",
      },
    ],
    deliverableFields: [
      { id: "channel_targets", label: "Channel Targets", placeholder: "Set sales or footfall targets" },
      { id: "launch_assets", label: "Launch Assets", placeholder: "List signage, training, digital assets" },
      { id: "inventory_mix", label: "Inventory Mix", placeholder: "Describe SKUs and allocation plan" },
    ],
    pricingModels: [
      "Channel margin incentives",
      "Sell-in with promotional rebates",
      "Joint marketing fund",
    ],
    timelineSuggestions: [
      "Store or channel launch timeline",
      "Weekly launch performance standup",
      "Post-launch optimization window",
    ],
    responsibilitySuggestions: [
      "Channel partner briefs store staff before launch",
      "Brand supplies merchandising kits two weeks prior",
      "Joint sales review after first 30 days",
    ],
    attachmentsHint: "Include planograms, merchandising guides, or training decks.",
    clausesHint: "Add channel exclusivity periods, rollback rights, and promotional obligations.",
    aiBrief:
      "Summarize a channel expansion plan covering strategy, launch activities, inventory coordination, and performance management.",
    kpis: [
      {
        id: "sell_out",
        label: "Sell-out Velocity",
        metric: "Units sold per store per week",
        description: "Indicates channel traction post-launch.",
        defaultTarget: "15 units/store/week",
        frequency: "weekly",
        trackingModes: ["automatic"],
        requiresTracking: true,
      },
      {
        id: "display_compliance",
        label: "Display Compliance",
        metric: "Stores adhering to merchandising plan",
        description: "Ensures brand experience consistency.",
        defaultTarget: "≥ 90%",
        frequency: "monthly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "training_completion",
        label: "Training Completion",
        metric: "Staff trained per location",
        description: "Confirms readiness of channel partner teams.",
        defaultTarget: "100% before launch",
        frequency: "campaign",
        trackingModes: ["manual"],
        requiresTracking: false,
      },
    ],
    requiresTracking: true,
    icon: Layers,
  },
  co_branding: {
    id: "co_branding",
    name: "Co-Branding / Product Collaboration",
    summary:
      "Co-develop products or experiences with shared branding, launch plans, and ownership of IP.",
    outcomes: [
      "Collaborative product roadmap",
      "Clear brand expression",
      "Shared launch and support operations",
    ],
    templates: [
      {
        id: "concept",
        title: "Concept & Audience",
        defaultContent:
          "Describe co-branded product concept, target audience, and brand positioning.",
      },
      {
        id: "development",
        title: "Development & IP",
        defaultContent:
          "Detail design responsibilities, prototyping cadence, and IP ownership.",
      },
      {
        id: "launch_plan",
        title: "Launch Plan",
        defaultContent:
          "Outline go-to-market strategy, distribution, and marketing tactics.",
      },
      {
        id: "support",
        title: "Post-launch Support",
        defaultContent:
          "Clarify customer support ownership, warranty terms, and product updates.",
      },
    ],
    deliverableFields: [
      { id: "product_features", label: "Product Features", placeholder: "List hero features or differentiators" },
      { id: "brand_assets", label: "Brand Assets", placeholder: "Define logos, colors, messaging usage" },
      { id: "launch_channels", label: "Launch Channels", placeholder: "Specify e-commerce, retail, events" },
    ],
    pricingModels: [
      "Revenue split on sales",
      "Minimum guarantee with upside share",
      "Licensing fee plus profit share",
    ],
    timelineSuggestions: [
      "Product development milestones",
      "Launch readiness checkpoints",
      "Post-launch analytics review",
    ],
    responsibilitySuggestions: [
      "Design teams co-author creative briefs",
      "Joint PR approvals before announcements",
      "Shared product roadmap review quarterly",
    ],
    attachmentsHint: "Attach mood boards, product specs, or brand playbooks.",
    clausesHint: "Include IP ownership, brand usage limits, and co-marketing obligations.",
    aiBrief:
      "Write a co-branding proposal covering concept, development responsibilities, launch plan, and support.",
    kpis: [
      {
        id: "units_sold",
        label: "Units Sold",
        metric: "Units sold per launch phase",
        description: "Tracks commercial performance of the collaboration.",
        defaultTarget: "50k units in 90 days",
        frequency: "campaign",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
      {
        id: "brand_lift",
        label: "Brand Lift",
        metric: "Change in brand awareness or affinity",
        description: "Assesses perception gains from collaboration.",
        defaultTarget: "+10% awareness",
        frequency: "campaign",
        trackingModes: ["manual"],
        requiresTracking: false,
      },
      {
        id: "support_tickets",
        label: "Support Volume",
        metric: "Tickets per 1,000 units",
        description: "Ensures product experience quality post-launch.",
        defaultTarget: "< 12",
        frequency: "monthly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
    ],
    requiresTracking: true,
    icon: Sparkles,
  },
  loyalty: {
    id: "loyalty",
    name: "Loyalty / Rewards",
    summary:
      "Align loyalty program mechanics, point economics, and cross-promotion activities.",
    outcomes: [
      "Integrated earning and redemption experience",
      "Balanced economics for both brands",
      "Consistent customer engagement",
    ],
    templates: [
      {
        id: "program_design",
        title: "Program Design",
        defaultContent:
          "Describe tiers, earning mechanisms, and redemption catalog.",
      },
      {
        id: "economics",
        title: "Point Economics",
        defaultContent:
          "Detail point valuation, settlement, and liability accounting.",
      },
      {
        id: "customer_journey",
        title: "Customer Journey",
        defaultContent:
          "Map acquisition, engagement, and retention touchpoints.",
      },
      {
        id: "analytics",
        title: "Analytics & Insights",
        defaultContent:
          "Outline dashboards, data sharing, and optimization cycles.",
      },
    ],
    deliverableFields: [
      { id: "earning_rules", label: "Earning Rules", placeholder: "Explain how customers earn points" },
      { id: "redemption_options", label: "Redemption Options", placeholder: "List rewards or partner offers" },
      { id: "promotion_calendar", label: "Promotion Calendar", placeholder: "Describe seasonal or launch promos" },
    ],
    pricingModels: [
      "Point liability sharing",
      "Funded promotions",
      "Breakage-based revenue share",
    ],
    timelineSuggestions: [
      "Program integration schedule",
      "Monthly performance sync",
      "Quarterly loyalty campaign planning",
    ],
    responsibilitySuggestions: [
      "Partners share enrollment data weekly",
      "Support teams align on redemption issues",
      "Joint analytics review monthly",
    ],
    attachmentsHint: "Share program rules, customer comms templates, or API docs.",
    clausesHint: "Include data privacy terms, liability allocation, and settlement timelines.",
    aiBrief:
      "Generate a loyalty partnership summary covering program design, economics, journey, and analytics.",
    kpis: [
      {
        id: "member_growth",
        label: "Member Growth",
        metric: "Net new members per month",
        description: "Tracks adoption of the joint loyalty program.",
        defaultTarget: "5,000",
        frequency: "monthly",
        trackingModes: ["automatic"],
        requiresTracking: true,
      },
      {
        id: "redemption_rate",
        label: "Redemption Rate",
        metric: "% of issued points redeemed",
        description: "Indicates engagement quality and economics balance.",
        defaultTarget: "25%",
        frequency: "monthly",
        trackingModes: ["automatic", "manual"],
        requiresTracking: true,
      },
      {
        id: "program_roi",
        label: "Program ROI",
        metric: "Revenue generated vs program cost",
        description: "Measures profitability of the loyalty partnership.",
        defaultTarget: "> 180%",
        frequency: "quarterly",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
    ],
    requiresTracking: true,
    icon: Gift,
  },
  education: {
    id: "education",
    name: "Educational / Training",
    summary:
      "Collaborate on training programs, certification paths, and educational content for customers or staff.",
    outcomes: [
      "Standardized curriculum delivery",
      "Certified practitioners or users",
      "Measurable learning outcomes",
    ],
    templates: [
      {
        id: "curriculum",
        title: "Curriculum Overview",
        defaultContent:
          "Outline learning objectives, modules, and required prerequisites.",
      },
      {
        id: "delivery_model",
        title: "Delivery Model",
        defaultContent:
          "Describe in-person, virtual, or blended delivery, including facilitators and tooling.",
      },
      {
        id: "assessment",
        title: "Assessment & Certification",
        defaultContent:
          "Detail exams, practical evaluations, and certification issuance.",
      },
      {
        id: "outcomes",
        title: "Outcomes & Support",
        defaultContent:
          "Summarize learner support, post-training follow-up, and ROI measurement.",
      },
    ],
    deliverableFields: [
      { id: "modules", label: "Training Modules", placeholder: "List modules and key takeaways" },
      { id: "delivery_schedule", label: "Delivery Schedule", placeholder: "Define dates, cadence, and formats" },
      { id: "certification", label: "Certification Path", placeholder: "Explain exams, badges, or continuing education" },
    ],
    pricingModels: [
      "Per learner fee",
      "Program sponsorship",
      "Shared revenue from certifications",
    ],
    timelineSuggestions: [
      "Cohort launch plan",
      "Mid-program review",
      "Post-program impact assessment",
    ],
    responsibilitySuggestions: [
      "Training partner delivers instructors and course materials",
      "Host organization recruits learners and manages logistics",
      "Joint feedback survey and Continuous improvement plan",
    ],
    attachmentsHint: "Attach syllabus, facilitator bios, or certification rubrics.",
    clausesHint: "Include learner data privacy, accreditation standards, and cancellation policies.",
    aiBrief:
      "Summarize an education partnership outlining curriculum, delivery, assessment, and learner outcomes.",
    kpis: [
      {
        id: "learner_completion",
        label: "Learner Completion",
        metric: "% of enrolled learners completing program",
        description: "Ensures participants finish the training.",
        defaultTarget: "≥ 85%",
        frequency: "campaign",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "certification_rate",
        label: "Certification Rate",
        metric: "% achieving certification",
        description: "Tracks attainment of learning goals.",
        defaultTarget: "≥ 70%",
        frequency: "campaign",
        trackingModes: ["manual"],
        requiresTracking: true,
      },
      {
        id: "participant_nps",
        label: "Participant NPS",
        metric: "Net promoter score of learners",
        description: "Measures satisfaction and advocacy post-training.",
        defaultTarget: "> 40",
        frequency: "campaign",
        trackingModes: ["manual"],
        requiresTracking: false,
      },
    ],
    requiresTracking: true,
    icon: GraduationCap,
  },
};

export const PARTNERSHIP_TYPE_OPTIONS = Object.values(PARTNERSHIP_TYPES).map(
  (config) => ({
    id: config.id,
    name: config.name,
    summary: config.summary,
    icon: config.icon,
  }),
);

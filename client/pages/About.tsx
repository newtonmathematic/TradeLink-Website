import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  Target,
  Lightbulb,
  Handshake,
  ShieldCheck,
  Rocket,
  Globe,
  Gauge,
  Sparkles,
  Search,
  Link2,
} from "lucide-react";
import { Link } from "react-router-dom";

function ValueItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function StepItem({
  step,
  title,
  description,
  icon: Icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Step {step}</p>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function About() {
  return (
    <div className="py-16">
      {/* Hero */}
      <Card className="border-0 shadow-sm max-w-5xl mx-auto">
        <CardContent className="p-12">
          <div className="text-center">
            <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About TradeLink
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              We're building the future of business partnerships. Our platform
              connects businesses to create mutually beneficial relationships
              that drive growth and success.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/signup">Join Our Mission</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-600" />
              <CardTitle>Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-gray-600">
            We enable organizations to discover, evaluate, and launch
            partnerships faster. By aligning incentives and providing the
            infrastructure for collaboration, we help every partnership start
            strong and scale sustainably.
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-amber-500" />
              <CardTitle>Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-gray-600">
            A world where businesses grow together. We envision an open network
            where trust, transparency, and shared value are the default for
            cross‑company collaboration.
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="max-w-6xl mx-auto mt-12">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Core Values</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueItem
              icon={Handshake}
              title="Mutual Value Creation"
              description="Partnerships should benefit everyone involved. We optimize for outcomes that compound for all parties."
            />
            <ValueItem
              icon={ShieldCheck}
              title="Trust by Design"
              description="Clear agreements, visibility, and governance features ensure accountability from day one."
            />
            <ValueItem
              icon={Sparkles}
              title="Simplicity Wins"
              description="Tools should get out of the way. We streamline workflows so teams can focus on results."
            />
            <ValueItem
              icon={Gauge}
              title="Speed with Rigor"
              description="Move fast without cutting corners. Decisions are data‑informed and execution is disciplined."
            />
            <ValueItem
              icon={Globe}
              title="Open Collaboration"
              description="Great opportunities can come from anywhere. We foster a diverse, global partner ecosystem."
            />
            <ValueItem
              icon={Rocket}
              title="Outcomes Over Outputs"
              description="We measure success by measurable impact—revenue, reach, and lasting relationships."
            />
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <div className="max-w-6xl mx-auto mt-12">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StepItem
                step={1}
                title="Discover Partners"
                description="Explore the network by industry, capabilities, geography, and goals to find the right strategic fit."
                icon={Search}
              />
              <StepItem
                step={2}
                title="Match & Align"
                description="Establish shared objectives, define responsibilities, and set milestones with transparent tracking."
                icon={Link2}
              />
              <StepItem
                step={3}
                title="Launch & Grow"
                description="Operate joint initiatives, measure impact, and scale successful collaborations across markets."
                icon={Users}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Countries supported" value="50+" icon={Users} />
        <StatCard
          label="More likely to land partnerships"
          value="5.3x"
          icon={Handshake}
        />
        <StatCard label="Active markets supported" value="12+" icon={Globe} />
        <StatCard
          label="Average time to first deal"
          value="21 days"
          icon={Gauge}
        />
      </div>

      {/* FAQ */}
      <div className="max-w-5xl mx-auto mt-12">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Who is TradeLink for?</AccordionTrigger>
                <AccordionContent>
                  We serve B2B organizations of all sizes—from startups to
                  enterprises—looking to co‑market, co‑sell, integrate, or
                  co‑innovate with strategic partners.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  What kinds of partnerships work well?
                </AccordionTrigger>
                <AccordionContent>
                  Popular motions include reseller and referral agreements,
                  solution partnerships, integrations, marketplace listings, and
                  regional go‑to‑market collaborations.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  How do you ensure partner fit?
                </AccordionTrigger>
                <AccordionContent>
                  Our matching considers goals, customer profiles, capabilities,
                  and track records. Alignment tools make expectations explicit
                  and measurable.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Can we measure outcomes?</AccordionTrigger>
                <AccordionContent>
                  Yes. Built‑in analytics track pipeline, revenue influence,
                  adoption, and milestone progress so you can prove and improve
                  impact.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Closing CTA */}
      <div className="max-w-6xl mx-auto mt-12">
        <Card className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-semibold mb-1">
                  Ready to build your next great partnership?
                </h3>
                <p className="text-white/90">
                  Join the network or talk to our team to explore what's
                  possible.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="bg-transparent text-white border-white hover:bg-white/10"
                >
                  <Link to="/contact">Talk to Us</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

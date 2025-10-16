import { Button } from "@/components/ui/button";
import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GradientText from "@/components/GradientText";
import TextType from "@/components/TextType";
import ShaderBackground from "@/components/ShaderBackground";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Search,
  Handshake,
  BarChart3,
  Shield,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (!revealElements.length) {
      return;
    }

    revealElements.forEach((element) => {
      element.classList.add("will-reveal");
    });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (prefersReducedMotion.matches) {
      revealElements.forEach((element) => {
        element.classList.add("is-revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  const features = [
    {
      icon: Search,
      title: "Discover New Partners",
      description:
        "Find businesses in your area that complement your services and share your values. Our smart matching algorithm connects you with the perfect partners.",
    },
    {
      icon: Handshake,
      title: "Propose and Negotiate Deals",
      description:
        "Create custom partnership proposals and negotiate terms that work for both parties. Our guided wizard makes it easy to structure win-win deals.",
    },
    {
      icon: BarChart3,
      title: "Track Performance & Analytics",
      description:
        "Monitor your partnerships with detailed analytics. See redemptions, ROI, and partner performance to optimize your collaborations.",
    },
    {
      icon: Shield,
      title: "Secure Verification",
      description:
        "Built-in verification tools with QR codes, employee rosters, and secure redemption tracking ensure your partnerships run smoothly.",
    },
    {
      icon: TrendingUp,
      title: "Grow Together",
      description:
        "Scale your business through strategic partnerships. Access new customer bases and create value that benefits everyone involved.",
    },
    {
      icon: Zap,
      title: "Instant Activation",
      description:
        "Activate deals immediately and start seeing results. Our platform handles the complexity while you focus on building relationships.",
    },
  ];

  const howItWorksSteps = [
    {
      title: "Discover & Match",
      description:
        "Turn your partnership strategy into action by pairing with companies that share your audience and objectives.",
      icon: Search,
    },
    {
      title: "Co-create Value",
      description:
        "Align on mutual goals with guided deal workflows, shared workspaces, and transparent approvals.",
      icon: Users,
    },
    {
      title: "Launch & Measure",
      description:
        "Launch partnerships with confidence using automation, shared dashboards, and always-on analytics.",
      icon: TrendingUp,
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 3 active partnerships",
        "Basic discovery tools",
        "Standard verification",
        "Email support",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Plus",
      price: "$29",
      description: "Ideal for growing businesses with multiple partnerships",
      features: [
        "Up to 15 active partnerships",
        "Advanced discovery & filters",
        "QR code verification",
        "Analytics & reporting",
        "Priority support",
        "Custom branding",
      ],
      cta: "Get Plus Plan",
      popular: true,
    },
    {
      name: "Pro",
      price: "$99",
      description: "For enterprises with complex partnership needs",
      features: [
        "Unlimited partnerships",
        "White-label platform",
        "Advanced analytics & exports",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 phone support",
      ],
      cta: "Get Pro Plan",
      popular: false,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden">
        <ShaderBackground />
        <div
          className="absolute inset-0 bg-grid-slate-100 bg-[size:20px_20px] opacity-20"
          aria-hidden
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge
              variant="outline"
              data-reveal
              className="mb-6 bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 hover:bg-blue-100 will-reveal"
            >
              🚀 Connecting Businesses Since 2024
            </Badge>
            <h1
              data-reveal
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight will-reveal"
            >
              Build Partnerships That{" "}
              <GradientText
                colors={["#2563eb", "#7c3aed", "#2563eb", "#7c3aed", "#2563eb"]}
                animationSpeed={3}
                showBorder={false}
                className="inline-block"
              >
                Drive Growth
              </GradientText>
            </h1>
            <p
              data-reveal
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed will-reveal"
            >
              Build valuable and mutual business partnerships. Find the right
              partners, negotiate with ease, and track your success — all in one
              powerful platform.
            </p>
            <div
              data-reveal
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16 will-reveal"
            >
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/signup">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                asChild
              >
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>

            {/* Hero Image/Illustration Placeholder */}
            <div
              data-reveal
              className="relative mx-auto max-w-4xl z-10 will-reveal"
            >
              <div className="aspect-video bg-[url('https://cdn.builder.io/api/v1/image/assets%2F5b07ec5f702f438fa184683aacc2ca77%2Fe29c015c8ed84e7c9a994a30038b6f35')] bg-no-repeat bg-center bg-cover rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center">
                <div className="text-center"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              data-reveal
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 will-reveal"
            >
              Everything you need to build{" "}
              <TextType
                as="span"
                className="text-gradient"
                text={[
                  "successful partnerships",
                  "profitable collaborations",
                  "strategic alliances",
                  "lasting relationships",
                  "trusting growth",
                ]}
                typingSpeed={70}
                deletingSpeed={40}
                pauseDuration={1400}
                showCursor={false}
                style={{ height: "59px" }}
              />
            </h2>
            <p
              data-reveal
              className="text-xl text-gray-600 max-w-3xl mx-auto -mt-3 will-reveal"
            >
              Our platform provides all the tools you need to discover,
              negotiate, and manage business partnerships that drive real
              results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                data-reveal
                className="border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-white will-reveal"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span
              data-reveal
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-600 px-4 py-2 text-sm font-medium will-reveal"
            >
              <Zap className="h-4 w-4" /> How TradeLink Works
            </span>
            <h2
              data-reveal
              className="mt-6 text-4xl md:text-5xl font-bold text-gray-900 will-reveal"
            >
              Partnership success in three simple steps
            </h2>
            <p
              data-reveal
              className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto will-reveal"
            >
              From intelligent partner matching to automated deal execution,
              TradeLink keeps every partnership aligned, measurable, and easy to
              maintain.
            </p>
          </div>

          <div className="relative">
            <div className="grid gap-12 lg:gap-8 lg:grid-cols-3">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={step.title}
                  data-reveal
                  className="relative flex flex-col items-center text-center will-reveal"
                >
                  <div className="relative">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                        <step.icon className="h-7 w-7 text-blue-600" />
                      </div>
                    </div>
                    <div className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              data-reveal
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 will-reveal"
            >
              Simple, transparent pricing
            </h2>
            <p
              data-reveal
              className="text-xl text-gray-600 max-w-2xl mx-auto will-reveal"
            >
              Choose the plan that fits your business needs. All plans include
              our core partnership tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                data-reveal
                className={`border-0 shadow-sm relative will-reveal ${
                  plan.popular
                    ? "ring-2 ring-blue-500 bg-white scale-105"
                    : "bg-white"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <CardDescription className="mt-4">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2
            data-reveal
            className="text-4xl md:text-5xl font-bold text-white mb-6 will-reveal"
          >
            Ready to grow your business through partnerships?
          </h2>
          <p
            data-reveal
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto will-reveal"
          >
            Join hundreds of businesses already growing together. Start building
            valuable partnerships today.
          </p>
          <div
            data-reveal
            className="flex flex-col sm:flex-row gap-4 justify-center will-reveal"
          >
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 text-slate-900 border-white hover:bg-white hover:text-blue-600"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
          <p data-reveal className="text-blue-100 text-sm mt-6 will-reveal">
            Secure credit card payment • Instant account activation • Cancel
            anytime
          </p>
        </div>
      </section>
    </div>
  );
}

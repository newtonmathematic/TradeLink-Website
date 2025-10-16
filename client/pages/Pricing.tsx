import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description:
        "Perfect for small businesses getting started with partnerships",
      features: [
        "Up to 3 active partnerships",
        "Basic discovery tools",
        "Standard verification tools",
        "Email support",
        "Basic analytics dashboard",
        "Partnership templates",
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
        "QR code verification system",
        "Detailed analytics & reporting",
        "Priority email support",
        "Custom branding options",
        "Automated reminders",
        "Export capabilities",
      ],
      cta: "Get Plus Plan",
      popular: true,
    },
    {
      name: "Pro",
      price: "$99",
      description: "For enterprises with complex partnership ecosystems",
      features: [
        "Unlimited partnerships",
        "White-label platform access",
        "Advanced analytics & exports",
        "API access & integrations",
        "Dedicated account manager",
        "Custom verification workflows",
        "24/7 phone support",
        "Priority feature requests",
        "Custom onboarding",
      ],
      cta: "Get Pro Plan",
      popular: false,
    },
  ];

  return (
    <div className="py-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Choose the right plan for your business
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Start with our free plan or choose a paid plan for advanced features.
          Paid plans require upfront payment with no hidden fees.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`border-0 shadow-lg relative ${
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
                <CardDescription className="mt-4 text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
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
                  <Link to="/signup">
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Changes take effect
                immediately.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600">
                No setup fees or hidden charges. Pay only for your monthly
                subscription.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                Plus and Pro plans require secure credit card payment
                processing. Free plan requires no payment.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                How long does account activation take?
              </h3>
              <p className="text-gray-600">
                Your account will be activated within 1-2 business days after
                payment confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

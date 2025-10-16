import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Mail,
  Lock,
  Building,
  User,
  CheckCircle,
  Loader2,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EmailVerificationModal } from "@/components/auth/EmailVerificationModal";

export default function Signup() {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState<"free" | "plus" | "pro">(
    "plus",
  );
  const [currentTab, setCurrentTab] = useState("plan");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
    businessLocation: "",
    industry: "",
    companySize: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const plans = [
    {
      id: "free" as const,
      name: "Free",
      price: "$0",
      description: "Perfect for small businesses getting started",
      features: ["Up to 3 partnerships", "Basic discovery", "Email support"],
      requiresPayment: false,
    },
    {
      id: "plus" as const,
      name: "Plus",
      price: "$29",
      description: "Ideal for growing businesses",
      features: [
        "Up to 15 partnerships",
        "Advanced tools",
        "Priority support",
        "Analytics dashboard",
      ],
      popular: true,
      requiresPayment: true,
    },
    {
      id: "pro" as const,
      name: "Pro",
      price: "$99",
      description: "For enterprises with complex needs",
      features: [
        "Unlimited partnerships",
        "White-label platform",
        "Dedicated manager",
        "API access",
      ],
      requiresPayment: true,
    },
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.businessLocation.trim()) {
      newErrors.businessLocation = "Business location is required";
    }

    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    }

    if (!formData.companySize.trim()) {
      newErrors.companySize = "Company size is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signUpWithSupabase = async () => {
    try {
      const planInfo = plans.find((p) => p.id === selectedPlan);
      const requiresPayment = planInfo?.requiresPayment ?? false;
      const initialPlan: "free" | "plus" | "pro" = requiresPayment
        ? "free"
        : selectedPlan;
      const pendingPlan = requiresPayment ? selectedPlan : null;

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            businessName: formData.businessName.trim(),
            businessLocation: formData.businessLocation.trim(),
            industry: formData.industry.trim(),
            companySize: formData.companySize.trim(),
            plan: initialPlan,
            pendingPlan,
          },
          emailRedirectTo: window.location.origin + "/email-verified",
        },
      });

      if (error) {
        return { ok: false, message: error.message };
      }

      const supaUser = data.user;
      if (supaUser) {
        try {
          await fetch("/api/users/sync-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: supaUser.id,
              email: formData.email,
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              businessName: formData.businessName.trim(),
              businessLocation: formData.businessLocation.trim(),
              industry: formData.industry.trim(),
              companySize: formData.companySize.trim(),
              plan: initialPlan,
              pendingPlan,
              createdAt: new Date().toISOString(),
            }),
          });
        } catch {}
      }

      return { ok: true, userId: data.user?.id };
    } catch (e) {
      return { ok: false, message: "Failed to create account" };
    }
  };

  const handleCreateAccount = async () => {
    setSignupError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUpWithSupabase();
      if (result.ok) {
        const planInfo = plans.find((p) => p.id === selectedPlan);
        const requiresPayment = planInfo?.requiresPayment ?? false;
        const userId = result.userId;

        if (requiresPayment) {
          if (!userId) {
            setSignupError("Unable to start checkout. Please contact support.");
            return;
          }

          try {
            const resp = await fetch("/api/payments/stripe/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                plan: selectedPlan,
                userId,
                email: formData.email.trim(),
                successUrl: `${window.location.origin}/signup/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/signup?plan=${selectedPlan}&checkout=cancelled`,
              }),
            });
            const data = await resp.json();
            if (resp.ok && data?.ok && data.url) {
              setVerificationEmail(formData.email.trim());
              window.location.href = data.url as string;
              return;
            }
            setSignupError(data?.error || "Unable to start checkout session");
          } catch (err) {
            setSignupError("Failed to start checkout. Please try again.");
          }
        } else {
          setVerificationEmail(formData.email.trim());
          setVerifyOpen(true);
        }
      } else {
        setSignupError(result.message || "Signup failed");
      }
    } catch (error) {
      setSignupError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (signupError) {
      setSignupError("");
    }
  };

  const proceedToAccount = () => {
    setCurrentTab("account");
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan)!;
  const requiresPayment = selectedPlanData.requiresPayment;

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Tradelink
          </h1>
          <p className="text-gray-600">
            Create your account and start building partnerships
          </p>
        </div>

        <Tabs value={currentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="plan" onClick={() => setCurrentTab("plan")}>
              1. Choose Plan
            </TabsTrigger>
            <TabsTrigger value="account" disabled={currentTab === "plan"}>
              2. Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select Your Plan
              </h2>
              <p className="text-gray-600">
                Choose the plan that best fits your business needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:shadow-lg"
                  } ${plan.popular ? "relative" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">
                      {plan.price}
                      <span className="text-sm font-normal text-gray-600">
                        /month
                      </span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    {plan.requiresPayment && (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 mt-2"
                      >
                        Credit Card Required
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" onClick={proceedToAccount}>
                Continue with {selectedPlanData.name} Plan
              </Button>
              {requiresPayment && (
                <p className="text-sm text-gray-600 mt-2">
                  Payment will be processed securely with your credit card
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="max-w-md mx-auto border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create Your Account</CardTitle>
                <CardDescription>
                  Selected plan: <strong>{selectedPlanData.name}</strong> (
                  {selectedPlanData.price}/month)
                  {requiresPayment && (
                    <Badge className="ml-2 bg-orange-100 text-orange-700">
                      Payment Required
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {signupError && (
                  <Alert variant="destructive">
                    <AlertDescription>{signupError}</AlertDescription>
                  </Alert>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateAccount();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          disabled={isLoading}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-sm text-red-500">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          disabled={isLoading}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-sm text-red-500">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@business.com"
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business">Business Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="business"
                        placeholder="Your Business Name"
                        className={`pl-10 ${errors.businessName ? "border-red-500" : ""}`}
                        value={formData.businessName}
                        onChange={(e) =>
                          handleInputChange("businessName", e.target.value)
                        }
                        disabled={isLoading}
                      />
                    </div>
                    {errors.businessName && (
                      <p className="text-sm text-red-500">
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Business Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="location"
                        placeholder="Auckland, New Zealand"
                        className={`pl-10 ${errors.businessLocation ? "border-red-500" : ""}`}
                        value={formData.businessLocation}
                        onChange={(e) =>
                          handleInputChange("businessLocation", e.target.value)
                        }
                        disabled={isLoading}
                      />
                    </div>
                    {errors.businessLocation && (
                      <p className="text-sm text-red-500">
                        {errors.businessLocation}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) =>
                          handleInputChange("industry", value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          className={errors.industry ? "border-red-500" : ""}
                        >
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-gray-400" />
                            <SelectValue placeholder="Select Industry" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Food & Beverage">
                            Food & Beverage
                          </SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Manufacturing">
                            Manufacturing
                          </SelectItem>
                          <SelectItem value="Construction">
                            Construction
                          </SelectItem>
                          <SelectItem value="Real Estate">
                            Real Estate
                          </SelectItem>
                          <SelectItem value="Professional Services">
                            Professional Services
                          </SelectItem>
                          <SelectItem value="Beauty & Personal Care">
                            Beauty & Personal Care
                          </SelectItem>
                          <SelectItem value="Automotive">Automotive</SelectItem>
                          <SelectItem value="Transportation">
                            Transportation
                          </SelectItem>
                          <SelectItem value="Media & Entertainment">
                            Media & Entertainment
                          </SelectItem>
                          <SelectItem value="Sports & Fitness">
                            Sports & Fitness
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.industry && (
                        <p className="text-sm text-red-500">
                          {errors.industry}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) =>
                          handleInputChange("companySize", value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          className={errors.companySize ? "border-red-500" : ""}
                        >
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-gray-400" />
                            <SelectValue placeholder="Select Size" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10 employees">
                            1-10 employees
                          </SelectItem>
                          <SelectItem value="11-50 employees">
                            11-50 employees
                          </SelectItem>
                          <SelectItem value="51-200 employees">
                            51-200 employees
                          </SelectItem>
                          <SelectItem value="201-500 employees">
                            201-500 employees
                          </SelectItem>
                          <SelectItem value="501-1000 employees">
                            501-1000 employees
                          </SelectItem>
                          <SelectItem value="1000+ employees">
                            1000+ employees
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.companySize && (
                        <p className="text-sm text-red-500">
                          {errors.companySize}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <PasswordInput
                        id="password"
                        placeholder="Create a password"
                        inputClassName={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange(
                            "password",
                            (e.target as HTMLInputElement).value,
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <PasswordInput
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        inputClassName={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange(
                            "confirmPassword",
                            (e.target as HTMLInputElement).value,
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : requiresPayment ? (
                      "Continue to Secure Checkout"
                    ) : (
                      "Create Free Account"
                    )}
                  </Button>
                </form>

                <div className="text-center text-xs text-gray-600">
                  By creating an account, you agree to our{" "}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <EmailVerificationModal
          open={verifyOpen}
          email={verificationEmail}
          onClose={() => setVerifyOpen(false)}
          onBackToLogin={() => navigate("/login")}
        />
      </div>
    </div>
  );
}

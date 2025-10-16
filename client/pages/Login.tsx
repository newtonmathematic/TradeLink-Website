import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Try Supabase auth first
      const { data, error } = await (
        await import("@/lib/supabaseClient")
      ).supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error || !data.user) {
        setLoginError(error?.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      const sUser = data.user;

      // Ensure app_users table populated (server handles service role upsert)
      try {
        const meta = sUser.user_metadata || {};
        await fetch("/api/users/sync-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sUser.id,
            email: sUser.email || formData.email,
            firstName: meta.firstName || "",
            lastName: meta.lastName || "",
            businessName: meta.businessName || "",
            businessLocation: meta.businessLocation || "",
            industry: meta.industry || "",
            companySize: meta.companySize || "",
            plan: (meta.plan || "free") as "free" | "plus" | "pro",
            createdAt: new Date().toISOString(),
          }),
        });
      } catch {}

      // Hydrate local user so AuthProvider picks it up on reload
      try {
        const meta = sUser.user_metadata || {};
        const appUser = {
          id: sUser.id,
          email: sUser.email || formData.email,
          firstName: meta.firstName || "",
          lastName: meta.lastName || "",
          businessName: meta.businessName || "",
          businessLocation: meta.businessLocation || "",
          industry: meta.industry || "",
          companySize: meta.companySize || "",
          plan: (meta.plan || "free") as "free" | "plus" | "pro",
          createdAt: new Date().toISOString(),
        } as any;
        localStorage.setItem("tradelink_user", JSON.stringify(appUser));
      } catch {}

      // Full reload so context reads localStorage
      window.location.href = "/dashboard";
      return;
    } catch (error) {
      setLoginError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  return (
    <div className="py-20 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Tradelink account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loginError && (
            <Alert variant="destructive">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

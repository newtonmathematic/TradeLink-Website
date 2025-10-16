import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmailVerificationModal } from "@/components/auth/EmailVerificationModal";
import { Loader2, ShieldCheck } from "lucide-react";

interface CheckoutSessionInfo {
  customerEmail: string | null;
  plan: "plus" | "pro" | null;
  status: string | null;
  subscriptionId: string | null;
}

export default function StripeSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<CheckoutSessionInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError(
        "We couldn't find your checkout session. Please contact support if this persists.",
      );
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const resp = await fetch(
          `/api/payments/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
          {
            signal: controller.signal,
          },
        );
        const data = await resp.json();
        if (!resp.ok || !data?.ok) {
          throw new Error(data?.error || "Unable to verify payment status");
        }
        const info = data.data as CheckoutSessionInfo;
        setSession(info);
        setModalOpen(true);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          const message =
            err instanceof Error ? err.message : "Unexpected error";
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [sessionId]);

  const handleBackToSignup = () => {
    navigate("/signup", { replace: true });
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card className="max-w-lg w-full border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Payment Completed</CardTitle>
          <CardDescription>
            {loading
              ? "Verifying your payment..."
              : error
                ? error
                : "Your subscription is confirmed. One last step: verify your email to access your account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">
                Checking payment status...
              </p>
            </div>
          )}

          {!loading && !error && session && (
            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Confirmation sent to</p>
                <p className="text-lg font-semibold text-gray-900">
                  {session.customerEmail || "your email"}
                </p>
              </div>
              <div className="bg-blue-50 text-blue-700 rounded-lg px-4 py-3 text-sm">
                Please click the verification link we just emailed you to finish
                signing in.
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={handleBackToSignup}>
                  Start Over
                </Button>
                <Button onClick={handleBackToLogin}>Go to Login</Button>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="space-y-4 text-center">
              <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={handleBackToSignup}>
                  Return to Signup
                </Button>
                <Button onClick={handleBackToLogin}>Go to Login</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EmailVerificationModal
        open={modalOpen && !loading && !error && !!session}
        email={session?.customerEmail || ""}
        onClose={handleBackToSignup}
        onBackToLogin={handleBackToLogin}
      />
    </div>
  );
}

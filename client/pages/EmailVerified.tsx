import { useState } from "react";
import { CheckCircle2, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function EmailVerified() {
  const [processing, setProcessing] = useState(false);

  const handleBackToLogin = async () => {
    setProcessing(true);
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      localStorage.removeItem("tradelink_user");
      localStorage.removeItem("tradelink_dashboard");
      localStorage.removeItem("tradelink_pending_signup");
    } catch {}
    window.location.href = "/login";
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <Card className="max-w-lg w-full shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email confirmed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-700">You may now access your dashboard.</p>
          <Button
            size="lg"
            className="inline-flex items-center gap-2"
            disabled={processing}
            onClick={handleBackToLogin}
          >
            Back to Login
            <LogIn className="w-4 h-4" />
          </Button>
          {processing && <p className="text-xs text-gray-500">Signing out…</p>}
        </CardContent>
      </Card>
    </div>
  );
}

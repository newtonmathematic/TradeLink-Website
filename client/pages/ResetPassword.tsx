import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

function getPasswordErrors(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(pw)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(pw)) errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(pw)) errors.push("At least one number");
  if (!/[!@#$%^&*(),.?\":{}|<>\-_=+\[\];'`~]/.test(pw)) errors.push("At least one special character");
  return errors;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch("/api/auth/validate-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
        const json = await res.json();
        if (json.ok && json.email) { setEmail(json.email); setValid(true); } else { setValid(false); }
      } catch {
        setValid(false);
      } finally {
        setLoading(false);
      }
    };
    if (token) validate(); else { setLoading(false); setValid(false); }
  }, [token]);

  const errors = useMemo(() => getPasswordErrors(pw1), [pw1]);
  const match = pw1 === pw2 && pw1.length > 0;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!valid) { setError("Invalid or expired link"); return; }
    if (errors.length > 0) { setError("Please meet all password requirements"); return; }
    if (!match) { setError("Passwords do not match"); return; }
    setSaving(true);
    try {
      await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const raw = localStorage.getItem("tradelink_passwords");
      const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      map[email] = pw1;
      localStorage.setItem("tradelink_passwords", JSON.stringify(map));
      setDone(true);
    } catch {
      setError("Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center min-h-[80vh]">
        <div className="text-gray-600 flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/>Validating link…</div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="py-20 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Invalid or expired link</CardTitle>
            <CardDescription>Please request a new password reset link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Button onClick={()=> navigate("/forgot-password")} className="w-full">Request New Link</Button>
            <Link to="/login" className="text-sm text-blue-600 hover:underline"><ArrowLeft className="inline h-4 w-4 mr-1"/>Back to login</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-20 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Create New Password</CardTitle>
          <CardDescription>for {email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
          {done ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto"/>
              <p className="text-sm text-gray-700">Your password has been updated. You can now sign in.</p>
              <Button onClick={()=> navigate("/login")} className="w-full">Go to Login</Button>
            </div>
          ) : (
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pw1">New Password</Label>
                <PasswordInput id="pw1" value={pw1} onChange={(e)=> setPw1((e.target as HTMLInputElement).value)} placeholder="Strong password" />
                <ul className="text-xs text-gray-600 list-disc ml-5">
                  <li>At least 8 characters</li>
                  <li>At least one uppercase and one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw2">Confirm Password</Label>
                <PasswordInput id="pw2" value={pw2} onChange={(e)=> setPw2((e.target as HTMLInputElement).value)} placeholder="Re-enter password" />
                {!match && pw2.length>0 && (<p className="text-sm text-red-500">Passwords do not match</p>)}
              </div>
              <Button type="submit" className="w-full" disabled={saving || errors.length>0 || !match}>
                {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Updating…</>) : "Update Password"}
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:underline"><ArrowLeft className="inline h-4 w-4 mr-1"/>Back to login</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

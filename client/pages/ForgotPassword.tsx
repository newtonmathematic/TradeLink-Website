import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => /\S+@\S+\.\S+/.test(email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) { setError("Please enter a valid email address"); return; }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          {success ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-700">If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
              <Button onClick={()=> navigate("/login")} className="w-full">Back to Login</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="email" type="email" placeholder="your@email.com" className="pl-10" value={email} onChange={(e)=> setEmail(e.target.value)} disabled={loading} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Sending...</>) : "Send Reset Link"}
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

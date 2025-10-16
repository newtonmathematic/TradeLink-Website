import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabaseClient";

interface EmailVerificationModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onBackToLogin: () => void;
  resendDelay?: number;
}

export function EmailVerificationModal({
  open,
  email,
  onClose,
  onBackToLogin,
  resendDelay = 30,
}: EmailVerificationModalProps) {
  const [cooldown, setCooldown] = useState(resendDelay);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    setCooldown(resendDelay);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, resendDelay]);

  const handleResend = async () => {
    if (!email || resending) return;
    try {
      setResending(true);
      await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verified`,
        },
      });
      setCooldown(resendDelay);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("resend verification email failed", err);
    } finally {
      setResending(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <div className="flex items-start justify-between gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Verify your email</AlertDialogTitle>
            <AlertDialogDescription>
              Account created. Please check your email to confirm your address
              and complete sign-in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <button
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onBackToLogin}>
            Back to Login
          </Button>
          <Button
            onClick={handleResend}
            disabled={cooldown > 0 || resending || !email}
          >
            {resending
              ? "Resending..."
              : cooldown > 0
                ? `Resend Email (${cooldown}s)`
                : "Resend Email"}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

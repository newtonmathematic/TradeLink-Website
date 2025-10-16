import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AccountRestricted from "./AccountRestricted";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowRestricted?: boolean; // Allow access even if account is restricted (for billing page)
}

export default function ProtectedRoute({
  children,
  allowRestricted = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAccountRestricted } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, don't render anything (user will be redirected)
  if (!isAuthenticated) {
    return null;
  }

  // If account is restricted and this route doesn't allow restricted access
  if (isAccountRestricted && !allowRestricted) {
    return <AccountRestricted />;
  }

  // If authenticated and not restricted (or restriction is allowed), render the protected content
  return <>{children}</>;
}

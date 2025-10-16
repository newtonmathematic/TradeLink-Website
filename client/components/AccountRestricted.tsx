import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CreditCard,
  Calendar,
  DollarSign,
  Lock,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountRestricted() {
  const { user, subscription, accountRestriction, logout } = useAuth();

  if (!user || !subscription || !accountRestriction) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Access Restricted
          </h1>
          <p className="text-gray-600">
            {accountRestriction.message}
          </p>
        </div>

        {/* Account Status */}
        <Card className={`${
          accountRestriction.severity === 'critical' ? 'border-red-200 bg-red-50' :
          accountRestriction.severity === 'error' ? 'border-orange-200 bg-orange-50' :
          'border-yellow-200 bg-yellow-50'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center ${
              accountRestriction.severity === 'critical' ? 'text-red-800' :
              accountRestriction.severity === 'error' ? 'text-orange-800' :
              'text-yellow-800'
            }`}>
              <AlertTriangle className="mr-2 h-5 w-5" />
              {accountRestriction.reason === 'overdue_payment' ? 'Payment Overdue' :
               accountRestriction.reason === 'account_suspended' ? 'Account Suspended' :
               accountRestriction.reason === 'subscription_expired' ? 'Subscription Expired' :
               accountRestriction.reason === 'payment_failed' ? 'Payment Failed' :
               'Account Issue'}
            </CardTitle>
            <CardDescription className={`${
              accountRestriction.severity === 'critical' ? 'text-red-700' :
              accountRestriction.severity === 'error' ? 'text-orange-700' :
              'text-yellow-700'
            }`}>
              {accountRestriction.actionRequired}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className={`flex items-center mb-1 ${
                  accountRestriction.severity === 'critical' ? 'text-red-600' :
                  accountRestriction.severity === 'error' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  <DollarSign className="h-4 w-4 mr-1" />
                  Amount Due
                </div>
                <p className={`font-medium ${
                  accountRestriction.severity === 'critical' ? 'text-red-800' :
                  accountRestriction.severity === 'error' ? 'text-orange-800' :
                  'text-yellow-800'
                }`}>
                  NZD ${subscription.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <div className={`flex items-center mb-1 ${
                  accountRestriction.severity === 'critical' ? 'text-red-600' :
                  accountRestriction.severity === 'error' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  <Calendar className="h-4 w-4 mr-1" />
                  {accountRestriction.reason === 'overdue_payment' ? 'Due Date' : 'Next Billing'}
                </div>
                <p className={`font-medium ${
                  accountRestriction.severity === 'critical' ? 'text-red-800' :
                  accountRestriction.severity === 'error' ? 'text-orange-800' :
                  'text-yellow-800'
                }`}>
                  {formatDate(subscription.nextBillingDate)}
                </p>
              </div>

              <div>
                <div className={`flex items-center mb-1 ${
                  accountRestriction.severity === 'critical' ? 'text-red-600' :
                  accountRestriction.severity === 'error' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Status
                </div>
                <Badge
                  variant={accountRestriction.severity === 'critical' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {subscription.daysOverdue ? `${subscription.daysOverdue} days overdue` : subscription.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restricted Features */}
        {accountRestriction.severity === 'critical' && (
          <Card>
            <CardHeader>
              <CardTitle>Restricted Access</CardTitle>
              <CardDescription>
                The following features are currently unavailable:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>Partnership discovery and creation</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>Analytics and reporting</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>Deal negotiations and messaging</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>Verification tools</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>API access and integrations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resolution Options */}
        <Card>
          <CardHeader>
            <CardTitle>Restore Your Account</CardTitle>
            <CardDescription>
              Update your payment to restore full access to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                Your account will be automatically restored within minutes of
                successful payment.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              {accountRestriction.canAccessBilling && (
                <Button asChild className="flex-1">
                  <Link to="/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {accountRestriction.reason === 'payment_failed' ? 'Retry Payment' : 'Update Payment'}
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild className="flex-1">
                <Link to="/contact">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Alternative Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Downgrade to Free</h4>
                <p className="text-sm text-gray-600">
                  Switch to our free plan with limited features but no payment
                  required.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/billing">Downgrade Plan</Link>
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Need Help?</h4>
                <p className="text-sm text-gray-600">
                  Contact our support team if you're experiencing payment
                  issues.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/contact">
                      <Mail className="mr-1 h-3 w-3" />
                      Email
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="mr-1 h-3 w-3" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-center space-x-4">
          <Button variant="ghost" onClick={handleLogout}>
            Sign Out
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500">
          Business: {user.businessName} • Account: {user.email}
        </div>
      </div>
    </div>
  );
}

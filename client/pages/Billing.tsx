import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Check,
  AlertTriangle,
  Info,
  BarChart3,
  Users,
  Database,
  Zap,
  Edit,
  Trash2,
  Shield,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SquareService } from "@/services/squareService";

export default function Billing() {
  const {
    user,
    subscription,
    paymentMethods,
    transactions,
    invoices,
    usageMetrics,
    isAccountRestricted,
    accountRestriction,
    cancelSubscription,
    upgradeSubscription,
    checkSubscriptionLimits,
    getCurrentPlanLimits,
    hasPaymentIssues,
  } = useAuth();

  const navigate = useNavigate();
  const [isManagingAutoRenew, setIsManagingAutoRenew] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<
    "plus" | "pro" | null
  >(null);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "NZD") => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;

    setIsManagingAutoRenew(true);

    try {
      if (subscription.autoRenew) {
        await cancelSubscription();
      }
      // For enabling auto-renew, we'd call a different function
      // await enableAutoRenew();
    } catch (error) {
      console.error("Error managing auto-renew:", error);
    } finally {
      setIsManagingAutoRenew(false);
    }
  };

  const downloadInvoice = (invoice: any) => {
    // Mock invoice download
    const invoiceData = `
TRADELINK INVOICE
================

Invoice: ${invoice.number}
Date: ${formatDate(invoice.date)}
Due Date: ${formatDate(invoice.dueDate)}
Amount: ${formatCurrency(invoice.amount, invoice.currency)}
Status: ${invoice.status.toUpperCase()}

Business: ${user.businessName}
Email: ${user.email}

Thank you for your business!
    `.trim();

    const blob = new Blob([invoiceData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Perfect for small businesses getting started",
      features: ["Up to 3 partnerships", "Basic discovery", "Email support"],
      limits: {
        partnerships: 3,
        storage: 100,
        apiCalls: 100,
        monthlyRedemptions: 50,
      },
    },
    {
      id: "plus",
      name: "Plus",
      price: 29,
      description: "Ideal for growing businesses",
      features: [
        "Up to 15 partnerships",
        "Advanced analytics",
        "Priority support",
        "QR verification",
        "Bulk import",
        "Custom reports",
      ],
      limits: {
        partnerships: 15,
        storage: 1000,
        apiCalls: 1000,
        monthlyRedemptions: 500,
      },
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: 99,
      description: "For enterprises with complex needs",
      features: [
        "Unlimited partnerships",
        "Advanced analytics",
        "White-label platform",
        "Dedicated manager",
        "API access",
        "Multi-location support",
        "Custom integrations",
        "Priority onboarding",
      ],
      limits: {
        partnerships: -1,
        storage: 10000,
        apiCalls: 10000,
        monthlyRedemptions: -1,
      },
    },
  ];

  const handleUpgradePlan = async (planId: "plus" | "pro") => {
    setSelectedUpgradePlan(planId);
    setIsUpgrading(true);

    // In a real app, this would integrate with Square payment processing
    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      // Mock payment data for upgrade
      const paymentData = {
        transactionId: `UPG_${Date.now()}`,
        subscriptionId: `SUB_${Date.now()}`,
        customerId: subscription?.squareCustomerId || `CUST_${Date.now()}`,
        amount: plan.price,
        currency: "NZD",
        paymentMethod: "Credit Card",
        status: "success" as const,
        timestamp: new Date().toISOString(),
      };

      const result = await upgradeSubscription(planId, paymentData);

      if (result.success) {
        // Redirect to success page or show success message
        navigate("/dashboard", {
          state: { message: `Successfully upgraded to ${plan.name} plan!` },
        });
      } else {
        throw new Error(result.error || "Upgrade failed");
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert(
        `Upgrade failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsUpgrading(false);
      setSelectedUpgradePlan(null);
    }
  };

  const handleAddPaymentMethod = () => {
    // In a real app, this would integrate with Square for secure card tokenization
    console.log("Adding payment method:", newPaymentMethod);
    setShowPaymentMethodDialog(false);
    setNewPaymentMethod({
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardholderName: "",
    });
  };

  const retryFailedPayment = async () => {
    if (!subscription?.squareSubscriptionId) return;

    try {
      // In a real app, this would call Square to retry the payment
      console.log(
        "Retrying payment for subscription:",
        subscription.squareSubscriptionId,
      );
      alert(
        "Payment retry initiated. Please check your email for confirmation.",
      );
    } catch (error) {
      console.error("Payment retry failed:", error);
      alert("Failed to retry payment. Please contact support.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Billing & Subscription
          </h1>
          <p className="text-gray-600">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
        {subscription?.plan !== "free" && (
          <Button variant="outline" asChild>
            <Link to="/pricing">View All Plans</Link>
          </Button>
        )}
      </div>

      {/* Account Status Alerts */}
      {accountRestriction && (
        <Alert
          variant={
            accountRestriction.severity === "critical"
              ? "destructive"
              : "default"
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{accountRestriction.message}</span>
            {accountRestriction.reason === "payment_failed" && (
              <Button size="sm" onClick={retryFailedPayment}>
                Retry Payment
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {hasPaymentIssues() && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>We're here to help resolve any payment issues.</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/contact">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Plan
                {subscription?.status && (
                  <Badge
                    variant={
                      subscription.status === "active"
                        ? "default"
                        : "destructive"
                    }
                    className="ml-2"
                  >
                    {subscription.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900">
                      {subscription.plan.charAt(0).toUpperCase() +
                        subscription.plan.slice(1)}{" "}
                      Plan
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(subscription.amount)}
                      <span className="text-sm font-normal text-gray-600">
                        /month
                      </span>
                    </p>
                    {subscription.squareSubscriptionId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Square ID: {subscription.squareSubscriptionId}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Current Period</p>
                    <p className="font-medium">
                      {formatDate(subscription.currentPeriodStart)} -{" "}
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                    {subscription.nextBillingDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Next billing: {formatDate(subscription.nextBillingDate)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="auto-renew">Auto-renew</Label>
                      <Switch
                        id="auto-renew"
                        checked={subscription.autoRenew}
                        onCheckedChange={handleToggleAutoRenew}
                        disabled={
                          isManagingAutoRenew || subscription.plan === "free"
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {subscription.autoRenew
                        ? "Your subscription will renew automatically"
                        : "Your subscription will not renew automatically"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                {user.plan === "free"
                  ? "Upgrade to unlock more features"
                  : "Change your plan anytime"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      plan.id === user.plan
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{plan.name}</h3>
                      {plan.id === user.plan && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold mb-2">
                      {formatCurrency(plan.price)}
                      <span className="text-sm font-normal text-gray-600">
                        /month
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {plan.description}
                    </p>
                    <ul className="space-y-1 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {plan.id !== user.plan && (
                      <Button
                        variant={plan.id === "free" ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (plan.id === "free") {
                            // Handle downgrade
                            if (
                              confirm(
                                "Are you sure you want to downgrade to the free plan? You will lose access to premium features.",
                              )
                            ) {
                              cancelSubscription();
                            }
                          } else {
                            handleUpgradePlan(plan.id as "plus" | "pro");
                          }
                        }}
                        disabled={
                          isUpgrading && selectedUpgradePlan === plan.id
                        }
                      >
                        {isUpgrading && selectedUpgradePlan === plan.id
                          ? "Processing..."
                          : plan.id === "free"
                            ? "Downgrade"
                            : "Upgrade"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Usage Metrics
              </CardTitle>
              <CardDescription>
                Track your usage against plan limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {usageMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium">Partnerships</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {usageMetrics.partnershipsUsed} /{" "}
                        {usageMetrics.partnershipsLimit === -1
                          ? "∞"
                          : usageMetrics.partnershipsLimit}
                      </span>
                    </div>
                    <Progress
                      value={
                        usageMetrics.partnershipsLimit === -1
                          ? 0
                          : (usageMetrics.partnershipsUsed /
                              usageMetrics.partnershipsLimit) *
                            100
                      }
                      className="h-2"
                    />
                    {usageMetrics.partnershipsUsed >=
                      usageMetrics.partnershipsLimit &&
                      usageMetrics.partnershipsLimit !== -1 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Limit reached. Upgrade to add more partnerships.
                        </p>
                      )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                        <span className="font-medium">Monthly Redemptions</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {usageMetrics.monthlyRedemptions}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.plan === "pro"
                        ? "Unlimited"
                        : `Plan allows ${getCurrentPlanLimits()?.monthlyRedemptions || 0} per month`}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="font-medium">Storage Used</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {usageMetrics.storageUsed} MB
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Plan limit varies by subscription
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="font-medium">API Calls</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {usageMetrics.apiCallsUsed}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.plan === "pro"
                        ? "High limits"
                        : "Upgrade for more API access"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Payment Methods
                <Dialog
                  open={showPaymentMethodDialog}
                  onOpenChange={setShowPaymentMethodDialog}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Add a new credit card for your subscription payments.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={newPaymentMethod.cardNumber}
                          onChange={(e) =>
                            setNewPaymentMethod((prev) => ({
                              ...prev,
                              cardNumber: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryMonth">Month</Label>
                          <Select
                            value={newPaymentMethod.expiryMonth}
                            onValueChange={(value) =>
                              setNewPaymentMethod((prev) => ({
                                ...prev,
                                expiryMonth: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem
                                  key={i + 1}
                                  value={String(i + 1).padStart(2, "0")}
                                >
                                  {String(i + 1).padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryYear">Year</Label>
                          <Select
                            value={newPaymentMethod.expiryYear}
                            onValueChange={(value) =>
                              setNewPaymentMethod((prev) => ({
                                ...prev,
                                expiryYear: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() + i;
                                return (
                                  <SelectItem key={year} value={String(year)}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={newPaymentMethod.cvv}
                            onChange={(e) =>
                              setNewPaymentMethod((prev) => ({
                                ...prev,
                                cvv: e.target.value,
                              }))
                            }
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          placeholder="John Smith"
                          value={newPaymentMethod.cardholderName}
                          onChange={(e) =>
                            setNewPaymentMethod((prev) => ({
                              ...prev,
                              cardholderName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowPaymentMethodDialog(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddPaymentMethod}
                          className="flex-1"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Add Securely
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {method.brand} •••• {method.last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                        {method.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {user.plan === "free"
                      ? "No payment method required for free plan"
                      : "No payment methods on file"}
                  </p>
                  {user.plan !== "free" && (
                    <Button onClick={() => setShowPaymentMethodDialog(true)}>
                      Add Payment Method
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices & Receipts</CardTitle>
              <CardDescription>
                Download your invoices and payment receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-600"
                              : invoice.status === "overdue"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(invoice.date)} •{" "}
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : "destructive"
                          }
                          className="capitalize"
                        >
                          {invoice.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No invoices available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.status === "success"
                              ? "bg-green-100 text-green-600"
                              : transaction.status === "failed"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(transaction.date)} •{" "}
                            {transaction.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency,
                          )}
                        </p>
                        <Badge
                          variant={
                            transaction.status === "success"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs capitalize"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No transaction history available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

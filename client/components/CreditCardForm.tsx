import { useState } from "react";
import {
  SquareService,
  SquareSubscriptionData,
} from "@/services/squareService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Lock,
  Shield,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

interface CreditCardFormProps {
  plan: {
    name: string;
    price: string;
    description: string;
  };
  onPaymentSuccess: (paymentData: PaymentResult) => void;
  onPaymentFailure: (error: string) => void;
  onBack: () => void;
}

interface PaymentResult {
  transactionId: string;
  subscriptionId?: string;
  customerId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "success" | "failed";
  timestamp: string;
  errorMessage?: string;
}

export default function CreditCardForm({
  plan,
  onPaymentSuccess,
  onPaymentFailure,
  onBack,
}: CreditCardFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "NZ",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Detect card type
  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    if (/^4/.test(cleaned)) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "Mastercard";
    if (/^3[47]/.test(cleaned)) return "Amex";
    if (/^6/.test(cleaned)) return "Discover";
    return "Unknown";
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Card number validation
    const cardNumber = formData.cardNumber.replace(/\s/g, "");
    if (!cardNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    // Expiry validation
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = "Month is required";
    }
    if (!formData.expiryYear) {
      newErrors.expiryYear = "Year is required";
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = "CVV is required";
    } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = "CVV must be 3-4 digits";
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "cardholderName") {
      formattedValue = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Square payment processing
  const processPayment = async (): Promise<PaymentResult> => {
    const amount = parseFloat(plan.price.replace("$", ""));

    // Validate card details first
    const cardValidation = SquareService.validateCard({
      number: formData.cardNumber,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      cvv: formData.cvv,
    });

    if (!cardValidation.isValid) {
      throw new Error(
        `Invalid card details: ${cardValidation.errors.join(", ")}`,
      );
    }

    const subscriptionData: SquareSubscriptionData = {
      planName: plan.name,
      amount,
      currency: "NZD",
      description: `Tradelink ${plan.name} Plan Monthly Subscription`,
      userEmail: formData.email,
      userName: formData.cardholderName,
      customId: SquareService.generateCustomId(plan.name, formData.email),
      billingCycle: "MONTHLY",
      cardholderName: formData.cardholderName,
      address: {
        line1: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.zipCode,
        country: formData.country,
      },
    };

    try {
      const squareResult =
        await SquareService.createSubscription(subscriptionData);

      if (squareResult.status === "ACTIVE") {
        return {
          transactionId: squareResult.paymentId || squareResult.subscriptionId,
          subscriptionId: squareResult.subscriptionId,
          customerId: squareResult.customerId,
          amount: squareResult.amount,
          currency: squareResult.currency,
          paymentMethod: "Credit Card",
          status: "success",
          timestamp: squareResult.timestamp,
        };
      } else {
        throw new Error(
          squareResult.errorMessage || "Subscription creation failed",
        );
      }
    } catch (error) {
      console.error("Square payment failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment processing failed. Please try again.";

      return {
        transactionId: "",
        amount,
        currency: "NZD",
        paymentMethod: "Credit Card",
        status: "failed",
        timestamp: new Date().toISOString(),
        errorMessage,
      };
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processPayment();
      onPaymentSuccess(result);
    } catch (error) {
      onPaymentFailure(
        error instanceof Error ? error.message : "Payment failed",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const monthlyAmount = plan.price === "$29" ? 29 : 99;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Secure Payment</CardTitle>
          <CardDescription>
            Complete your subscription to {plan.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">{plan.name} Plan</h3>
                <p className="text-sm text-blue-700">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  NZD {plan.price}
                </p>
                <p className="text-sm text-blue-700">per month</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <Alert className="bg-green-50 border-green-200">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Your payment information is encrypted and secure
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Information Notice */}
            <Alert className="bg-blue-50 border-blue-200">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Your payment will be processed securely through Square. Your
                card details are encrypted and never stored on our servers.
              </AlertDescription>
            </Alert>

            {/* Card Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Card Information</h3>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      handleInputChange("cardNumber", e.target.value)
                    }
                    className={`pr-20 ${errors.cardNumber ? "border-red-500" : ""}`}
                    disabled={isProcessing}
                    maxLength={19}
                  />
                  {formData.cardNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="outline" className="text-xs">
                        {getCardType(formData.cardNumber)}
                      </Badge>
                    </div>
                  )}
                </div>
                {errors.cardNumber && (
                  <p className="text-sm text-red-500">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("expiryMonth", value)
                    }
                    disabled={isProcessing}
                  >
                    <SelectTrigger
                      className={errors.expiryMonth ? "border-red-500" : ""}
                    >
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
                  {errors.expiryMonth && (
                    <p className="text-sm text-red-500">{errors.expiryMonth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Year</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("expiryYear", value)
                    }
                    disabled={isProcessing}
                  >
                    <SelectTrigger
                      className={errors.expiryYear ? "border-red-500" : ""}
                    >
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
                  {errors.expiryYear && (
                    <p className="text-sm text-red-500">{errors.expiryYear}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    className={errors.cvv ? "border-red-500" : ""}
                    disabled={isProcessing}
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="text-sm text-red-500">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="JOHN SMITH"
                  value={formData.cardholderName}
                  onChange={(e) =>
                    handleInputChange("cardholderName", e.target.value)
                  }
                  className={errors.cardholderName ? "border-red-500" : ""}
                  disabled={isProcessing}
                />
                {errors.cardholderName && (
                  <p className="text-sm text-red-500">
                    {errors.cardholderName}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Billing Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Billing Address</h3>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@business.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isProcessing}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Business Street"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                  disabled={isProcessing}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Auckland"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={errors.city ? "border-red-500" : ""}
                    disabled={isProcessing}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Postal Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="1010"
                    value={formData.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                    className={errors.zipCode ? "border-red-500" : ""}
                    disabled={isProcessing}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                  disabled={isProcessing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NZ">New Zealand</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subscription ({plan.name})
                </span>
                <span className="font-medium">NZD ${monthlyAmount}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (15%)</span>
                <span className="font-medium">
                  NZD ${(monthlyAmount * 0.15).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>NZD ${(monthlyAmount * 1.15).toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">
                Recurring monthly. Cancel anytime.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isProcessing}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Subscribe & Pay NZD ${(monthlyAmount * 1.15).toFixed(2)}
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By completing this purchase, you agree to our Terms of Service and
              authorize recurring monthly charges to your payment method.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

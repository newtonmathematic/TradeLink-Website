import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface PaymentResultScreensProps {
  result: PaymentResult;
  planName: string;
  onGoToDashboard: () => void;
  onGoBack: () => void;
}

export function PaymentSuccessScreen({
  result,
  planName,
  onGoToDashboard,
}: {
  result: PaymentResult;
  planName: string;
  onGoToDashboard: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">
            Payment Successful!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-2">
              Welcome to Tradelink {planName}!
            </p>
            <p className="text-gray-600">
              Your subscription is now active and ready to use.
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium text-green-900">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Plan:</span>
                <p className="font-medium text-green-900">{planName}</p>
              </div>
              <div>
                <span className="text-green-700">Amount:</span>
                <p className="font-medium text-green-900">
                  {result.currency} ${result.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-green-700">Payment Method:</span>
                <p className="font-medium text-green-900">
                  {result.paymentMethod}
                </p>
              </div>
              <div>
                <span className="text-green-700">Transaction ID:</span>
                <p className="font-medium text-green-900 text-xs">
                  {result.transactionId}
                </p>
              </div>
              {result.subscriptionId && (
                <div className="col-span-2">
                  <span className="text-green-700">Subscription ID:</span>
                  <p className="font-medium text-green-900 text-xs">
                    {result.subscriptionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              <strong>What's next?</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Access your dashboard to start building partnerships</li>
                <li>• Set up your business profile and preferences</li>
                <li>• Explore available partners in your area</li>
                <li>
                  • Check your email for a receipt and getting started guide
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Button */}
          <div className="pt-4">
            <Button
              onClick={onGoToDashboard}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Your subscription will renew automatically each month. You can
            manage your subscription in your account settings.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentFailureScreen({
  result,
  planName,
  onGoBack,
}: {
  result: PaymentResult;
  planName: string;
  onGoBack: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">
            Payment Cancelled/Unsuccessful
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-2">
              We couldn't process your payment for {planName}.
            </p>
            <p className="text-gray-600">
              Don't worry - you can try again or contact support for assistance.
            </p>
          </div>

          {/* Error Details */}
          {result.errorMessage && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Error:</strong> {result.errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Attempt Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium text-gray-900">
              Payment Attempt Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Plan:</span>
                <p className="font-medium text-gray-900">{planName}</p>
              </div>
              <div>
                <span className="text-gray-600">Amount:</span>
                <p className="font-medium text-gray-900">
                  {result.currency} ${result.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <p className="font-medium text-gray-900">
                  {result.paymentMethod}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Time:</span>
                <p className="font-medium text-gray-900">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              <strong>Common issues:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Insufficient funds or credit limit exceeded</li>
                <li>• Incorrect card details (number, expiry, or CVV)</li>
                <li>• Card blocked for online transactions</li>
                <li>• Bank security check required</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onGoBack}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back & Try Again
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@tradelink.network"
              className="text-blue-600 hover:underline"
            >
              support@tradelink.network
            </a>{" "}
            or call 0800-TRADELINK.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentResultScreens(props: PaymentResultScreensProps) {
  if (props.result.status === "success") {
    return (
      <PaymentSuccessScreen
        result={props.result}
        planName={props.planName}
        onGoToDashboard={props.onGoToDashboard}
      />
    );
  } else {
    return (
      <PaymentFailureScreen
        result={props.result}
        planName={props.planName}
        onGoBack={props.onGoBack}
      />
    );
  }
}

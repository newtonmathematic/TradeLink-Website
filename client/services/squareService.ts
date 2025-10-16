// Square payment service using Zapier MCP integration

export interface SquarePaymentData {
  amount: number;
  currency: string;
  planName: string;
  description: string;
  userEmail: string;
  userName: string;
  customId: string;
  cardToken?: string;
}

export interface SquareSubscriptionData {
  planName: string;
  amount: number;
  currency: string;
  description: string;
  userEmail: string;
  userName: string;
  customId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  cardholderName: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface SquarePaymentResult {
  paymentId: string;
  orderId?: string;
  status: 'COMPLETED' | 'APPROVED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  paymentMethod: string;
  timestamp: string;
  receiptUrl?: string;
  errorMessage?: string;
}

export interface SquareSubscriptionResult {
  subscriptionId: string;
  customerId: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'DEACTIVATED';
  amount: number;
  currency: string;
  nextPaymentDate: string;
  timestamp: string;
  paymentId?: string;
  errorMessage?: string;
}

export interface SquareCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface SquareInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  createdDate: string;
  paidDate?: string;
  downloadUrl?: string;
  description: string;
}

export class SquareService {
  /**
   * Create a customer in Square
   */
  static async createCustomer(customerData: {
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  }): Promise<SquareCustomer> {
    try {
      const response = await fetch('/api/square/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: customerData.email,
          given_name: customerData.firstName,
          family_name: customerData.lastName,
          company_name: customerData.companyName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Customer creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const customer = data.results?.[0];

      if (!customer) {
        throw new Error('Invalid response from Square customer API');
      }

      return {
        id: customer.id,
        email: customer.email_address,
        firstName: customer.given_name,
        lastName: customer.family_name,
        createdAt: customer.created_at,
      };
    } catch (error) {
      console.error('Square customer creation failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Customer creation failed');
    }
  }

  /**
   * Create a one-time payment
   */
  static async createPayment(paymentData: SquarePaymentData): Promise<SquarePaymentResult> {
    try {
      const response = await fetch('/api/square/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(paymentData.amount * 100).toString(), // Square expects cents
          currency_code: paymentData.currency,
          description: paymentData.description,
          reference_id: paymentData.customId,
          customer_id: paymentData.userEmail, // Use email as customer identifier
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const payment = data.results?.[0];

      if (!payment) {
        throw new Error('Invalid response from Square payment API');
      }

      return {
        paymentId: payment.id,
        orderId: payment.order_id,
        status: this.mapSquareStatus(payment.status),
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: 'Credit Card',
        timestamp: new Date().toISOString(),
        receiptUrl: payment.receipt_url,
      };
    } catch (error) {
      console.error('Square payment creation failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Payment creation failed');
    }
  }

  /**
   * Create a subscription for recurring billing
   */
  static async createSubscription(subscriptionData: SquareSubscriptionData): Promise<SquareSubscriptionResult> {
    try {
      // First create customer if needed
      const customer = await this.createCustomer({
        email: subscriptionData.userEmail,
        firstName: subscriptionData.userName.split(' ')[0] || '',
        lastName: subscriptionData.userName.split(' ').slice(1).join(' ') || '',
      });

      // Create the subscription
      const response = await fetch('/api/square/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer.id,
          plan_name: subscriptionData.planName,
          amount: Math.round(subscriptionData.amount * 100).toString(), // Square expects cents
          currency_code: subscriptionData.currency,
          description: subscriptionData.description,
          billing_cycle: subscriptionData.billingCycle,
          cardholder_name: subscriptionData.cardholderName,
          billing_address: subscriptionData.address,
          reference_id: subscriptionData.customId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Subscription creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const subscription = data.results?.[0];

      if (!subscription) {
        throw new Error('Invalid response from Square subscription API');
      }

      // Calculate next payment date (30 days from now for monthly)
      const nextPayment = new Date();
      nextPayment.setMonth(nextPayment.getMonth() + 1);

      return {
        subscriptionId: subscription.id,
        customerId: customer.id,
        status: 'ACTIVE',
        amount: subscriptionData.amount,
        currency: subscriptionData.currency,
        nextPaymentDate: nextPayment.toISOString(),
        timestamp: new Date().toISOString(),
        paymentId: subscription.initial_payment_id,
      };
    } catch (error) {
      console.error('Square subscription creation failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Subscription creation failed');
    }
  }

  /**
   * Get payment details by ID
   */
  static async getPayment(paymentId: string): Promise<SquarePaymentResult | null> {
    try {
      const response = await fetch('/api/square/get-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment lookup failed: ${response.statusText}`);
      }

      const data = await response.json();
      const payment = data.results?.[0];

      if (!payment) {
        return null;
      }

      return {
        paymentId: payment.id,
        orderId: payment.order_id,
        status: this.mapSquareStatus(payment.status),
        amount: parseInt(payment.amount_money.amount) / 100, // Convert from cents
        currency: payment.amount_money.currency,
        paymentMethod: 'Credit Card',
        timestamp: payment.created_at,
        receiptUrl: payment.receipt_url,
      };
    } catch (error) {
      console.error('Square payment lookup failed:', error);
      return null;
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/square/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Square subscription cancellation failed:', error);
      return false;
    }
  }

  /**
   * Get customer invoices
   */
  static async getInvoices(customerId: string): Promise<SquareInvoice[]> {
    try {
      const response = await fetch('/api/square/get-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Invoice lookup failed: ${response.statusText}`);
      }

      const data = await response.json();
      const invoices = data.results || [];

      return invoices.map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        amount: parseInt(invoice.total_amount) / 100, // Convert from cents
        currency: invoice.currency || 'NZD',
        status: invoice.status,
        dueDate: invoice.due_date,
        createdDate: invoice.created_at,
        paidDate: invoice.paid_date,
        downloadUrl: invoice.download_url,
        description: invoice.description || 'Subscription payment',
      }));
    } catch (error) {
      console.error('Square invoice lookup failed:', error);
      return [];
    }
  }

  /**
   * Generate a unique custom ID for tracking
   */
  static generateCustomId(planName: string, userEmail: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 6);
    return `${planName.toLowerCase().replace(/\s+/g, '_')}_${userEmail.split('@')[0]}_${timestamp}_${randomSuffix}`;
  }

  /**
   * Map Square payment status to our standard status
   */
  private static mapSquareStatus(squareStatus: string): SquarePaymentResult['status'] {
    switch (squareStatus?.toUpperCase()) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'APPROVED':
        return 'APPROVED';
      case 'PENDING':
        return 'PENDING';
      case 'FAILED':
        return 'FAILED';
      case 'CANCELED':
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }

  /**
   * Validate credit card details (client-side validation)
   */
  static validateCard(cardData: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Card number validation (Luhn algorithm)
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (!this.luhnCheck(cardNumber)) {
      errors.push('Invalid card number');
    }

    // Expiry validation
    const currentDate = new Date();
    const expiryDate = new Date(parseInt(cardData.expiryYear), parseInt(cardData.expiryMonth) - 1);
    if (expiryDate < currentDate) {
      errors.push('Card has expired');
    }

    // CVV validation
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      errors.push('Invalid CVV');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Luhn algorithm for credit card validation
   */
  private static luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }
}

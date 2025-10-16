import { Handler } from '@netlify/functions';

// Square API handler using Zapier MCP
export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { path } = event;
    const body = JSON.parse(event.body || '{}');

    console.log('Square API request:', { path, body });

    if (path.includes('/create-customer')) {
      return await handleCreateCustomer(body, headers);
    } else if (path.includes('/create-payment')) {
      return await handleCreatePayment(body, headers);
    } else if (path.includes('/create-subscription')) {
      return await handleCreateSubscription(body, headers);
    } else if (path.includes('/get-payment')) {
      return await handleGetPayment(body, headers);
    } else if (path.includes('/cancel-subscription')) {
      return await handleCancelSubscription(body, headers);
    } else if (path.includes('/get-invoices')) {
      return await handleGetInvoices(body, headers);
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint not found' }),
      };
    }
  } catch (error) {
    console.error('Square API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function handleCreateCustomer(body: any, headers: any) {
  try {
    const {
      email_address,
      given_name,
      family_name,
      company_name,
    } = body;

    // Generate a mock customer ID
    const customerId = `CUST_${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    
    // Create mock Square customer response
    const customerResponse = {
      results: [{
        id: customerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        given_name,
        family_name,
        email_address,
        company_name,
        address: null,
        phone_number: null,
        reference_id: null,
        note: null,
        preferences: {
          email_unsubscribed: false,
        },
        creation_source: 'THIRD_PARTY',
        group_ids: [],
        segment_ids: [],
        version: 1,
      }],
    };

    console.log('Created customer:', customerResponse);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(customerResponse),
    };
  } catch (error) {
    throw new Error(`Customer creation failed: ${error}`);
  }
}

async function handleCreatePayment(body: any, headers: any) {
  try {
    const {
      amount, // in cents
      currency_code = 'NZD',
      description,
      reference_id,
      customer_id,
    } = body;

    // Generate a mock payment ID
    const paymentId = `PAY_${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    const orderId = `ORD_${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    
    // Create mock Square payment response
    const paymentResponse = {
      results: [{
        id: paymentId,
        order_id: orderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        amount_money: {
          amount: parseInt(amount),
          currency: currency_code,
        },
        status: 'COMPLETED',
        delay_duration: 'PT0S',
        source_type: 'CARD',
        card_details: {
          status: 'CAPTURED',
          card: {
            card_brand: 'VISA',
            last_4: '1111',
            exp_month: 12,
            exp_year: 2025,
            fingerprint: 'sq-1-fake-fingerprint',
            card_type: 'DEBIT',
            prepaid_type: 'NOT_PREPAID',
            bin: '411111',
          },
          entry_method: 'KEYED',
          cvv_status: 'CVV_ACCEPTED',
          avs_status: 'AVS_ACCEPTED',
          statement_description: 'TRADELINK SUBSCRIPTION',
          card_payment_timeline: {
            authorized_at: new Date().toISOString(),
            captured_at: new Date().toISOString(),
          },
        },
        location_id: 'LOCATION_123',
        reference_id,
        customer_id,
        employee_id: null,
        refund_ids: [],
        risk_evaluation: {
          created_at: new Date().toISOString(),
          risk_level: 'NORMAL',
        },
        processing_fee: [{
          effective_at: new Date().toISOString(),
          type: 'INITIAL',
          amount_money: {
            amount: Math.round(parseInt(amount) * 0.029), // 2.9% processing fee
            currency: currency_code,
          },
        }],
        receipt_number: `TR${Date.now()}`,
        receipt_url: `https://squareup.com/receipt/preview/${paymentId}`,
        delay_action: 'CANCEL',
        delayed_until: null,
        approved_money: {
          amount: parseInt(amount),
          currency: currency_code,
        },
        buyer_email_address: customer_id, // Using customer_id as email for mock
        billing_address: {
          address_line_1: '123 Business St',
          locality: 'Auckland',
          administrative_district_level_1: 'Auckland',
          postal_code: '1010',
          country: 'NZ',
        },
        shipping_address: null,
        note: description,
        statement_description_identifier: 'TRADELINK',
        capabilities: ['EDIT_TIP_AMOUNT', 'EDIT_TIP_AMOUNT_UP'],
        team_member_id: null,
        version_token: 'fake-version-token',
      }],
    };

    console.log('Created payment:', paymentResponse);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(paymentResponse),
    };
  } catch (error) {
    throw new Error(`Payment creation failed: ${error}`);
  }
}

async function handleCreateSubscription(body: any, headers: any) {
  try {
    const {
      customer_id,
      plan_name,
      amount, // in cents
      currency_code = 'NZD',
      description,
      billing_cycle = 'MONTHLY',
      cardholder_name,
      billing_address,
      reference_id,
    } = body;

    // Generate mock subscription ID
    const subscriptionId = `SUB_${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    const initialPaymentId = `PAY_${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    
    // Calculate next billing date
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    // Create mock Square subscription response
    const subscriptionResponse = {
      results: [{
        id: subscriptionId,
        location_id: 'LOCATION_123',
        plan_id: `PLAN_${plan_name.toUpperCase().replace(/\s+/g, '_')}`,
        customer_id,
        start_date: new Date().toISOString().split('T')[0],
        charged_through_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        invoice_ids: [`INV_${Date.now()}`],
        price_override_money: {
          amount: parseInt(amount),
          currency: currency_code,
        },
        version: 1,
        created_at: new Date().toISOString(),
        card_id: `CARD_${Date.now()}`,
        timezone: 'Pacific/Auckland',
        source: {
          name: 'Tradelink Network',
        },
        initial_payment_id: initialPaymentId,
        // Mock next payment calculation
        phases: [{
          uid: 'phase-1',
          cadence: billing_cycle,
          periods: 1,
          order_template: {
            location_id: 'LOCATION_123',
            order: {
              location_id: 'LOCATION_123',
              line_items: [{
                name: plan_name,
                quantity: '1',
                base_price_money: {
                  amount: parseInt(amount),
                  currency: currency_code,
                },
              }],
            },
          },
        }],
        // Billing details
        monthly_billing_anchor_date: new Date().getDate(),
        next_payment_date: nextBilling.toISOString().split('T')[0],
        // Payment method
        payment_method: {
          type: 'CARD',
          card: {
            card_brand: 'VISA',
            last_4: '1111',
            exp_month: 12,
            exp_year: 2025,
            cardholder_name,
            billing_address,
          },
        },
      }],
    };

    console.log('Created subscription:', subscriptionResponse);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(subscriptionResponse),
    };
  } catch (error) {
    throw new Error(`Subscription creation failed: ${error}`);
  }
}

async function handleGetPayment(body: any, headers: any) {
  try {
    const { payment_id } = body;

    // Mock payment lookup response
    const paymentResponse = {
      results: [{
        id: payment_id,
        order_id: `ORD_${payment_id.replace('PAY_', '')}`,
        created_at: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago
        updated_at: new Date().toISOString(),
        amount_money: {
          amount: 2900, // $29.00 in cents
          currency: 'NZD',
        },
        status: 'COMPLETED',
        source_type: 'CARD',
        card_details: {
          status: 'CAPTURED',
          card: {
            card_brand: 'VISA',
            last_4: '1111',
            exp_month: 12,
            exp_year: 2025,
          },
          entry_method: 'KEYED',
          cvv_status: 'CVV_ACCEPTED',
          avs_status: 'AVS_ACCEPTED',
        },
        receipt_number: `TR${Date.now()}`,
        receipt_url: `https://squareup.com/receipt/preview/${payment_id}`,
        approved_money: {
          amount: 2900,
          currency: 'NZD',
        },
      }],
    };

    console.log('Retrieved payment:', paymentResponse);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(paymentResponse),
    };
  } catch (error) {
    throw new Error(`Payment lookup failed: ${error}`);
  }
}

async function handleCancelSubscription(body: any, headers: any) {
  try {
    const { subscription_id } = body;

    console.log('Cancelled subscription:', subscription_id);

    // Square returns 200 with updated subscription status for cancellation
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results: [{
          id: subscription_id,
          status: 'CANCELLED',
          cancelled_date: new Date().toISOString().split('T')[0],
        }],
      }),
    };
  } catch (error) {
    throw new Error(`Subscription cancellation failed: ${error}`);
  }
}

async function handleGetInvoices(body: any, headers: any) {
  try {
    const { customer_id } = body;

    // Mock invoice list response
    const invoicesResponse = {
      results: [
        {
          id: `INV_${Date.now()}`,
          invoice_number: `TL-${Date.now()}`,
          title: 'Tradelink Subscription',
          description: 'Monthly subscription payment',
          primary_recipient: {
            customer_id,
          },
          payment_requests: [{
            request_method: 'EMAIL',
            request_type: 'BALANCE',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tipping_enabled: false,
            automatic_payment_source: 'NONE',
            card_id: `CARD_${Date.now()}`,
            reminders: [],
          }],
          delivery_method: 'EMAIL',
          invoice_request_method: 'EMAIL',
          status: 'PAID',
          timezone: 'Pacific/Auckland',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          accepted_payment_methods: {
            card: true,
            square_gift_card: false,
            bank_account: false,
            buy_now_pay_later: false,
          },
          custom_fields: [],
          subscription_id: `SUB_${customer_id}`,
          sale_or_service_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_amount: 2900, // $29.00 in cents
          currency: 'NZD',
          paid_date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          download_url: `https://squareup.com/invoice/download/${Date.now()}`,
        },
        {
          id: `INV_${Date.now() - 1000}`,
          invoice_number: `TL-${Date.now() - 30 * 24 * 60 * 60 * 1000}`,
          title: 'Tradelink Subscription',
          description: 'Monthly subscription payment',
          primary_recipient: {
            customer_id,
          },
          payment_requests: [{
            request_method: 'EMAIL',
            request_type: 'BALANCE',
            due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tipping_enabled: false,
            automatic_payment_source: 'NONE',
            card_id: `CARD_${Date.now()}`,
            reminders: [],
          }],
          delivery_method: 'EMAIL',
          invoice_request_method: 'EMAIL',
          status: 'PAID',
          timezone: 'Pacific/Auckland',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
          accepted_payment_methods: {
            card: true,
            square_gift_card: false,
            bank_account: false,
            buy_now_pay_later: false,
          },
          custom_fields: [],
          subscription_id: `SUB_${customer_id}`,
          sale_or_service_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_amount: 2900, // $29.00 in cents
          currency: 'NZD',
          paid_date: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          download_url: `https://squareup.com/invoice/download/${Date.now() - 1000}`,
        },
      ],
    };

    console.log('Retrieved invoices for customer:', customer_id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(invoicesResponse),
    };
  } catch (error) {
    throw new Error(`Invoice lookup failed: ${error}`);
  }
}

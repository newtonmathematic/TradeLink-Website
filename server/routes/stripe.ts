import type { Request, Response } from "express";
import Stripe from "stripe";
import { query } from "../db";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    })
  : null;

function getPriceForPlan(plan: "plus" | "pro") {
  const priceMap: Record<string, string | undefined> = {
    plus: process.env.STRIPE_PRICE_PLUS,
    pro: process.env.STRIPE_PRICE_PRO,
  };
  return priceMap[plan];
}

async function updateUserPlan(userId: string, plan: "free" | "plus" | "pro") {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/app_users?id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ plan }),
      });
    } catch (err) {
      console.error("Failed to update Supabase app_users plan:", err);
    }
  }

  try {
    await query("UPDATE public.app_users SET plan = $1 WHERE id = $2", [
      plan,
      userId,
    ]);
  } catch (err) {
    console.error("Failed to update primary DB plan:", err);
  }
}

export async function handleCreateStripeCheckoutSession(
  req: Request,
  res: Response,
) {
  try {
    if (!stripe) {
      return res
        .status(500)
        .json({ ok: false, error: "stripe_not_configured" });
    }

    const rawBody = req.body;
    let payload: unknown = rawBody;

    if (typeof rawBody === "string" && rawBody.trim().length > 0) {
      try {
        payload = JSON.parse(rawBody);
      } catch (err) {
        console.error("Failed to parse checkout payload", err);
        return res.status(400).json({ ok: false, error: "invalid_json" });
      }
    } else if (Buffer.isBuffer(rawBody)) {
      const text = rawBody.toString("utf8");
      if (text.trim().length > 0) {
        try {
          payload = JSON.parse(text);
        } catch (err) {
          console.error("Failed to parse buffer checkout payload", err);
          return res.status(400).json({ ok: false, error: "invalid_json" });
        }
      } else {
        payload = {};
      }
    }

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ ok: false, error: "invalid_request" });
    }

    const { plan, userId, email, successUrl, cancelUrl } = payload as {
      plan?: string;
      userId?: string;
      email?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (plan !== "plus" && plan !== "pro") {
      return res.status(400).json({ ok: false, error: "invalid_request" });
    }

    if (!userId || !email) {
      return res.status(400).json({ ok: false, error: "invalid_request" });
    }

    const normalizedPlan = plan as "plus" | "pro";

    const priceId = getPriceForPlan(normalizedPlan);
    if (!priceId) {
      return res.status(500).json({ ok: false, error: "missing_price_id" });
    }

    const origin = successUrl
      ? undefined
      : `${req.protocol}://${req.get("host") ?? ""}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
          plan: normalizedPlan,
        },
      },
      metadata: {
        supabase_user_id: userId,
        plan: normalizedPlan,
      },
      allow_promotion_codes: true,
      success_url:
        successUrl ||
        `${origin}/signup/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${origin}/signup?plan=${normalizedPlan}&checkout=cancelled`,
    });

    return res.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("create checkout session error", err);
    return res.status(500).json({ ok: false, error: "stripe_error" });
  }
}

export async function handleGetStripeCheckoutSession(
  req: Request,
  res: Response,
) {
  try {
    if (!stripe) {
      return res
        .status(500)
        .json({ ok: false, error: "stripe_not_configured" });
    }

    const sessionId = String(req.query.session_id || "");
    if (!sessionId) {
      return res.status(400).json({ ok: false, error: "missing_session" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    return res.json({
      ok: true,
      data: {
        id: session.id,
        status: session.status,
        customerEmail:
          session.customer_details?.email || session.customer_email || null,
        plan: (session.metadata?.plan as "plus" | "pro" | undefined) || null,
        subscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id || null,
      },
    });
  } catch (err) {
    console.error("retrieve checkout session error", err);
    return res.status(500).json({ ok: false, error: "stripe_error" });
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe || !webhookSecret) {
    return res.status(500).json({ ok: false, error: "webhook_not_configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Stripe webhook signature verification failed", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const plan =
          (session.metadata?.plan as "plus" | "pro" | undefined) || null;
        const userId =
          (session.metadata?.supabase_user_id as string | undefined) || null;
        if (plan && (plan === "plus" || plan === "pro") && userId) {
          await updateUserPlan(userId, plan);
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const planPrice = subscription.items.data[0]?.price?.id;
        const metadataPlan =
          (subscription.metadata?.plan as "plus" | "pro" | undefined) || null;
        const userId =
          (subscription.metadata?.supabase_user_id as string | undefined) ||
          null;
        let plan: "plus" | "pro" | null = metadataPlan || null;
        if (!plan && planPrice) {
          if (planPrice === process.env.STRIPE_PRICE_PLUS) plan = "plus";
          if (planPrice === process.env.STRIPE_PRICE_PRO) plan = "pro";
        }
        if (plan && userId) {
          await updateUserPlan(userId, plan);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription;
        const subscriptionId =
          typeof subscription === "string" ? subscription : subscription?.id;
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            const userId =
              (sub.metadata?.supabase_user_id as string | undefined) || null;
            if (userId) {
              await updateUserPlan(userId, "free");
            }
          } catch (err) {
            console.error("Failed to downgrade after payment failure", err);
          }
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error", err);
    return res.status(500).json({ ok: false });
  }

  return res.json({ received: true });
}

import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleContact } from "./routes/contact";
import {
  handleGenerateProposalDraft,
  handleProposalNotify,
} from "./routes/proposals";
import {
  handleCreateProposal,
  handleGetProposal,
  handleListProposals,
  handleMarkNotificationRead,
  handleProposalAction,
  handleProposalBlock,
  handleProposalMessage,
  handleProposalNegotiation,
  handleProposalNotifications,
  handleProposalReport,
} from "./routes/proposal-management";
import {
  handleForgotPassword,
  handleValidateReset,
  handleResetPassword,
} from "./routes/auth";
import {
  handleSyncSignup,
  handleDeleteUser,
  handleListUsers,
  handleUpdateUser,
  handleGetUser,
} from "./routes/users";
import { handleDiscoveryList } from "./routes/discovery";
import {
  handleCreateStripeCheckoutSession,
  handleGetStripeCheckoutSession,
  handleStripeWebhook,
} from "./routes/stripe";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // Stripe webhook must use raw body
  app.post(
    "/api/payments/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook,
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/contact", handleContact);
  app.post("/api/proposals/notify", handleProposalNotify);
  app.post("/api/proposals/generate", handleGenerateProposalDraft);
  app.get("/api/proposals", handleListProposals);
  app.post("/api/proposals", handleCreateProposal);
  app.get("/api/proposals/notifications", handleProposalNotifications);
  app.post("/api/proposals/notifications/:id/read", handleMarkNotificationRead);
  app.get("/api/proposals/:id", handleGetProposal);
  app.post("/api/proposals/:id/actions", handleProposalAction);
  app.post("/api/proposals/:id/negotiations", handleProposalNegotiation);
  app.post("/api/proposals/:id/messages", handleProposalMessage);
  app.post("/api/proposals/:id/report", handleProposalReport);
  app.post("/api/proposals/:id/block", handleProposalBlock);
  app.post("/api/auth/forgot-password", handleForgotPassword);
  app.post("/api/auth/validate-reset", handleValidateReset);
  app.post("/api/auth/reset-password", handleResetPassword);
  app.post("/api/payments/stripe/checkout", handleCreateStripeCheckoutSession);
  app.get("/api/payments/stripe/session", handleGetStripeCheckoutSession);
  app.get("/api/discovery/businesses", handleDiscoveryList);
  app.post("/api/users/sync-signup", handleSyncSignup);
  app.get("/api/admin/users", handleListUsers);
  app.get("/api/users/:id", handleGetUser);
  app.patch("/api/users/:id", handleUpdateUser);
  app.delete("/api/users/:id", handleDeleteUser);

  // Inspect key env values without leaking secrets
  app.get("/api/debug/env", (_req, res) => {
    const redact = (v?: string) => (v ? true : false);
    res.json({
      FROM_EMAIL: process.env.FROM_EMAIL || null,
      SUPABASE_URL: process.env.SUPABASE_URL || null,
      SUPABASE_KEY_present: redact(process.env.SUPABASE_KEY),
      SUPABASE_SERVICE_ROLE_KEY_present: redact(
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      ),
      DATABASE_URL_present: redact(process.env.DATABASE_URL),
      NODE_ENV: process.env.NODE_ENV || null,
    });
  });

  return app;
}

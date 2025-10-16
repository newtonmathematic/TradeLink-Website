import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import { z } from "zod";
import { randomBytes } from "node:crypto";

const resetTokens: Record<string, { email: string; exp: number }> = {};

const forgotSchema = z.object({ email: z.string().email() });
const validateSchema = z.object({ token: z.string().min(16) });
const resetSchema = z.object({ token: z.string().min(16) });

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !port || !user || !pass) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function makeToken() {
  return randomBytes(24).toString("hex");
}

export async function handleForgotPassword(req: Request, res: Response) {
  try {
    const parsed = forgotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ ok: false, errors: parsed.error.flatten() });
    }

    const { email } = parsed.data;
    const token = makeToken();
    const exp = Date.now() + 60 * 60 * 1000; // 1 hour
    resetTokens[token] = { email, exp };

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const transporter = getTransport();
    const fromAddress = process.env.FROM_EMAIL || "no-reply@tradelink.app";

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#111827;">
        <h2 style="margin:0 0 12px;">Reset your password</h2>
        <p style="margin:0 0 16px;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetLink}" style="display:inline-block; padding:10px 16px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px;">Reset Password</a></p>
        <p style="margin-top:16px; color:#6b7280;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
      to: email,
      from: fromAddress,
      subject: "Tradelink password reset",
      html,
      text: `Reset your password: ${resetLink}`,
    });

    return res.json({ ok: true });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: "Failed to process request" });
  }
}

export async function handleValidateReset(req: Request, res: Response) {
  try {
    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false });
    }
    const { token } = parsed.data;
    const record = resetTokens[token];
    if (!record || record.exp < Date.now()) {
      return res.status(400).json({ ok: false });
    }
    return res.json({ ok: true, email: record.email });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
}

export async function handleResetPassword(req: Request, res: Response) {
  try {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false });
    }
    const { token } = parsed.data;
    const record = resetTokens[token];
    if (!record || record.exp < Date.now()) {
      return res.status(400).json({ ok: false });
    }
    delete resetTokens[token];
    return res.json({ ok: true, email: record.email });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
}

import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import { z } from "zod";

const CONTACT_RECIPIENT =
  process.env.CONTACT_RECIPIENT || "tradelinknetworkdev@gmail.com";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message should be at least 10 characters"),
  company: z.string().optional().default(""),
  phone: z.string().optional().default(""),
});

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !port || !user || !pass) {
    // Fallback for development: do not error; emulate sending
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function handleContact(req: Request, res: Response) {
  try {
    const payload =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ ok: false, errors: parsed.error.flatten() });
    }

    const { name, email, subject, message, company, phone } = parsed.data;

    const transporter = getTransport();

    const smtpUser = process.env.SMTP_USER;
    const fromAddress = process.env.FROM_EMAIL || smtpUser || email;

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#111827;">
        <h2 style="margin:0 0 12px;">New contact form submission</h2>
        <p style="margin:0 0 16px;">You received a new message from the website contact form.</p>
        <table style="border-collapse: collapse; width:100%;">
          <tbody>
            <tr><td style="padding:6px 0; width:140px; color:#6b7280;">Name</td><td style="padding:6px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:6px 0; width:140px; color:#6b7280;">Email</td><td style="padding:6px 0;">${escapeHtml(email)}</td></tr>
            ${company ? `<tr><td style="padding:6px 0; width:140px; color:#6b7280;">Company</td><td style="padding:6px 0;">${escapeHtml(company)}</td></tr>` : ""}
            ${phone ? `<tr><td style=\"padding:6px 0; width:140px; color:#6b7280;\">Phone</td><td style=\"padding:6px 0;\">${escapeHtml(phone)}</td></tr>` : ""}
            <tr><td style="padding:6px 0; width:140px; color:#6b7280;">Subject</td><td style="padding:6px 0;">${escapeHtml(subject)}</td></tr>
          </tbody>
        </table>
        <div style="margin-top:16px; padding:12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; white-space:pre-wrap;">${escapeHtml(message)}</div>
      </div>
    `;

    await transporter.sendMail({
      to: CONTACT_RECIPIENT,
      from: fromAddress,
      replyTo: email,
      subject: `Contact: ${subject}`,
      html,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || "-"}\nPhone: ${phone || "-"}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Contact form send error", err);
    const message =
      typeof err?.message === "string" ? err.message : "Failed to send message";
    return res.status(500).json({ ok: false, error: message });
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

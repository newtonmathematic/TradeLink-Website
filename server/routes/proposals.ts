import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import { z } from "zod";

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  fromName: z.string().optional(),
  replyTo: z.string().email().optional(),
});

const inlineFieldSchema = z.object({
  key: z.string().trim().min(1, "Field key is required"),
  label: z.string().trim().min(1, "Field label is required"),
  value: z
    .string()
    .trim()
    .optional()
    .transform((val) => val ?? ""),
});

const generationSchema = z.object({
  outline: z
    .string()
    .trim()
    .min(10, "Outline should be at least 10 characters."),
  fields: z.array(inlineFieldSchema).optional(),
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
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function handleProposalNotify(req: Request, res: Response) {
  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ ok: false, errors: parsed.error.flatten() });
    }

    const { to, subject, html, text, fromName, replyTo } = parsed.data;
    const transporter = getTransport();

    const fromAddress = process.env.FROM_EMAIL || "no-reply@tradelink.app";

    await transporter.sendMail({
      to,
      from: fromName ? `${fromName} <${fromAddress}>` : fromAddress,
      replyTo,
      subject,
      html,
      text,
    });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to send email" });
  }
}

type InlineField = z.infer<typeof inlineFieldSchema>;

type SentenceTextPart = {
  type: "text";
  value: string;
};

type SentenceFieldPart = {
  type: "field";
  key: string;
  label: string;
  value: string;
};

type SentencePart = SentenceTextPart | SentenceFieldPart;

const DEFAULT_HUGGINGFACE_MODEL = "mistralai/Mistral-7B-Instruct";
const FALLBACK_HUGGINGFACE_MODELS: string[] = [
  DEFAULT_HUGGINGFACE_MODEL,
  "HuggingFaceH4/zephyr-7b-beta",
  "tiiuae/falcon-7b-instruct",
  "google/gemma-2b-it",
];

function normaliseModelName(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasMatchingQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  const unwrapped = hasMatchingQuotes ? trimmed.slice(1, -1).trim() : trimmed;
  return unwrapped.length ? unwrapped : null;
}

function buildAiInstructions(outline: string, fields?: InlineField[]) {
  const base: string[] = [
    "You are an expert partnership proposal writer. Produce a single-sentence summary as JSON with this exact structure:",
    '{\n  "title": string,\n  "sentence": [\n    { "type": "text", "value": string },\n    { "type": "field", "key": string, "label": string, "value": string }\n  ]\n}',
    'Guidelines:\n- The combined "sentence" items must read as one grammatically correct sentence.\n- Provide between 2 and 4 items where "type" is "field".\n- Field keys must be descriptive snake_case identifiers.\n- Field labels must be human-readable titles.\n- Keep the sentence under 60 words and avoid bullet points or lists.',
    `Outline:\n${outline.trim()}`,
  ];

  if (fields && fields.length > 0) {
    base.push(
      "Existing editable fields (JSON array):\n" +
        JSON.stringify(
          fields.map((field) => ({
            key: field.key,
            label: field.label,
            value: field.value ?? "",
          })),
        ),
    );
    base.push(
      "Reuse these keys and labels when possible, updating their values with stronger wording if needed.",
    );
  } else {
    base.push(
      "Define clear field keys such as client_name, primary_goal, investment_amount, or timeline. Each field value should be concise and editable.",
    );
  }

  base.push("Return only JSON without markdown fences or commentary.");
  return base.join("\n\n");
}

function fallbackSentenceParts(
  outline: string,
  fields?: InlineField[],
): SentencePart[] {
  const trimmed = outline.replace(/\s+/g, " ").trim();
  const safeValue = trimmed || "a mutually beneficial partnership opportunity";
  const reusableField = fields?.find(
    (field) => field.key.trim().length > 0 && field.label.trim().length > 0,
  );

  const fieldPart: SentenceFieldPart = reusableField
    ? {
        type: "field",
        key: reusableField.key,
        label: reusableField.label,
        value: reusableField.value ?? safeValue,
      }
    : {
        type: "field",
        key: "key_focus",
        label: "Key Focus",
        value: safeValue,
      };

  return [
    { type: "text", value: "This proposal covers " },
    fieldPart,
    { type: "text", value: "." },
  ];
}

function combineSentenceParts(parts: SentencePart[]): string {
  return parts
    .map((part) => (part.type === "text" ? part.value : (part.value ?? "")))
    .join("");
}

function extractGeneratedText(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const candidate = parsed.find(
        (entry) => typeof entry?.generated_text === "string",
      );
      if (candidate?.generated_text) return candidate.generated_text as string;
    }
    if (parsed && typeof parsed.generated_text === "string") {
      return parsed.generated_text as string;
    }
    if (typeof parsed === "string") {
      return parsed;
    }
    return raw;
  } catch {
    return raw;
  }
}

function parseJsonBlock(text: string): any {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON block detected");
  }
  const jsonSegment = cleaned.slice(start, end + 1);
  return JSON.parse(jsonSegment);
}

export async function handleGenerateProposalDraft(req: Request, res: Response) {
  try {
    const rawBody = req.body ?? {};

    const normalisePayload = (
      body: unknown,
    ): Record<string, unknown> | null => {
      if (typeof body === "string") {
        try {
          return JSON.parse(body);
        } catch (parseErr) {
          console.warn("generate-proposal invalid JSON payload", parseErr);
          return null;
        }
      }

      if (Buffer.isBuffer(body)) {
        try {
          return JSON.parse(body.toString("utf8"));
        } catch (parseErr) {
          console.warn("generate-proposal invalid buffer payload", parseErr);
          return null;
        }
      }

      if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        const keys = Object.keys(record);
        const numericKeys = keys.filter((key) => /^\d+$/.test(key));

        const looksLikeSerializedChars =
          numericKeys.length === keys.length &&
          keys.length > 0 &&
          numericKeys.every((key) => {
            const value = record[key];
            return typeof value === "string" && value.length === 1;
          });

        if (looksLikeSerializedChars) {
          const stitched = numericKeys
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => record[key] as string)
            .join("");
          try {
            return JSON.parse(stitched);
          } catch (parseErr) {
            console.warn(
              "generate-proposal invalid stitched payload",
              parseErr,
            );
            return null;
          }
        }

        return record;
      }

      return {};
    };

    const incoming = normalisePayload(rawBody);

    if (!incoming) {
      return res.status(400).json({
        ok: false,
        errors: { formErrors: ["invalid_json"], fieldErrors: {} },
      });
    }

    const candidateOutline =
      typeof incoming.outline === "string"
        ? incoming.outline
        : typeof incoming.prompt === "string"
          ? incoming.prompt
          : "";

    const parsed = generationSchema.safeParse({
      outline: candidateOutline,
      fields: incoming.fields,
    });

    if (!parsed.success) {
      console.warn("generate-proposal validation failed", {
        bodyKeys: Object.keys(incoming || {}),
        errors: parsed.error.flatten(),
      });
      return res
        .status(400)
        .json({ ok: false, errors: parsed.error.flatten() });
    }

    const { outline, fields } = parsed.data;

    const token = process.env.HUGGINGFACE_TOKEN;
    if (!token) {
      return res
        .status(500)
        .json({ ok: false, error: "huggingface_not_configured" });
    }

    const configuredModel = normaliseModelName(process.env.HUGGINGFACE_MODEL);
    const modelsToTry: string[] = [];

    if (configuredModel) {
      modelsToTry.push(configuredModel);
    }

    for (const fallbackModel of FALLBACK_HUGGINGFACE_MODELS) {
      if (!modelsToTry.includes(fallbackModel)) {
        modelsToTry.push(fallbackModel);
      }
    }

    const requestBody = {
      inputs: buildAiInstructions(outline, fields),
      parameters: { max_new_tokens: 320, temperature: 0.35 },
      options: { wait_for_model: true },
    };

    let rawOutput: string | null = null;
    let selectedModel: string | null = configuredModel ?? null;
    let lastError: { status: number; body: string } | null = null;

    for (const candidateModel of modelsToTry) {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${candidateModel}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (response.ok) {
        rawOutput = await response.text();
        selectedModel = candidateModel;
        break;
      }

      const errText = await response.text();
      console.error(
        "Hugging Face inference error",
        candidateModel,
        response.status,
        errText,
      );
      lastError = { status: response.status, body: errText };
    }

    if (!rawOutput) {
      console.warn("All Hugging Face models failed, using local fallback", {
        attemptedModels: modelsToTry,
        lastError,
      });
      const sentenceParts = fallbackSentenceParts(outline, fields);
      return res.json({
        ok: true,
        data: {
          title: "",
          sentence: sentenceParts,
          combinedSentence: combineSentenceParts(sentenceParts),
        },
        warning: "ai_unavailable",
        raw: null,
        modelUsed: null,
        lastError,
      });
    }

    const raw = rawOutput;
    const resolvedModel = selectedModel ?? DEFAULT_HUGGINGFACE_MODEL;
    const modelFallbackApplied =
      Boolean(configuredModel) && resolvedModel !== configuredModel;
    let parsedJson: any | null = null;
    let usedFallback = false;

    try {
      const generatedText = extractGeneratedText(raw);
      parsedJson = parseJsonBlock(generatedText);
    } catch (err) {
      console.warn("Failed to parse AI JSON output", err);
      usedFallback = true;
    }

    let sentenceParts: SentencePart[] = [];

    if (parsedJson && Array.isArray(parsedJson.sentence)) {
      sentenceParts = parsedJson.sentence
        .map((entry: any): SentencePart | null => {
          if (!entry || typeof entry !== "object") return null;
          if (entry.type === "text" && typeof entry.value === "string") {
            return { type: "text", value: entry.value };
          }
          if (
            entry.type === "field" &&
            typeof entry.key === "string" &&
            typeof entry.label === "string" &&
            typeof entry.value === "string"
          ) {
            return {
              type: "field",
              key: entry.key,
              label: entry.label,
              value: entry.value,
            };
          }
          return null;
        })
        .filter((part): part is SentencePart => part !== null);
    }

    if (sentenceParts.length === 0) {
      sentenceParts = fallbackSentenceParts(outline, fields);
      usedFallback = true;
    }

    const combinedSentence = combineSentenceParts(sentenceParts);
    const title =
      parsedJson && typeof parsedJson.title === "string"
        ? parsedJson.title.trim()
        : "";

    return res.json({
      ok: true,
      data: {
        title,
        sentence: sentenceParts,
        combinedSentence,
      },
      warning: usedFallback
        ? "used_fallback"
        : modelFallbackApplied
          ? "model_fallback"
          : undefined,
      raw,
      modelUsed: resolvedModel,
    });
  } catch (err) {
    console.error("handleGenerateProposalDraft error", err);
    return res.status(500).json({ ok: false, error: "unexpected" });
  }
}

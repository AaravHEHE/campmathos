// Shared Gmail SMTP sender for all Mathos camp edge functions.
// Sends from campmathos@gmail.com using a Google App Password.
// Limit: ~500 recipients/day for free Gmail accounts.
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const GMAIL_USER = "campmathos@gmail.com";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

export const FROM_NAME = "Mathos Camp";
export const FROM_EMAIL = GMAIL_USER;

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

let cachedClient: SMTPClient | null = null;

function getClient(): SMTPClient {
  if (!GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_APP_PASSWORD is not configured");
  }
  if (cachedClient) return cachedClient;
  cachedClient = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: GMAIL_USER,
        password: GMAIL_APP_PASSWORD,
      },
    },
    pool: {
      size: 2,
      timeout: 60_000,
    },
  });
  return cachedClient;
}

export async function sendGmail({ to, subject, html, replyTo }: SendArgs): Promise<void> {
  const client = getClient();
  await client.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    replyTo: replyTo ?? GMAIL_USER,
    subject,
    content: "auto",
    html,
  });
}

export async function closeGmail(): Promise<void> {
  if (cachedClient) {
    try {
      await cachedClient.close();
    } catch {
      // ignore
    }
    cachedClient = null;
  }
}

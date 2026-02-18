// Vercel Serverless Function: captures emails from the unlock form
// Emails are logged (visible in Vercel > Logs) and optionally forwarded to a Google Sheet

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, jobTitle, industry, rating } = req.body || {};

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const entry = {
      email,
      jobTitle: jobTitle || "",
      industry: industry || "",
      rating: rating || 0,
      timestamp: new Date().toISOString(),
    };

    // 1. Always log to Vercel function logs (visible in dashboard > Logs)
    console.log("[EMAIL_CAPTURE]", JSON.stringify(entry));

    // 2. Forward to Google Sheets webhook (if configured)
    //    To set up: Create a Google Apps Script web app that accepts POST requests
    //    and appends rows to a sheet. Set the URL as GOOGLE_SHEET_WEBHOOK in Vercel env vars.
    const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK;
    if (sheetWebhook) {
      try {
        await fetch(sheetWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
      } catch (webhookErr) {
        console.error("[WEBHOOK_ERROR]", webhookErr.message);
        // Don't fail the request if webhook fails
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[CAPTURE_ERROR]", err.message);
    return res.status(500).json({ error: "Server error" });
  }
}

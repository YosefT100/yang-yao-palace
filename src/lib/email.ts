export async function sendWelcomeEmail(to: string, courseName: string, courseLevel: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5ef;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ef;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#8B0000;padding:36px 40px;text-align:center;">
          <h1 style="margin:0;color:#D4AF37;font-size:28px;letter-spacing:4px;">YANG YAO PALACE</h1>
          <p style="margin:8px 0 0;color:rgba(212,175,55,0.7);font-size:13px;letter-spacing:2px;">CHINESE LANGUAGE ACADEMY</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="color:#8B0000;margin:0 0 16px;font-size:22px;">🎉 Welcome! Your journey begins.</h2>
          <p style="color:#3a1a00;line-height:1.7;margin:0 0 12px;">
            Thank you for enrolling in <strong>${courseName} (${courseLevel})</strong>. We're thrilled to have you join Yang Yao Palace and can't wait to guide you through your Mandarin journey.
          </p>
          <div style="border-left:3px solid #D4AF37;padding-left:16px;margin:24px 0;color:#3a1a00;font-style:italic;">
            学而不思则罔 — "Learning without reflection is wasted effort." — Confucius
          </div>

          <!-- What's Next -->
          <h3 style="color:#8B0000;margin:28px 0 16px;font-size:17px;border-bottom:1px solid #f0e8d0;padding-bottom:8px;">What's Next?</h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;vertical-align:top;">
              <span style="font-size:20px;">📱</span>
              <strong style="color:#3a1a00;margin-left:10px;">Join your WhatsApp / WeChat group</strong>
              <p style="margin:4px 0 0 30px;color:#666;font-size:14px;">[WHATSAPP_LINK_PLACEHOLDER]</p>
            </td></tr>
            <tr><td style="padding:10px 0;vertical-align:top;">
              <span style="font-size:20px;">📅</span>
              <strong style="color:#3a1a00;margin-left:10px;">Your course starts</strong>
              <p style="margin:4px 0 0 30px;color:#666;font-size:14px;">[START_DATE_PLACEHOLDER]</p>
            </td></tr>
            <tr><td style="padding:10px 0;vertical-align:top;">
              <span style="font-size:20px;">🌐</span>
              <strong style="color:#3a1a00;margin-left:10px;">Visit your student dashboard</strong>
              <p style="margin:4px 0 0 30px;font-size:14px;">
                <a href="https://yang-yao-palace.vercel.app/student" style="color:#8B0000;">https://yang-yao-palace.vercel.app/student</a>
              </p>
            </td></tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin:32px 0;">
            <a href="https://yang-yao-palace.vercel.app/student"
               style="background:#8B0000;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;letter-spacing:1px;display:inline-block;">
              Go to My Dashboard →
            </a>
          </div>

          <!-- Contact -->
          <h3 style="color:#8B0000;margin:28px 0 8px;font-size:15px;">Questions?</h3>
          <p style="color:#666;font-size:14px;margin:0;">
            Reply to this email or contact us at <a href="mailto:yaseft32@gmail.com" style="color:#8B0000;">yaseft32@gmail.com</a>
          </p>

          <!-- Social -->
          <div style="text-align:center;margin:32px 0 8px;">
            <a href="#" style="color:#8B0000;text-decoration:none;margin:0 12px;font-size:14px;">Instagram</a>
            <span style="color:#D4AF37;">·</span>
            <a href="#" style="color:#8B0000;text-decoration:none;margin:0 12px;font-size:14px;">Facebook</a>
            <span style="color:#D4AF37;">·</span>
            <a href="#" style="color:#8B0000;text-decoration:none;margin:0 12px;font-size:14px;">TikTok</a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a0a00;padding:20px 40px;text-align:center;">
          <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;">© 2026 Yang Yao Palace. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Yang Yao Palace <no-reply@yangyaopalace.com>",
      to,
      subject: "🎉 Welcome to Yang Yao Palace – Your Journey Begins!",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
  }
}

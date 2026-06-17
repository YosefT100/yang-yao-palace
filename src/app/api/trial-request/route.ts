import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, level, message } = await req.json();

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Yang Yao Palace <onboarding@resend.dev>",
        to: "yaseft32@gmail.com",
        subject: `New Trial Request - ${name} (${level})`,
        html: `
          <h2>New Free Trial Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Level:</strong> ${level}</p>
          <p><strong>Message:</strong> ${message || "—"}</p>
        `,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trial request error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

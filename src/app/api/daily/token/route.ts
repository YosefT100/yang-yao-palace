import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roomName, isOwner } = await req.json();
    const res = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: isOwner,
          exp: Math.floor(Date.now() / 1000) + 7200,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error }, { status: res.status });
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error("Daily token error:", error);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}

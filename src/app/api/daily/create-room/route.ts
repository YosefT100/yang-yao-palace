import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roomName } = await req.json();
    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: { exp: Math.floor(Date.now() / 1000) + 7200, enable_recording: "cloud" },
      }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error }, { status: res.status });
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Daily create-room error:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const roomName = req.nextUrl.searchParams.get("roomName");
    if (!roomName) return NextResponse.json({ error: "roomName required" }, { status: 400 });

    const res = await fetch(`https://api.daily.co/v1/recordings?room_name=${encodeURIComponent(roomName)}`, {
      headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error }, { status: res.status });

    const recordings = (data.data ?? []).map((r: any) => ({
      id: r.id,
      duration: r.duration,
      download_link: r.download_link,
      created_at: r.created_at,
    }));
    return NextResponse.json({ recordings });
  } catch (error) {
    console.error("Daily recordings error:", error);
    return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
  }
}

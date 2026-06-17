import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { courseLevel, coursePrice, courseName } = await req.json();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Yang Yao Palace - ${courseName} (${courseLevel})` },
          unit_amount: coursePrice * 100,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/student?payment=success`,
      cancel_url: `${req.headers.get("origin")}/?payment=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

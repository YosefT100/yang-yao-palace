import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

// Creates a Stripe Checkout session for a student to pay for a group
// (monthly subscription, price taken from the course's level settings).
// Expects JSON body: { groupId: string }
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { groupId } = await request.json();
  if (!groupId) {
    return NextResponse.json({ error: "groupId is required" }, { status: 400 });
  }

  const { data: group } = await supabase
    .from("groups")
    .select("*, course:courses(*)")
    .eq("id", groupId)
    .single();

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Create (or fetch) a pending enrollment row for this student + group.
  const { data: enrollment, error: enrollErr } = await supabase
    .from("enrollments")
    .upsert(
      {
        student_id: auth.user.id,
        group_id: group.id,
        course_id: group.course_id,
        status: "pending",
        price_amount: group.course.price_amount,
        price_currency: group.course.price_currency,
      },
      { onConflict: "student_id,group_id" }
    )
    .select()
    .single();

  if (enrollErr || !enrollment) {
    return NextResponse.json({ error: enrollErr?.message ?? "Could not create enrollment" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: auth.user.email,
    line_items: [
      {
        price_data: {
          currency: group.course.price_currency.toLowerCase(),
          unit_amount: group.course.price_amount,
          recurring: { interval: "month" },
          product_data: {
            name: `Yang Yao Palace — ${group.course.level} (${group.name})`,
            description: group.course.description ?? undefined,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { enrollment_id: enrollment.id },
    success_url: `${siteUrl}/student?checkout=success`,
    cancel_url: `${siteUrl}/student?checkout=cancelled`,
  });

  await supabase
    .from("enrollments")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", enrollment.id);

  return NextResponse.json({ url: session.url });
}

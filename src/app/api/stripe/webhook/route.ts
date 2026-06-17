import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

// Stripe sends events here. Configure this URL (https://yourdomain.com/api/stripe/webhook)
// in the Stripe Dashboard -> Developers -> Webhooks, and set STRIPE_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const enrollmentId = session.metadata?.enrollment_id;
      if (enrollmentId) {
        await supabase
          .from("enrollments")
          .update({
            status: "active",
            stripe_customer_id: typeof session.customer === "string" ? session.customer : undefined,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : undefined,
          })
          .eq("id", enrollmentId);

        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("*")
          .eq("id", enrollmentId)
          .single();

        if (enrollment) {
          await supabase.from("payments").insert({
            enrollment_id: enrollmentId,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            amount: enrollment.price_amount,
            currency: enrollment.price_currency,
            status: "paid",
          });
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription;
      if (typeof subscriptionId === "string") {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("*")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (enrollment) {
          await supabase.from("payments").insert({
            enrollment_id: enrollment.id,
            stripe_payment_intent_id: typeof invoice.payment_intent === "string" ? invoice.payment_intent : null,
            amount: invoice.amount_paid,
            currency: invoice.currency.toUpperCase(),
            status: "paid",
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("enrollments")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

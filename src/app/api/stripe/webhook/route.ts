import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";
import { trackPayment } from "@/lib/tracking";

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

      // Send welcome email for all completed checkouts
      const email = session.customer_email ?? (session.customer_details?.email ?? null);
      if (email) {
        let courseName = "Your Course";
        let courseLevel = "";
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          const productName = lineItems.data[0]?.description ?? lineItems.data[0]?.price?.product as string ?? "";
          // product name format: "Yang Yao Palace - <name> (<level>)"
          const match = productName.match(/Yang Yao Palace - (.+?) \((.+?)\)/);
          if (match) { courseName = match[1]; courseLevel = match[2]; }
          else if (productName) { courseName = productName; }
        } catch {}
        await sendWelcomeEmail(email, courseName, courseLevel);
      }

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

          const [{ data: studentProfile }, { data: group }] = await Promise.all([
            supabase.from("profiles").select("full_name, email").eq("id", enrollment.student_id).single(),
            supabase.from("groups").select("name, course:courses(level)").eq("id", enrollment.group_id).single(),
          ]);
          void trackPayment({
            student_name: studentProfile?.full_name ?? "",
            student_email: studentProfile?.email ?? session.customer_email ?? "",
            amount: enrollment.price_amount / 100,
            hsk_level: (group?.course as unknown as { level?: string })?.level ?? "",
            group_name: group?.name ?? "",
            paid_at: new Date().toISOString(),
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

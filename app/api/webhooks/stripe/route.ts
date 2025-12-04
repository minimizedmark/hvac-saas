import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-01' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const resend = new Resend(process.env.RESEND_API_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);




export async function POST(req: Request) {
  const buf = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email!;
    const subscriptionId = session.subscription as string;

    // Atomic slot claim via RPC
    const { data: slot, error } = await supabase.rpc('claim_founding_slot', {
      p_email: email,
      p_stripe_sub_id: subscriptionId,
    });

    if (error || slot === -1) {
      // Sold out → refund immediately
      const paymentIntent = session.payment_intent as string;
      await stripe.refunds.create({ payment_intent: paymentIntent });
      console.log(`Refunded sold-out purchase for ${email}`);
      return new Response('Sold out – refunded', { status: 200 });
    }

    // Send welcome email + badge
    await resend.emails.send({
      from: 'Founding Member <founding@yourdomain.com>',
      to: email,
      subject: `You're Founding Member #${slot}! 🚀`,
      html: `
        <h1>Congratulations – You're In!</h1>
        <p>You are officially Founding Member #${slot} of Flow Platform.</p>
        <p>Lifetime Pro access at $1,495/year – forever.</p>
        <p>Dashboard coming in 72 hours. Watch your email.</p>
        <p>Thank you for believing in the vision.</p>
      `,
    });
  }

  return new Response('OK', { status: 200 });
}

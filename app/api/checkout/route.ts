import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2020-08-27' });

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_FOUNDING_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL || 'https://yourdomain.com'}/success`,
    cancel_url: `${process.env.NEXTAUTH_URL || 'https://yourdomain.com'}`,
    metadata: {
      type: 'founding_member',
    },
  });
  return NextResponse.json({ sessionId: session.id });
}

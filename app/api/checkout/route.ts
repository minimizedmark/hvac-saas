import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2023-10-16' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan = 'founding', tenantId, customerEmail, customerId } = body;

    // Determine price ID based on plan
    let priceId;
    let subscriptionType;
    
    if (plan === 'monthly') {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
      subscriptionType = 'monthly';
    } else if (plan === 'annual') {
      priceId = process.env.STRIPE_ANNUAL_PRICE_ID;
      subscriptionType = 'annual';
    } else {
      // Default to founding member
      priceId = process.env.STRIPE_FOUNDING_PRICE_ID;
      subscriptionType = 'founding_member';
    }

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${plan}` },
        { status: 400 }
      );
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`,
      metadata: {
        type: subscriptionType,
      },
    };

    // Add tenant context if provided
    if (tenantId) {
      sessionConfig.metadata!.tenant_id = tenantId;
    }

    // Link to existing customer if provided
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error('Checkout error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

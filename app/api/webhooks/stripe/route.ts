import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('[Webhook] Stripe not configured');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check for idempotency
    const { data: existingEvent } = await supabase
      .from('tenant_billing_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('[Webhook] Event already processed:', event.id);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Handle different event types
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    // Record event
    await supabase.from('tenant_billing_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      event_data: event.data.object,
      processed: true,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (tenant) {
    await supabase
      .from('tenants')
      .update({
        subscription_status: 'active',
        status: 'active',
      })
      .eq('id', tenant.id);

    console.log('[Webhook] Payment succeeded for tenant:', tenant.id);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (tenant) {
    await supabase
      .from('tenants')
      .update({
        subscription_status: 'past_due',
      })
      .eq('id', tenant.id);

    console.log('[Webhook] Payment failed for tenant:', tenant.id);
    // TODO: Send notification email
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (tenant) {
    const updates: any = {
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
    };

    if (subscription.trial_end) {
      updates.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
    }

    await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenant.id);

    console.log('[Webhook] Subscription updated for tenant:', tenant.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (tenant) {
    await supabase
      .from('tenants')
      .update({
        subscription_status: 'canceled',
        status: 'suspended',
      })
      .eq('id', tenant.id);

    console.log('[Webhook] Subscription canceled for tenant:', tenant.id);
    // TODO: Send notification email
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, email, name')
    .eq('stripe_customer_id', customerId)
    .single();

  if (tenant) {
    console.log('[Webhook] Trial ending soon for tenant:', tenant.id);
    // TODO: Send reminder email
  }
}

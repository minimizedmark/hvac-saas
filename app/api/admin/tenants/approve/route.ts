import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, this is an unprotected endpoint for demo purposes
    
    const body = await request.json();
    const { tenantId, plan = 'monthly', requestId } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId' },
        { status: 400 }
      );
    }

    // Validate plan
    if (!['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be monthly or annual' },
        { status: 400 }
      );
    }

    // Check for idempotency
    if (requestId) {
      const { data: existing } = await supabase
        .from('tenants')
        .select('id, status, stripe_subscription_id')
        .eq('id', tenantId)
        .eq('metadata->>approval_request_id', requestId)
        .single();

      if (existing && existing.status === 'approved') {
        return NextResponse.json({
          success: true,
          message: 'Tenant already approved (idempotent)',
          tenantId: existing.id,
          subscriptionId: existing.stripe_subscription_id,
        });
      }
    }

    // Get tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    if (tenant.status === 'approved' || tenant.status === 'active') {
      return NextResponse.json(
        { error: 'Tenant already approved' },
        { status: 409 }
      );
    }

    let stripeCustomerId = tenant.stripe_customer_id;
    let stripeSubscriptionId = tenant.stripe_subscription_id;
    let subscriptionStatus = null;

    // Create Stripe customer and subscription if keys are configured
    if (stripe) {
      try {
        // Create or retrieve Stripe customer
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: tenant.email,
            name: tenant.company_name || tenant.name,
            metadata: {
              tenant_id: tenant.id,
            },
          });
          stripeCustomerId = customer.id;
        }

        // Get price ID based on plan
        const priceId = plan === 'annual' 
          ? process.env.STRIPE_ANNUAL_PRICE_ID
          : process.env.STRIPE_MONTHLY_PRICE_ID;

        if (!priceId) {
          console.warn(`[Admin] ${plan.toUpperCase()} price ID not configured`);
        } else {
          // Create subscription with trial period
          const subscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            trial_period_days: 14,
            metadata: {
              tenant_id: tenant.id,
              plan,
            },
          });
          
          stripeSubscriptionId = subscription.id;
          subscriptionStatus = subscription.status;
        }
      } catch (stripeError: any) {
        console.error('[Admin] Stripe error:', stripeError.message);
        // Continue with approval even if Stripe fails
      }
    }

    // Update tenant status to approved
    const updates: any = {
      status: 'approved',
      approved_at: new Date().toISOString(),
      subscription_plan: plan,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      metadata: {
        ...(tenant.metadata || {}),
        approval_request_id: requestId || `auto_${Date.now()}`,
      },
    };

    if (stripeCustomerId) {
      updates.stripe_customer_id = stripeCustomerId;
    }

    if (stripeSubscriptionId) {
      updates.stripe_subscription_id = stripeSubscriptionId;
      updates.subscription_status = subscriptionStatus;
    }

    const { error: updateError } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId);

    if (updateError) {
      console.error('[Admin] Failed to update tenant:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve tenant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tenant approved successfully',
      tenantId,
      status: 'approved',
      plan,
      stripeCustomerId,
      subscriptionId: stripeSubscriptionId,
      trialEndsAt: updates.trial_ends_at,
    });
  } catch (error) {
    console.error('[Admin] Error approving tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

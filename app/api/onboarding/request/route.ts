import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runAgent } from '@/lib/agents/runner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, companyName, address, city, province, postalCode, metadata } = body;

    // Validate required fields
    if (!name || !email || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, companyName' },
        { status: 400 }
      );
    }

    // Check if tenant already exists
    const { data: existing } = await supabase
      .from('tenants')
      .select('id, status')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { 
          error: 'Tenant already exists',
          tenantId: existing.id,
          status: existing.status
        },
        { status: 409 }
      );
    }

    // Create tenant record with 'requested' status
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name,
        email,
        phone,
        company_name: companyName,
        address,
        city,
        province: province || 'Alberta',
        postal_code: postalCode,
        status: 'requested',
        metadata: metadata || {},
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      console.error('[Onboarding] Failed to create tenant:', tenantError);
      return NextResponse.json(
        { error: 'Failed to create tenant request' },
        { status: 500 }
      );
    }

    // Run agent analysis (async - doesn't block response)
    const agentPrompt = `
Analyze this HVAC contractor onboarding request:

Company: ${companyName}
Contact: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Location: ${city}, ${province || 'Alberta'}
Address: ${address || 'Not provided'}

Provide a recommendation on whether to approve this tenant for trial access.
    `.trim();

    try {
      const agentResult = await runAgent({
        agentType: 'onboarding_orchestrator',
        prompt: agentPrompt,
        tenantId: tenant.id,
        metadata: { source: 'onboarding_request' },
      });

      // Parse agent recommendation
      let recommendation: any = {};
      try {
        recommendation = JSON.parse(agentResult.content);
      } catch {
        recommendation = {
          recommendation: 'manual_review',
          confidence: agentResult.confidence,
          reason: agentResult.content,
        };
      }

      // Update tenant with agent recommendation
      await supabase
        .from('tenants')
        .update({
          agent_recommendation: recommendation,
          agent_confidence: agentResult.confidence,
          risk_score: recommendation.risk_score || 0.5,
        })
        .eq('id', tenant.id);

      return NextResponse.json({
        success: true,
        tenantId: tenant.id,
        status: 'requested',
        message: 'Onboarding request submitted successfully',
        agentAnalysis: {
          recommendation: recommendation.recommendation,
          confidence: agentResult.confidence,
          reason: recommendation.reason,
          shouldAutoExecute: agentResult.shouldAutoExecute,
        },
      });
    } catch (agentError) {
      console.error('[Onboarding] Agent analysis failed:', agentError);
      
      // Still return success - agent analysis is supplementary
      return NextResponse.json({
        success: true,
        tenantId: tenant.id,
        status: 'requested',
        message: 'Onboarding request submitted successfully (awaiting manual review)',
        agentAnalysis: {
          recommendation: 'manual_review',
          confidence: 0,
          reason: 'Agent analysis unavailable',
        },
      });
    }
  } catch (error) {
    console.error('[Onboarding] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

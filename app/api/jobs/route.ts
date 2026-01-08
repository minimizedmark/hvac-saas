import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      customerName,
      customerPhone,
      customerEmail,
      serviceAddress,
      city,
      postalCode,
      jobType,
      description,
      priority = 'medium',
      scheduledStart,
      scheduledEnd,
      estimatedValue,
    } = body;

    // Validate required fields
    if (!tenantId || !customerName || !serviceAddress || !jobType) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, customerName, serviceAddress, jobType' },
        { status: 400 }
      );
    }

    // Generate job number
    const jobNumber = `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        tenant_id: tenantId,
        job_number: jobNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        service_address: serviceAddress,
        city: city || 'Edmonton',
        postal_code: postalCode,
        job_type: jobType,
        description,
        priority,
        status: 'pending',
        scheduled_start: scheduledStart || null,
        scheduled_end: scheduledEnd || null,
        estimated_value: estimatedValue || null,
      })
      .select()
      .single();

    if (error || !job) {
      console.error('[Jobs] Failed to create job:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        jobNumber: job.job_number,
        customerName: job.customer_name,
        serviceAddress: job.service_address,
        jobType: job.job_type,
        priority: job.priority,
        status: job.status,
        scheduledStart: job.scheduled_start,
        createdAt: job.created_at,
      },
    });
  } catch (error) {
    console.error('[Jobs] Error creating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const assignedTechId = searchParams.get('assignedTechId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (assignedTechId) {
      query = query.eq('assigned_tech_id', assignedTechId);
    }

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('[Jobs] Failed to fetch jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[Jobs] Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

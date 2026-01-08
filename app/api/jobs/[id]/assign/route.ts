import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const body = await request.json();
    const { techId, truckId } = body;

    if (!techId) {
      return NextResponse.json(
        { error: 'Missing techId' },
        { status: 400 }
      );
    }

    // Get job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update job with assignment
    const updates: any = {
      assigned_tech_id: techId,
      status: job.status === 'pending' ? 'scheduled' : job.status,
    };

    if (truckId) {
      updates.assigned_truck_id = truckId;
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId);

    if (updateError) {
      console.error('[Jobs] Failed to assign job:', updateError);
      return NextResponse.json(
        { error: 'Failed to assign job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job assigned successfully',
      jobId,
      techId,
      truckId: truckId || null,
    });
  } catch (error) {
    console.error('[Jobs] Error assigning job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

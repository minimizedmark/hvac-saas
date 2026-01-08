import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const truckId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const since = searchParams.get('since'); // ISO timestamp

    // Build query
    let query = supabase
      .from('telemetry_recent')
      .select('*')
      .eq('truck_id', truckId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (since) {
      query = query.gte('recorded_at', since);
    }

    const { data: telemetry, error } = await query;

    if (error) {
      console.error('[GPS] Failed to fetch telemetry:', error);
      return NextResponse.json(
        { error: 'Failed to fetch telemetry' },
        { status: 500 }
      );
    }

    // Format telemetry data
    const formattedTelemetry = (telemetry || []).map(t => ({
      id: t.id,
      latitude: t.latitude,
      longitude: t.longitude,
      speed: t.speed,
      heading: t.heading,
      accuracy: t.accuracy,
      recordedAt: t.recorded_at,
      createdAt: t.created_at,
    }));

    return NextResponse.json({
      success: true,
      truckId,
      telemetry: formattedTelemetry,
      count: formattedTelemetry.length,
    });
  } catch (error) {
    console.error('[GPS] Error fetching telemetry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

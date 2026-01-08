import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceToken, latitude, longitude, speed, heading, accuracy, recordedAt } = body;

    // Validate required fields
    if (!deviceToken || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceToken, latitude, longitude' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Find truck by device token
    const { data: truck, error: truckError } = await supabase
      .from('trucks')
      .select('id, tenant_id')
      .eq('device_token', deviceToken)
      .single();

    if (truckError || !truck) {
      return NextResponse.json(
        { error: 'Invalid device token' },
        { status: 401 }
      );
    }

    const timestamp = recordedAt ? new Date(recordedAt).toISOString() : new Date().toISOString();

    // Update truck's last known location
    const { error: updateError } = await supabase
      .from('trucks')
      .update({
        last_known_location: `POINT(${longitude} ${latitude})`,
        last_location_update: timestamp,
      })
      .eq('id', truck.id);

    if (updateError) {
      console.error('[GPS] Failed to update truck location:', updateError);
    }

    // Insert telemetry record
    const { error: telemetryError } = await supabase
      .from('telemetry_recent')
      .insert({
        truck_id: truck.id,
        location: `POINT(${longitude} ${latitude})`,
        latitude,
        longitude,
        speed: speed || null,
        heading: heading || null,
        accuracy: accuracy || null,
        recorded_at: timestamp,
      });

    if (telemetryError) {
      console.error('[GPS] Failed to insert telemetry:', telemetryError);
      return NextResponse.json(
        { error: 'Failed to store telemetry data' },
        { status: 500 }
      );
    }

    // Clean up old telemetry (keep last 100 records per truck)
    // This runs async - doesn't block the response
    supabase
      .from('telemetry_recent')
      .delete()
      .eq('truck_id', truck.id)
      .lt('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
      truckId: truck.id,
      timestamp,
    });
  } catch (error) {
    console.error('[GPS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

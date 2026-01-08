import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status') || 'active';

    // Build query
    let query = supabase
      .from('trucks')
      .select('*')
      .order('truck_number', { ascending: true });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: trucks, error } = await query;

    if (error) {
      console.error('[GPS] Failed to fetch trucks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trucks' },
        { status: 500 }
      );
    }

    // Parse location points
    const trucksWithLocation = (trucks || []).map(truck => {
      let location = null;
      
      // Parse PostgreSQL POINT format if available
      if (truck.last_known_location) {
        // PostGIS POINT format: POINT(longitude latitude)
        const match = truck.last_known_location.toString().match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
        if (match) {
          location = {
            longitude: parseFloat(match[1]),
            latitude: parseFloat(match[2]),
          };
        }
      }

      return {
        id: truck.id,
        truckNumber: truck.truck_number,
        licensePlate: truck.license_plate,
        make: truck.make,
        model: truck.model,
        year: truck.year,
        status: truck.status,
        location,
        lastUpdate: truck.last_location_update,
        metadata: truck.metadata,
      };
    });

    return NextResponse.json({
      success: true,
      trucks: trucksWithLocation,
      count: trucksWithLocation.length,
    });
  } catch (error) {
    console.error('[GPS] Error fetching trucks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

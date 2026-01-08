import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, this is an unprotected endpoint for demo purposes
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'requested';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query tenants
    const query = supabase
      .from('tenants')
      .select('*', { count: 'exact' })
      .order('requested_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query.eq('status', status);
    }

    const { data: tenants, error, count } = await query;

    if (error) {
      console.error('[Admin] Failed to fetch tenants:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tenants: tenants || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[Admin] Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

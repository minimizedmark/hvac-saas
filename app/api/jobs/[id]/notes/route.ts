import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseInvoiceFromNotes } from '@/lib/invoicing/parser';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const body = await request.json();
    const { techId, noteType = 'general', content, workPerformed, partsList } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Missing content' },
        { status: 400 }
      );
    }

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

    const { data: note, error: noteError } = await supabase
      .from('tech_notes')
      .insert({
        job_id: jobId,
        tech_id: techId || null,
        note_type: noteType,
        content,
        work_performed: workPerformed || null,
        parts_list: partsList || null,
      })
      .select()
      .single();

    if (noteError || !note) {
      console.error('[Jobs] Failed to create tech note:', noteError);
      return NextResponse.json(
        { error: 'Failed to create tech note' },
        { status: 500 }
      );
    }

    let invoiceDraft = null;
    if (noteType === 'completion' || noteType === 'work_performed') {
      try {
        const parsed = await parseInvoiceFromNotes(content, jobId, job.tenant_id);
        
        if (parsed.confidence >= 0.5) {
          const invoiceNumber = \`INV-\${Date.now()}-\${Math.random().toString(36).substr(2, 4).toUpperCase()}\`;
          
          const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
              tenant_id: job.tenant_id,
              job_id: jobId,
              invoice_number: invoiceNumber,
              customer_name: job.customer_name,
              customer_email: job.customer_email,
              customer_phone: job.customer_phone,
              billing_address: job.service_address,
              subtotal: parsed.subtotal,
              tax_rate: parsed.taxRate,
              tax_amount: parsed.taxAmount,
              total: parsed.total,
              status: 'draft',
              generated_by: parsed.method,
              agent_confidence: parsed.confidence,
            })
            .select()
            .single();

          if (!invoiceError && invoice) {
            const lineItems = parsed.lineItems.map((item, index) => ({
              invoice_id: invoice.id,
              line_number: index + 1,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              line_total: item.lineTotal,
              item_type: item.itemType || 'other',
            }));

            if (lineItems.length > 0) {
              await supabase.from('invoice_line_items').insert(lineItems);
            }

            invoiceDraft = {
              id: invoice.id,
              invoiceNumber: invoice.invoice_number,
              total: invoice.total,
              confidence: parsed.confidence,
              method: parsed.method,
            };

            await supabase
              .from('tech_notes')
              .update({
                parsed_for_invoice: true,
                invoice_draft_id: invoice.id,
              })
              .eq('id', note.id);
          }
        }
      } catch (parseError) {
        console.error('[Jobs] Invoice parsing failed:', parseError);
      }
    }

    return NextResponse.json({
      success: true,
      note: {
        id: note.id,
        jobId: note.job_id,
        noteType: note.note_type,
        content: note.content,
        createdAt: note.created_at,
      },
      invoiceDraft,
    });
  } catch (error) {
    console.error('[Jobs] Error creating tech note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    const { data: notes, error } = await supabase
      .from('tech_notes')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Jobs] Failed to fetch notes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notes: notes || [],
    });
  } catch (error) {
    console.error('[Jobs] Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

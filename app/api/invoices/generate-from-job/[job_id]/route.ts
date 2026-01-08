import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseInvoiceFromNotes } from '@/lib/invoicing/parser';

export async function POST(
  request: NextRequest,
  { params }: { params: { job_id: string } }
) {
  try {
    const jobId = params.job_id;

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

    const { data: notes, error: notesError } = await supabase
      .from('tech_notes')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (notesError) {
      console.error('[Invoice] Failed to fetch notes:', notesError);
      return NextResponse.json(
        { error: 'Failed to fetch tech notes' },
        { status: 500 }
      );
    }

    if (!notes || notes.length === 0) {
      return NextResponse.json(
        { error: 'No tech notes found for this job' },
        { status: 404 }
      );
    }

    const combinedNotes = notes.map(n => n.content).join('\n\n');
    const parsed = await parseInvoiceFromNotes(combinedNotes, jobId, job.tenant_id);

    if (parsed.confidence < 0.3) {
      return NextResponse.json(
        { 
          error: 'Unable to generate invoice from notes',
          confidence: parsed.confidence,
          suggestion: 'Please provide more detailed information about work performed and parts used',
        },
        { status: 422 }
      );
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

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
        issue_date: new Date().toISOString().split('T')[0],
        generated_by: parsed.method,
        agent_confidence: parsed.confidence,
        notes: parsed.method === 'llm' ? 'Generated using AI assistant' : null,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('[Invoice] Failed to create invoice:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    if (parsed.lineItems.length > 0) {
      const lineItems = parsed.lineItems.map((item, index) => ({
        invoice_id: invoice.id,
        line_number: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
        item_type: item.itemType || 'other',
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems);

      if (lineItemsError) {
        console.error('[Invoice] Failed to create line items:', lineItemsError);
      }
    }

    await supabase
      .from('jobs')
      .update({ final_value: parsed.total })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        subtotal: invoice.subtotal,
        taxAmount: invoice.tax_amount,
        total: invoice.total,
        status: invoice.status,
        lineItems: parsed.lineItems,
        confidence: parsed.confidence,
        generatedBy: parsed.method,
      },
    });
  } catch (error) {
    console.error('[Invoice] Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Deterministic invoice parser with LLM fallback
import { runAgent } from '../agents/runner';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  itemType?: 'labor' | 'part' | 'service' | 'fee' | 'other';
}

export interface ParsedInvoice {
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  confidence: number;
  method: 'deterministic' | 'llm';
}

// Deterministic parser - tries to extract structured data from text
export function parseDeterministic(text: string): ParsedInvoice | null {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const lineItems: InvoiceLineItem[] = [];
  
  let subtotal = 0;
  let total = 0;
  let taxRate = 0.05; // Default GST in Alberta
  
  // Common patterns for line items
  const lineItemPattern = /^(.+?)\s+(\d+(?:\.\d+)?)\s*(?:x|@)\s*\$?([\d,]+\.?\d*)\s*=?\s*\$?([\d,]+\.?\d*)$/i;
  const simpleLinePattern = /^(.+?)\s+\$?([\d,]+\.?\d*)$/i;
  
  // Patterns for totals
  const subtotalPattern = /subtotal[:\s]+\$?([\d,]+\.?\d*)/i;
  const taxPattern = /(?:tax|gst)[:\s]+\$?([\d,]+\.?\d*)/i;
  const totalPattern = /(?:total|grand total)[:\s]+\$?([\d,]+\.?\d*)/i;
  
  for (const line of lines) {
    // Try to match line items
    let match = line.match(lineItemPattern);
    if (match) {
      const description = match[1].trim();
      const quantity = parseFloat(match[2]);
      const unitPrice = parseFloat(match[3].replace(/,/g, ''));
      const lineTotal = parseFloat(match[4].replace(/,/g, ''));
      
      // Detect item type from description
      let itemType: InvoiceLineItem['itemType'] = 'other';
      const desc = description.toLowerCase();
      if (desc.includes('labor') || desc.includes('service') || desc.includes('hour')) {
        itemType = 'labor';
      } else if (desc.includes('part') || desc.includes('filter') || desc.includes('refrigerant')) {
        itemType = 'part';
      } else if (desc.includes('trip') || desc.includes('fee') || desc.includes('charge')) {
        itemType = 'fee';
      }
      
      lineItems.push({ description, quantity, unitPrice, lineTotal, itemType });
      continue;
    }
    
    // Try simple format (description and price only)
    match = line.match(simpleLinePattern);
    if (match && !line.match(/subtotal|tax|total/i)) {
      const description = match[1].trim();
      const lineTotal = parseFloat(match[2].replace(/,/g, ''));
      
      let itemType: InvoiceLineItem['itemType'] = 'service';
      const desc = description.toLowerCase();
      if (desc.includes('labor') || desc.includes('hour')) {
        itemType = 'labor';
      } else if (desc.includes('part')) {
        itemType = 'part';
      }
      
      lineItems.push({
        description,
        quantity: 1,
        unitPrice: lineTotal,
        lineTotal,
        itemType,
      });
      continue;
    }
    
    // Check for totals
    match = line.match(subtotalPattern);
    if (match) {
      subtotal = parseFloat(match[1].replace(/,/g, ''));
      continue;
    }
    
    match = line.match(taxPattern);
    if (match) {
      const taxAmount = parseFloat(match[1].replace(/,/g, ''));
      if (subtotal > 0) {
        taxRate = taxAmount / subtotal;
      }
      continue;
    }
    
    match = line.match(totalPattern);
    if (match) {
      total = parseFloat(match[1].replace(/,/g, ''));
    }
  }
  
  // If we found line items, calculate totals
  if (lineItems.length > 0) {
    if (subtotal === 0) {
      subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    }
    
    const taxAmount = subtotal * taxRate;
    
    if (total === 0) {
      total = subtotal + taxAmount;
    }
    
    // Validate calculations
    const calculatedTotal = subtotal + (subtotal * taxRate);
    const totalDiff = Math.abs(calculatedTotal - total);
    
    // If difference is small (within $1), we have good confidence
    if (totalDiff < 1.0) {
      return {
        lineItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        confidence: 0.95,
        method: 'deterministic',
      };
    }
    
    // Moderate confidence if we have items but totals don't match perfectly
    if (lineItems.length >= 2) {
      return {
        lineItems,
        subtotal,
        taxRate,
        taxAmount,
        total: calculatedTotal, // Use calculated total
        confidence: 0.75,
        method: 'deterministic',
      };
    }
  }
  
  return null;
}

// Parse tech notes into invoice
export async function parseInvoiceFromNotes(
  notes: string,
  jobId?: string,
  tenantId?: string
): Promise<ParsedInvoice> {
  // Try deterministic first
  const deterministicResult = parseDeterministic(notes);
  
  if (deterministicResult && deterministicResult.confidence >= 0.75) {
    return deterministicResult;
  }
  
  // Fall back to LLM if deterministic confidence is low
  try {
    const result = await runAgent({
      agentType: 'invoice_parser',
      prompt: `Parse the following tech notes into an invoice:\n\n${notes}\n\nReturn a JSON object with line items, quantities, prices, and totals.`,
      tenantId,
      metadata: { jobId },
    });
    
    // Parse LLM response
    const parsed = JSON.parse(result.content);
    
    return {
      lineItems: parsed.lineItems || [],
      subtotal: parsed.subtotal || 0,
      taxRate: parsed.taxRate || 0.05,
      taxAmount: parsed.taxAmount || 0,
      total: parsed.total || 0,
      confidence: result.confidence,
      method: 'llm',
    };
  } catch (error) {
    console.error('[Invoice Parser] LLM fallback failed:', error);
    
    // Return deterministic result even if low confidence
    if (deterministicResult) {
      return deterministicResult;
    }
    
    // Last resort: return empty invoice with low confidence
    return {
      lineItems: [],
      subtotal: 0,
      taxRate: 0.05,
      taxAmount: 0,
      total: 0,
      confidence: 0.1,
      method: 'deterministic',
    };
  }
}

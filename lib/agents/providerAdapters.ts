// Provider adapters for AI models with cost tracking and token limits
import crypto from 'crypto';

export interface ProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens: number;
  costPerToken: number;
}

export interface ProviderRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ProviderResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
  confidence?: number;
}

// Redact PII from text
export function redactPII(text: string): string {
  if (process.env.REDACT_PII !== 'true') {
    return text;
  }

  let redacted = text;
  
  // Redact email addresses
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  
  // Redact phone numbers (various formats)
  redacted = redacted.replace(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE]');
  
  // Redact postal codes
  redacted = redacted.replace(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi, '[POSTAL]');
  
  // Redact credit card numbers
  redacted = redacted.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CC]');
  
  return redacted;
}

// Hash input for deduplication
export function hashInput(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Grok (xAI) adapter
export async function callGrok(request: ProviderRequest): Promise<ProviderResponse> {
  const apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROK_API_KEY not configured');
  }

  // TODO: Implement actual Grok API call when API is available
  // For now, return mock response
  console.log('[Grok] Would call with prompt:', request.prompt.substring(0, 100));
  
  throw new Error('Grok provider not yet implemented - waiting for API availability');
}

// Hugging Face adapter
export async function callHuggingFace(request: ProviderRequest): Promise<ProviderResponse> {
  const apiKey = process.env.HF_API_KEY;
  
  if (!apiKey) {
    throw new Error('HF_API_KEY not configured');
  }

  const model = process.env.HF_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
  const maxTokens = request.maxTokens || 1000;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: request.systemPrompt 
          ? `${request.systemPrompt}\n\nUser: ${request.prompt}\n\nAssistant:`
          : request.prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: request.temperature || 0.7,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    
    // Estimate tokens (rough approximation)
    const tokensUsed = Math.ceil(content.length / 4);
    
    return {
      content: content || '',
      provider: 'huggingface',
      model,
      tokensUsed,
      costUsd: tokensUsed * 0.00001, // Approximate cost
    };
  } catch (error) {
    console.error('[HuggingFace] Error:', error);
    throw error;
  }
}

// OpenAI adapter
export async function callOpenAI(request: ProviderRequest): Promise<ProviderResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const maxTokens = request.maxTokens || 1000;

  try {
    const messages: any[] = [];
    
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    
    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;
    
    // OpenAI pricing (approximate for gpt-4o-mini)
    const costPerToken = model.includes('gpt-4') ? 0.00003 : 0.000002;
    
    return {
      content,
      provider: 'openai',
      model,
      tokensUsed,
      costUsd: tokensUsed * costPerToken,
    };
  } catch (error) {
    console.error('[OpenAI] Error:', error);
    throw error;
  }
}

// Provider registry
export const providers = {
  grok: callGrok,
  hf: callHuggingFace,
  huggingface: callHuggingFace,
  openai: callOpenAI,
};

// Get available providers based on configured API keys
export function getAvailableProviders(): string[] {
  const available: string[] = ['deterministic']; // Always available
  
  if (process.env.GROK_API_KEY) available.push('grok');
  if (process.env.HF_API_KEY) available.push('hf');
  if (process.env.OPENAI_API_KEY) available.push('openai');
  
  return available;
}

// Agent runner with provider chain, confidence thresholds, and budget checks
import { promises as fs } from 'fs';
import path from 'path';
import { supabase } from '../supabase';
import { 
  providers, 
  redactPII, 
  hashInput, 
  getAvailableProviders,
  ProviderRequest,
  ProviderResponse 
} from './providerAdapters';

export interface AgentRequest {
  agentType: string;
  prompt: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export interface AgentResult {
  content: string;
  confidence: number;
  provider: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
  executionTimeMs: number;
  recommendation?: string;
  shouldAutoExecute: boolean;
}

// Circuit breaker state
let circuitBreakerOpen = false;
let lastCircuitCheck = Date.now();

// Load system prompt for agent type
async function loadSystemPrompt(agentType: string): Promise<string> {
  try {
    const promptPath = path.join(process.cwd(), 'ai', 'prompts', `${agentType}.system.txt`);
    const prompt = await fs.readFile(promptPath, 'utf-8');
    return prompt;
  } catch (error) {
    console.warn(`[Agent] No system prompt found for ${agentType}, using default`);
    return `You are an AI assistant helping with ${agentType} tasks. Provide clear, actionable recommendations.`;
  }
}

// Check monthly budget
async function checkMonthlyBudget(): Promise<{ allowed: boolean; spent: number; limit: number }> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Get budget limit from platform settings
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'monthly_model_budget_usd')
    .single();

  const budgetLimit = parseFloat(settings?.value || '100.00');

  // Sum costs for this month
  const { data: actions } = await supabase
    .from('agent_actions')
    .select('cost_usd')
    .gte('created_at', startOfMonth.toISOString());

  const totalSpent = actions?.reduce((sum, a) => sum + parseFloat(a.cost_usd || 0), 0) || 0;

  return {
    allowed: totalSpent < budgetLimit,
    spent: totalSpent,
    limit: budgetLimit,
  };
}

// Get confidence thresholds
async function getThresholds(): Promise<{ autoExec: number; suggest: number }> {
  const { data: autoExecSetting } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'auto_exec_threshold')
    .single();

  const { data: suggestSetting } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'suggest_threshold')
    .single();

  return {
    autoExec: parseFloat(autoExecSetting?.value || '0.95'),
    suggest: parseFloat(suggestSetting?.value || '0.75'),
  };
}

// Get provider order
async function getProviderOrder(): Promise<string[]> {
  const { data: setting } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'provider_order')
    .single();

  if (setting?.value) {
    return JSON.parse(setting.value);
  }

  return ['deterministic', 'grok', 'hf', 'openai'];
}

// Deterministic logic (always runs first)
function runDeterministic(agentType: string, prompt: string): { content: string; confidence: number } | null {
  // For onboarding, apply simple heuristics
  if (agentType === 'onboarding_orchestrator' || agentType === 'approval_suggestion') {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for red flags
    const redFlags = ['fraud', 'scam', 'fake', 'spam', 'test123'];
    const hasRedFlag = redFlags.some(flag => lowerPrompt.includes(flag));
    
    if (hasRedFlag) {
      return {
        content: JSON.stringify({
          recommendation: 'reject',
          reason: 'Detected potential fraud indicators',
          confidence: 0.95,
        }),
        confidence: 0.95,
      };
    }

    // Check for valid business indicators
    const validIndicators = ['hvac', 'contractor', 'technician', 'service', 'repair', 'installation'];
    const hasValidIndicator = validIndicators.some(ind => lowerPrompt.includes(ind));
    
    if (hasValidIndicator) {
      return {
        content: JSON.stringify({
          recommendation: 'approve_trial',
          reason: 'Valid HVAC business indicators detected',
          confidence: 0.85,
          suggested_actions: ['Start 14-day trial', 'Send welcome email', 'Schedule onboarding call'],
        }),
        confidence: 0.85,
      };
    }
  }

  // For invoice parsing, check for structured data
  if (agentType === 'invoice_parser') {
    // Try to extract structured invoice data
    const patterns = {
      labor: /labor[:\s]+\$?([\d.]+)/i,
      parts: /parts[:\s]+\$?([\d.]+)/i,
      total: /total[:\s]+\$?([\d.]+)/i,
    };

    const extracted: any = {};
    let hasData = false;

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = prompt.match(pattern);
      if (match) {
        extracted[key] = parseFloat(match[1]);
        hasData = true;
      }
    }

    if (hasData) {
      return {
        content: JSON.stringify(extracted),
        confidence: 0.90,
      };
    }
  }

  // No deterministic match
  return null;
}

// Run agent with provider escalation
export async function runAgent(request: AgentRequest): Promise<AgentResult> {
  const startTime = Date.now();
  
  // Check circuit breaker
  if (circuitBreakerOpen) {
    const timeSinceCheck = Date.now() - lastCircuitCheck;
    if (timeSinceCheck < 60000) { // 1 minute cooldown
      throw new Error('Circuit breaker open - too many failures');
    }
    circuitBreakerOpen = false;
  }

  // Load system prompt
  const systemPrompt = await loadSystemPrompt(request.agentType);
  
  // Get thresholds
  const thresholds = await getThresholds();
  
  // Try deterministic first
  const deterministicResult = runDeterministic(request.agentType, request.prompt);
  
  if (deterministicResult && deterministicResult.confidence >= thresholds.suggest) {
    const executionTimeMs = Date.now() - startTime;
    
    // Record action
    await recordAgentAction({
      tenantId: request.tenantId,
      actionType: request.agentType,
      agentType: request.agentType,
      inputHash: hashInput(request.prompt),
      outputRedacted: JSON.parse(deterministicResult.content),
      confidence: deterministicResult.confidence,
      modelUsed: 'deterministic',
      tokensUsed: 0,
      costUsd: 0,
      executionTimeMs,
      provider: 'deterministic',
      status: 'success',
    });

    return {
      content: deterministicResult.content,
      confidence: deterministicResult.confidence,
      provider: 'deterministic',
      model: 'deterministic',
      tokensUsed: 0,
      costUsd: 0,
      executionTimeMs,
      shouldAutoExecute: deterministicResult.confidence >= thresholds.autoExec,
    };
  }

  // Check budget before trying LLM providers
  const budget = await checkMonthlyBudget();
  if (!budget.allowed) {
    console.warn(`[Agent] Monthly budget exceeded: $${budget.spent}/$${budget.limit}`);
    
    // Return deterministic result even if below threshold
    if (deterministicResult) {
      const executionTimeMs = Date.now() - startTime;
      return {
        content: deterministicResult.content,
        confidence: deterministicResult.confidence,
        provider: 'deterministic',
        model: 'deterministic',
        tokensUsed: 0,
        costUsd: 0,
        executionTimeMs,
        shouldAutoExecute: false,
      };
    }
    
    throw new Error('Monthly budget exceeded and no deterministic result available');
  }

  // Try LLM providers in order
  const providerOrder = await getProviderOrder();
  const availableProviders = getAvailableProviders();
  
  for (const providerName of providerOrder) {
    if (providerName === 'deterministic') continue; // Already tried
    if (!availableProviders.includes(providerName)) continue;

    try {
      const providerFn = providers[providerName as keyof typeof providers];
      if (!providerFn) continue;

      const response: ProviderResponse = await providerFn({
        prompt: request.prompt,
        systemPrompt,
        maxTokens: 1000,
      });

      // Parse confidence from response if available
      let confidence = response.confidence || 0.80;
      try {
        const parsed = JSON.parse(response.content);
        if (parsed.confidence) {
          confidence = parsed.confidence;
        }
      } catch {
        // Not JSON, use default confidence
      }

      const executionTimeMs = Date.now() - startTime;

      // Record action
      await recordAgentAction({
        tenantId: request.tenantId,
        actionType: request.agentType,
        agentType: request.agentType,
        inputHash: hashInput(request.prompt),
        outputRedacted: JSON.parse(JSON.stringify({ result: redactPII(response.content) })),
        confidence,
        modelUsed: response.model,
        tokensUsed: response.tokensUsed,
        costUsd: response.costUsd,
        executionTimeMs,
        provider: response.provider,
        status: 'success',
      });

      return {
        content: response.content,
        confidence,
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        costUsd: response.costUsd,
        executionTimeMs,
        shouldAutoExecute: confidence >= thresholds.autoExec,
      };
    } catch (error) {
      console.error(`[Agent] Provider ${providerName} failed:`, error);
      // Try next provider
    }
  }

  // All providers failed
  circuitBreakerOpen = true;
  lastCircuitCheck = Date.now();
  
  throw new Error('All providers failed');
}

// Record agent action to audit log
async function recordAgentAction(action: {
  tenantId?: string;
  actionType: string;
  agentType: string;
  inputHash: string;
  outputRedacted: any;
  confidence: number;
  modelUsed: string;
  tokensUsed: number;
  costUsd: number;
  executionTimeMs: number;
  provider: string;
  status: string;
  errorMessage?: string;
}): Promise<void> {
  try {
    await supabase.from('agent_actions').insert({
      tenant_id: action.tenantId || null,
      action_type: action.actionType,
      agent_type: action.agentType,
      input_hash: action.inputHash,
      output_redacted: action.outputRedacted,
      confidence: action.confidence,
      model_used: action.modelUsed,
      tokens_used: action.tokensUsed,
      cost_usd: action.costUsd,
      execution_time_ms: action.executionTimeMs,
      provider: action.provider,
      status: action.status,
      error_message: action.errorMessage,
    });
  } catch (error) {
    console.error('[Agent] Failed to record action:', error);
  }
}

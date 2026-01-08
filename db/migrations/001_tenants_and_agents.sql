-- Migration 001: Tenants, Agents, and Platform Settings
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company_name TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    
    -- Onboarding status
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'active', 'suspended', 'cancelled')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    
    -- Billing
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    subscription_status TEXT CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
    subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'annual', 'founding')),
    trial_ends_at TIMESTAMPTZ,
    
    -- Agent analysis
    agent_recommendation JSONB,
    agent_confidence DECIMAL(5,4),
    risk_score DECIMAL(5,4),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent actions audit log
CREATE TABLE IF NOT EXISTS agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    input_hash TEXT,
    output_redacted JSONB,
    confidence DECIMAL(5,4),
    model_used TEXT,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    execution_time_ms INTEGER,
    provider TEXT,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'timeout', 'budget_exceeded')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Founding members table (for legacy support)
CREATE TABLE IF NOT EXISTS founding_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'trialing')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant billing events
CREATE TABLE IF NOT EXISTS tenant_billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_agent_actions_tenant ON agent_actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_created ON agent_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenant_billing_events_tenant ON tenant_billing_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_billing_events_stripe ON tenant_billing_events(stripe_event_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tenants
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to platform_settings
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description) VALUES
    ('auto_exec_threshold', '0.95', 'Confidence threshold for automatic execution'),
    ('suggest_threshold', '0.75', 'Confidence threshold for suggestions'),
    ('monthly_model_budget_usd', '100.00', 'Monthly budget for LLM usage'),
    ('redact_pii', 'true', 'Whether to redact PII in agent outputs'),
    ('provider_order', '["deterministic", "grok", "hf", "openai"]', 'Provider escalation order')
ON CONFLICT (key) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE tenants IS 'Tenant organizations using the platform';
COMMENT ON TABLE agent_actions IS 'Audit log of all AI agent actions';
COMMENT ON TABLE platform_settings IS 'Global platform configuration';
COMMENT ON TABLE founding_members IS 'Legacy founding members (pre-tenant system)';
COMMENT ON TABLE tenant_billing_events IS 'Stripe webhook events for billing';

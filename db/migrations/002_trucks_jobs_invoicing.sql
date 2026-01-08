-- Migration 002: Trucks, Jobs, and Invoicing
-- Run this migration in your Supabase SQL editor AFTER 001

-- Trucks table
CREATE TABLE IF NOT EXISTS trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    truck_number TEXT NOT NULL,
    license_plate TEXT,
    make TEXT,
    model TEXT,
    year INTEGER,
    vin TEXT,
    
    -- GPS device
    device_token TEXT UNIQUE,
    last_known_location POINT,
    last_location_update TIMESTAMPTZ,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telemetry recent (for real-time tracking)
CREATE TABLE IF NOT EXISTS telemetry_recent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
    location POINT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    speed DECIMAL(5, 2),
    heading DECIMAL(5, 2),
    accuracy DECIMAL(8, 2),
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    job_number TEXT NOT NULL,
    
    -- Customer info
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    service_address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    
    -- Job details
    job_type TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    
    -- Scheduling
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    
    -- Assignment
    assigned_tech_id UUID,
    assigned_truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    
    -- Financial
    estimated_value DECIMAL(10, 2),
    final_value DECIMAL(10, 2),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tech notes
CREATE TABLE IF NOT EXISTS tech_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    tech_id UUID,
    note_type TEXT NOT NULL CHECK (note_type IN ('arrival', 'diagnostic', 'work_performed', 'parts_used', 'completion', 'general')),
    content TEXT NOT NULL,
    
    -- Structured data
    work_performed JSONB,
    parts_list JSONB,
    
    -- Invoice generation
    parsed_for_invoice BOOLEAN DEFAULT FALSE,
    invoice_draft_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parts inventory
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    part_number TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    manufacturer TEXT,
    
    -- Inventory
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    reorder_point INTEGER,
    reorder_quantity INTEGER,
    
    -- Pricing
    unit_cost DECIMAL(10, 2),
    unit_price DECIMAL(10, 2),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    
    -- Customer
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    billing_address TEXT,
    
    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 4) DEFAULT 0.05,
    tax_amount DECIMAL(10, 2),
    total DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    
    -- Dates
    issue_date DATE,
    due_date DATE,
    paid_date DATE,
    
    -- Payment
    payment_method TEXT,
    payment_reference TEXT,
    
    -- Generation
    generated_by TEXT DEFAULT 'deterministic',
    agent_confidence DECIMAL(5,4),
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    item_type TEXT CHECK (item_type IN ('labor', 'part', 'service', 'fee', 'other')),
    part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refrigerant ledger (EPA compliance)
CREATE TABLE IF NOT EXISTS refrigerant_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    
    -- Refrigerant details
    refrigerant_type TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'recovery', 'disposal', 'leak')),
    quantity_lbs DECIMAL(10, 3) NOT NULL,
    
    -- Equipment
    equipment_description TEXT,
    equipment_serial TEXT,
    
    -- Technician
    tech_id UUID,
    tech_name TEXT,
    tech_cert_number TEXT,
    
    -- Compliance
    recovery_cylinder TEXT,
    disposal_cert TEXT,
    
    -- Transaction
    transaction_date DATE NOT NULL,
    notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trucks_tenant ON trucks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trucks_device_token ON trucks(device_token);
CREATE INDEX IF NOT EXISTS idx_telemetry_truck ON telemetry_recent(truck_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_recorded ON telemetry_recent(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_tech ON jobs(assigned_tech_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON jobs(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_tech_notes_job ON tech_notes(job_id);
CREATE INDEX IF NOT EXISTS idx_parts_tenant ON parts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_inventory_part ON inventory_transactions(part_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_refrigerant_tenant ON refrigerant_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_refrigerant_job ON refrigerant_ledger(job_id);

-- Spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_trucks_location ON trucks USING GIST(last_known_location);
CREATE INDEX IF NOT EXISTS idx_telemetry_location ON telemetry_recent USING GIST(location);

-- Apply updated_at triggers
CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE trucks IS 'Fleet vehicles with GPS tracking';
COMMENT ON TABLE telemetry_recent IS 'Recent GPS telemetry data for real-time tracking';
COMMENT ON TABLE jobs IS 'Service jobs and work orders';
COMMENT ON TABLE tech_notes IS 'Technician field notes for jobs';
COMMENT ON TABLE parts IS 'Parts inventory master data';
COMMENT ON TABLE inventory_transactions IS 'Parts inventory transaction log';
COMMENT ON TABLE invoices IS 'Customer invoices';
COMMENT ON TABLE invoice_line_items IS 'Invoice line item details';
COMMENT ON TABLE refrigerant_ledger IS 'EPA-compliant refrigerant tracking';

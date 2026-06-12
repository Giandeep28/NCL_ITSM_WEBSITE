-- Baseline Flyway Schema Migration (PostgreSQL 15+)
-- Version: V1__schema.sql
-- Description: Setup multi-tenant database tables with PKs as UUIDs and partition constraints.

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- USER MANAGEMENT MODULE
-- =========================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eis_number VARCHAR(8) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile_enc VARCHAR(256),
    designation VARCHAR(100),
    department_id VARCHAR(100),
    tenant_id VARCHAR(50) NOT NULL,
    org_id VARCHAR(50) NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_count INT DEFAULT 0,
    locked_at TIMESTAMP,
    ad_guid VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    scope VARCHAR(50),
    CONSTRAINT uq_roles_name_tenant UNIQUE (name, tenant_id)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(250)
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    perm_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, perm_id)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =========================================================================
-- HARDWARE ASSET MANAGEMENT MODULE (HAM)
-- =========================================================================

CREATE TABLE hardware_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_tag VARCHAR(30) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_no VARCHAR(100) NOT NULL,
    department_id VARCHAR(100),
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location_id VARCHAR(50) NOT NULL,
    condition VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    org_id VARCHAR(50) NOT NULL,
    procured_at TIMESTAMP,
    retired_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consumable_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(250) NOT NULL,
    qty_available INT NOT NULL DEFAULT 0,
    qty_reserved INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 10,
    tenant_id VARCHAR(50) NOT NULL,
    org_id VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- SOFTWARE ASSET MANAGEMENT MODULE (SAM)
-- =========================================================================

CREATE TABLE software_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product VARCHAR(100) NOT NULL,
    vendor_id VARCHAR(100),
    license_key_hash VARCHAR(256) NOT NULL,
    seat_count INT NOT NULL DEFAULT 0,
    allocated_count INT NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    org_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE software_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES software_licenses(id) ON DELETE CASCADE,
    asset_id UUID,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    deployed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    undeployed_at TIMESTAMP,
    tenant_id VARCHAR(50) NOT NULL
);

-- =========================================================================
-- TICKET MANAGEMENT MODULE (ESS)
-- =========================================================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),
    impact_level VARCHAR(50) NOT NULL,
    summary VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    engineer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    queue_id VARCHAR(50),
    sla_due_at TIMESTAMP,
    tenant_id VARCHAR(50) NOT NULL,
    org_id VARCHAR(50) NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE TABLE ticket_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    comment TEXT,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- DOCUMENT SERVICE MODULE (ATTACHMENTS)
-- =========================================================================

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    file_name VARCHAR(250) NOT NULL,
    stored_path VARCHAR(250) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- NOTIFICATION SERVICE MODULE
-- =========================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL,
    template_code VARCHAR(50) NOT NULL,
    payload_json TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    retry_count INT DEFAULT 0,
    last_error TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- CONFIGURATION SERVICE MODULE
-- =========================================================================

CREATE TABLE configuration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    scope VARCHAR(50) NOT NULL,
    description VARCHAR(250),
    last_modified_by UUID,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_config_key_tenant UNIQUE (config_key, tenant_id)
);

-- =========================================================================
-- AUDIT & COMPLIANCE MODULE (PARTITIONED)
-- =========================================================================

CREATE TABLE audit_logs (
    id UUID NOT NULL,
    actor_id UUID,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    before_json TEXT,
    after_json TEXT,
    ip_address VARCHAR(45),
    tenant_id VARCHAR(50) NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- Partitions setup for years 2026, 2027 and 2028
CREATE TABLE audit_logs_y2026 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01 00:00:00') TO ('2027-01-01 00:00:00');

CREATE TABLE audit_logs_y2027 PARTITION OF audit_logs
    FOR VALUES FROM ('2027-01-01 00:00:00') TO ('2028-01-01 00:00:00');

CREATE TABLE audit_logs_y2028 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-01-01 00:00:00') TO ('2029-01-01 00:00:00');

-- =========================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================
CREATE INDEX idx_tickets_search ON tickets (status, engineer_id, created_at);
CREATE INDEX idx_assets_search ON hardware_assets (status, location_id);
CREATE INDEX idx_licenses_expiry ON software_licenses (expiry_date, tenant_id);
CREATE INDEX idx_audit_search ON audit_logs (occurred_at, actor_id);

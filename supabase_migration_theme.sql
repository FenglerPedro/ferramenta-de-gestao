
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Add custom_theme column to business_settings
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS custom_theme jsonb;

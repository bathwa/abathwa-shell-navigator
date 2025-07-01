-- Update the app_role enum to include service_provider
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'service_provider';
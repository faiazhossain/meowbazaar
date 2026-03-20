-- Fix database schema for PetType enum
-- This script should be run manually to fix the schema drift

-- Drop old PetType enum with CASCADE
DROP TYPE IF EXISTS "PetType_old" CASCADE;

-- Drop old PetType enum (if it exists with different values)
DROP TYPE IF EXISTS "PetType" CASCADE;

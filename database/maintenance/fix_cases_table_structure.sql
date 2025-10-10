-- Fix Cases Table Structure for CaseManager Compatibility
-- This script updates the cases table to match the expected structure

-- First, check if the table has the wrong column names and fix them
DO $$ 
BEGIN
    -- Check if we have case_title instead of title
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'case_title'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases RENAME COLUMN case_title TO title;
        RAISE NOTICE 'Renamed case_title to title';
    END IF;
    
    -- Check if we have case_description instead of description
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'case_description'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases RENAME COLUMN case_description TO description;
        RAISE NOTICE 'Renamed case_description to description';
    END IF;
END $$;

-- Add missing columns that CaseManager expects
DO $$ 
BEGIN
    -- Add case_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'case_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN case_number VARCHAR(20);
        RAISE NOTICE 'Added case_number column';
        
        -- Generate case numbers for existing records
        UPDATE public.cases 
        SET case_number = 'CASE-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
        WHERE case_number IS NULL;
        
        -- Make it NOT NULL and UNIQUE after populating
        ALTER TABLE public.cases ALTER COLUMN case_number SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS cases_case_number_unique ON public.cases(case_number);
        
        RAISE NOTICE 'Populated case_number for existing records';
    END IF;
    
    -- Add due_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'due_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN due_date TIMESTAMPTZ;
        RAISE NOTICE 'Added due_date column';
    END IF;
END $$;

-- Ensure foreign key constraints exist
DO $$ 
BEGIN
    -- Add customer_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cases_customer_id_fkey' 
        AND table_name = 'cases'
        AND table_schema = 'public'
    ) THEN
        -- First check if the column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'cases' 
            AND column_name = 'customer_id'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.cases 
            ADD CONSTRAINT cases_customer_id_fkey 
            FOREIGN KEY (customer_id) REFERENCES public.profiles(id);
            RAISE NOTICE 'Added foreign key constraint: cases_customer_id_fkey';
        ELSE
            RAISE NOTICE 'customer_id column does not exist, cannot add foreign key';
        END IF;
    END IF;
    
    -- Add assigned_nurse_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cases_assigned_nurse_id_fkey' 
        AND table_name = 'cases'
        AND table_schema = 'public'
    ) THEN
        -- First check if the column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'cases' 
            AND column_name = 'assigned_nurse_id'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.cases 
            ADD CONSTRAINT cases_assigned_nurse_id_fkey 
            FOREIGN KEY (assigned_nurse_id) REFERENCES public.profiles(id);
            RAISE NOTICE 'Added foreign key constraint: cases_assigned_nurse_id_fkey';
        ELSE
            RAISE NOTICE 'assigned_nurse_id column does not exist, cannot add foreign key';
        END IF;
    END IF;
END $$;

-- Verify the structure is correct
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cases' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
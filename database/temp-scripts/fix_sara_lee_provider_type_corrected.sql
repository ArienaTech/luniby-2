-- Fix provider_type for sara_lee123@gmail.com to show veterinarian dashboard features
-- CORRECTED VERSION - using only existing columns

-- First, check if there's a provider record
SELECT 
    'Current Status' as info,
    p.email,
    p.role,
    pr.provider_type,
    pr.id as provider_id,
    CASE 
        WHEN pr.provider_type = 'veterinarian' THEN '✅ Correct Provider Type'
        WHEN pr.provider_type IS NULL THEN '❌ Missing Provider Type'
        ELSE '❌ Wrong Provider Type: ' || pr.provider_type
    END as status
FROM profiles p
LEFT JOIN providers pr ON p.id = pr.id
WHERE p.email = 'sara_lee123@gmail.com';

-- Update or create provider record with correct provider_type
DO $$ 
BEGIN
    -- Check if provider record exists
    IF EXISTS (SELECT 1 FROM providers WHERE id = (SELECT id FROM profiles WHERE email = 'sara_lee123@gmail.com')) THEN
        -- Update existing provider record
        UPDATE providers 
        SET 
            provider_type = 'veterinarian',
            updated_at = NOW()
        WHERE id = (SELECT id FROM profiles WHERE email = 'sara_lee123@gmail.com');
        
        RAISE NOTICE 'Updated existing provider record for sara_lee123@gmail.com';
    ELSE
        -- Create new provider record with minimal required fields
        INSERT INTO providers (
            id,
            provider_type,
            name,
            email,
            verified,
            created_at,
            updated_at
        ) VALUES (
            (SELECT id FROM profiles WHERE email = 'sara_lee123@gmail.com'),
            'veterinarian',
            (SELECT full_name FROM profiles WHERE email = 'sara_lee123@gmail.com'),
            'sara_lee123@gmail.com',
            false,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created new provider record for sara_lee123@gmail.com';
    END IF;
END $$;

-- Verify the fix
SELECT 
    'After Fix' as info,
    p.email,
    p.role,
    pr.provider_type,
    pr.id as provider_id,
    CASE 
        WHEN pr.provider_type = 'veterinarian' THEN '✅ Fixed - Veterinarian Dashboard Active'
        ELSE '❌ Still Wrong: ' || COALESCE(pr.provider_type, 'NULL')
    END as status
FROM profiles p
LEFT JOIN providers pr ON p.id = pr.id
WHERE p.email = 'sara_lee123@gmail.com';
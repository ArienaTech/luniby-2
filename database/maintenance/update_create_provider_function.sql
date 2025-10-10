-- UPDATE CREATE_PROVIDER_RECORD FUNCTION
-- This will handle all the parameters from the original ProviderSignUp component

CREATE OR REPLACE FUNCTION public.create_provider_record(
    provider_name TEXT,
    provider_email TEXT,
    provider_phone TEXT DEFAULT NULL,
    provider_type TEXT DEFAULT 'other',
    business_name TEXT DEFAULT NULL,
    work_type TEXT DEFAULT NULL,
    provider_address TEXT DEFAULT NULL,
    provider_city TEXT DEFAULT NULL,
    provider_country TEXT DEFAULT NULL,
    provider_bio TEXT DEFAULT NULL,
    offers_services BOOLEAN DEFAULT true,
    offers_products BOOLEAN DEFAULT false,
    service_types TEXT[] DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    mapped_type TEXT;
BEGIN
    -- Clean phone (don't use email as phone)
    IF provider_phone = provider_email THEN
        provider_phone := NULL;
    END IF;
    
    -- Map provider types to valid values
    mapped_type := CASE 
        WHEN LOWER(provider_type) IN ('vet nurse', 'vet_nurse') OR provider_type = 'Veterinarian' THEN 'vet_nurse'
        WHEN LOWER(provider_type) = 'veterinarian' THEN 'veterinarian'
        WHEN LOWER(provider_type) = 'groomer' THEN 'groomer'
        WHEN LOWER(provider_type) = 'trainer' THEN 'trainer'
        WHEN LOWER(provider_type) = 'pet_sitter' THEN 'pet_sitter'
        WHEN LOWER(provider_type) = 'dog_walker' THEN 'dog_walker'
        WHEN LOWER(provider_type) = 'boarding' THEN 'boarding'
        WHEN LOWER(provider_type) = 'daycare' THEN 'daycare'
        ELSE 'other'
    END;
    
    -- Insert or update provider record (only use columns that exist)
    INSERT INTO providers (
        name, 
        email, 
        phone, 
        provider_type,
        business_name,
        address,
        city,
        country,
        bio,
        verified,
        is_active
    ) 
    VALUES (
        provider_name, 
        provider_email, 
        provider_phone, 
        mapped_type,
        business_name,
        provider_address,
        provider_city,
        COALESCE(provider_country, 'New Zealand'),
        provider_bio,
        false, -- not verified initially
        true   -- active by default
    )
    ON CONFLICT (email) 
    DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        provider_type = EXCLUDED.provider_type,
        business_name = EXCLUDED.business_name,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        country = EXCLUDED.country,
        bio = EXCLUDED.bio,
        updated_at = NOW();
    
    RAISE NOTICE 'Provider record created for % with type % (from %)', provider_email, mapped_type, provider_type;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Provider created successfully',
        'provider_type', mapped_type,
        'email', provider_email
    );
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating provider for %: %', provider_email, SQLERRM;
        RETURN json_build_object(
            'success', false, 
            'error', SQLERRM,
            'email', provider_email
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_provider_record TO anon;
GRANT EXECUTE ON FUNCTION public.create_provider_record TO authenticated;

SELECT 'Updated create_provider_record function to handle all parameters!' as status;
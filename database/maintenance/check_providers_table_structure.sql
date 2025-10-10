-- Check the actual structure of the providers table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'providers' 
ORDER BY ordinal_position;

-- Also check what columns exist
SELECT * FROM providers LIMIT 1;
-- FINAL SYSTEM CHECK - Verify Everything is Set Up Properly
-- This will check all components needed for successful provider signup

-- ===============================
-- STEP 1: Check Database Tables
-- ===============================
SELECT '=== DATABASE TABLES ===' as check_section;

-- Check profiles table structure
SELECT 
    'PROFILES TABLE' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check providers table structure  
SELECT 
    'PROVIDERS TABLE' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'providers' 
ORDER BY ordinal_position;

-- ===============================
-- STEP 2: Check Functions
-- ===============================
SELECT '=== DATABASE FUNCTIONS ===' as check_section;

-- Check handle_new_user function
SELECT 
    'HANDLE_NEW_USER FUNCTION' as function_check,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check create_provider_record function and its parameters
SELECT 
    'CREATE_PROVIDER_RECORD FUNCTION' as function_check,
    proname as function_name,
    array_length(proargnames, 1) as parameter_count,
    proargnames as parameter_names
FROM pg_proc 
WHERE proname = 'create_provider_record';

-- ===============================
-- STEP 3: Check Trigger
-- ===============================
SELECT '=== DATABASE TRIGGER ===' as check_section;

SELECT 
    'USER CREATION TRIGGER' as trigger_check,
    trigger_name,
    event_manipulation,
    action_timing,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
GROUP BY trigger_name, event_manipulation, action_timing;

-- ===============================
-- STEP 4: Check RLS Policies
-- ===============================
SELECT '=== ROW LEVEL SECURITY ===' as check_section;

-- Check profiles RLS
SELECT 
    'PROFILES RLS' as table_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check providers RLS
SELECT 
    'PROVIDERS RLS' as table_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'providers';

-- ===============================
-- STEP 5: Check User Role Enum
-- ===============================
SELECT '=== USER ROLES ===' as check_section;

SELECT 
    'USER_ROLE ENUM VALUES' as enum_check,
    t.typname as enum_name,
    e.enumlabel as allowed_roles
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- ===============================
-- STEP 6: Check Provider Type Constraints
-- ===============================
SELECT '=== PROVIDER CONSTRAINTS ===' as check_section;

SELECT 
    'PROVIDER_TYPE CONSTRAINT' as constraint_check,
    conname as constraint_name,
    consrc as allowed_values
FROM pg_constraint 
WHERE conrelid = 'providers'::regclass
AND conname LIKE '%provider_type%';

-- ===============================
-- STEP 7: System Verification Complete
-- ===============================
SELECT '=== SYSTEM VERIFICATION COMPLETE ===' as check_section;

-- ===============================
-- STEP 8: Check Recent Data
-- ===============================
SELECT '=== RECENT DATA ===' as check_section;

-- Check recent auth users
SELECT 
    'RECENT AUTH USERS' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN raw_user_meta_data->>'user_type' = 'provider' THEN 1 END) as provider_count,
    MAX(created_at) as latest_signup
FROM auth.users;

-- Check recent profiles
SELECT 
    'RECENT PROFILES' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN role = 'provider' THEN 1 END) as provider_profiles,
    MAX(created_at) as latest_profile
FROM profiles;

-- Check recent providers
SELECT 
    'RECENT PROVIDERS' as data_type,
    COUNT(*) as total_count,
    MAX(created_at) as latest_provider
FROM providers;

-- ===============================
-- STEP 9: Final Status Summary
-- ===============================
SELECT '=== SYSTEM STATUS SUMMARY ===' as check_section;

SELECT 
    'SYSTEM COMPONENT' as component,
    'STATUS' as status,
    'DETAILS' as details
UNION ALL
SELECT 
    'Database Tables',
    CASE WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('profiles', 'providers')) = 2 
         THEN '✅ READY' ELSE '❌ MISSING' END,
    'profiles, providers tables'
UNION ALL
SELECT 
    'Database Functions',
    CASE WHEN (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('handle_new_user', 'create_provider_record')) = 2 
         THEN '✅ READY' ELSE '❌ MISSING' END,
    'handle_new_user, create_provider_record'
UNION ALL
SELECT 
    'Database Trigger',
    CASE WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') > 0 
         THEN '✅ READY' ELSE '❌ MISSING' END,
    'on_auth_user_created trigger'
UNION ALL
SELECT 
    'User Roles',
    CASE WHEN (SELECT COUNT(*) FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role') >= 4 
         THEN '✅ READY' ELSE '❌ MISSING' END,
    'admin, provider, pet_owner, support roles'
UNION ALL
SELECT 
    'RLS Policies',
    CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('profiles', 'providers')) >= 2 
         THEN '✅ READY' ELSE '❌ MISSING' END,
    'Row Level Security policies';

SELECT 'SYSTEM CHECK COMPLETED!' as final_status;
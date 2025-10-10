console.log('👑 Admin User Setup for camille@luniby.com');
console.log('📧 Email: camille@luniby.com');
console.log('🔑 Password: Passollie2025$');
console.log('🌐 Supabase Project: wagrmmbkukwblfpfxxcb');
console.log('');

// Method 1: Via Supabase Dashboard (Recommended)
console.log('🔄 METHOD 1: Supabase Dashboard (Recommended)');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Select project: wagrmmbkukwblfpfxxcb');
console.log('3. Navigate to: Authentication > Users');
console.log('4. Find user: camille@luniby.com (or create if not exists)');
console.log('5. Click "..." menu > "Edit user"');
console.log('6. Set password to: Passollie2025$');
console.log('7. In "User Metadata" add: {"role": "admin"}');
console.log('8. Save changes');
console.log('');

// Method 2: Via SQL Editor (Admin access required)
console.log('💾 METHOD 2: SQL Editor (Admin access required)');
console.log('1. Go to: https://supabase.com/dashboard/project/wagrmmbkukwblfpfxxcb/sql');
console.log('2. Run these SQL commands:');
console.log('');

console.log('-- Step 1: Update password');
console.log('UPDATE auth.users');
console.log('SET encrypted_password = crypt(\'Passollie2025$\', gen_salt(\'bf\'))');
console.log('WHERE email = \'camille@luniby.com\';');
console.log('');

console.log('-- Step 2: Add admin role to user metadata');
console.log('UPDATE auth.users');
console.log('SET raw_user_meta_data = raw_user_meta_data || \'{"role": "admin"}\'::jsonb');
console.log('WHERE email = \'camille@luniby.com\';');
console.log('');

console.log('-- Step 3: Verify the update');
console.log('SELECT id, email, raw_user_meta_data, updated_at');
console.log('FROM auth.users');
console.log('WHERE email = \'camille@luniby.com\';');
console.log('');

// Method 3: Create user if doesn't exist
console.log('🆕 METHOD 3: Create User if Not Exists (SQL)');
console.log('-- Run this if the user doesn\'t exist yet:');
console.log('');
console.log('INSERT INTO auth.users (');
console.log('  instance_id,');
console.log('  id,');
console.log('  aud,');
console.log('  role,');
console.log('  email,');
console.log('  encrypted_password,');
console.log('  email_confirmed_at,');
console.log('  created_at,');
console.log('  updated_at,');
console.log('  raw_user_meta_data');
console.log(') VALUES (');
console.log('  (SELECT id FROM auth.instances LIMIT 1),');
console.log('  gen_random_uuid(),');
console.log('  \'authenticated\',');
console.log('  \'authenticated\',');
console.log('  \'camille@luniby.com\',');
console.log('  crypt(\'Passollie2025$\', gen_salt(\'bf\')),');
console.log('  now(),');
console.log('  now(),');
console.log('  now(),');
console.log('  \'{"role": "admin"}\'::jsonb');
console.log(') ON CONFLICT (email) DO UPDATE SET');
console.log('  encrypted_password = EXCLUDED.encrypted_password,');
console.log('  raw_user_meta_data = EXCLUDED.raw_user_meta_data,');
console.log('  updated_at = now();');
console.log('');

console.log('✅ Choose the method that works best for your access level!');
console.log('📝 Note: Method 1 (Dashboard) is the safest and most straightforward.');
console.log('');
console.log('🚀 Quick Start: Go to https://supabase.com/dashboard and follow Method 1!');
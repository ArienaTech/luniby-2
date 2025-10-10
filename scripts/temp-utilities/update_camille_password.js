console.log('🔐 Password Update for camille@luniby.com');
console.log('📧 Email: camille@luniby.com');
console.log('🔑 New Password: Passollie2025$');
console.log('🌐 Project: wagrmmbkukwblfpfxxcb');
console.log('');

// Method 1: Via Supabase Dashboard (Recommended)
console.log('🔄 METHOD 1: Supabase Dashboard (Recommended)');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Select project: wagrmmbkukwblfpfxxcb');
console.log('3. Navigate to: Authentication > Users');
console.log('4. Find user: camille@luniby.com');
console.log('5. Click "..." menu > "Reset password" or "Edit user"');
console.log('6. Set new password to: Passollie2025$');
console.log('7. Save changes');
console.log('');

// Method 2: Via SQL Editor (Admin access required)
console.log('💾 METHOD 2: SQL Editor (Admin access required)');
console.log('1. Go to: https://supabase.com/dashboard/project/wagrmmbkukwblfpfxxcb/sql');
console.log('2. Run this SQL command:');
console.log('');
console.log('UPDATE auth.users');
console.log('SET encrypted_password = crypt(\'Passollie2025$\', gen_salt(\'bf\'))');
console.log('WHERE email = \'camille@luniby.com\';');
console.log('');

// Method 3: Via Supabase CLI (if installed)
console.log('🖥️  METHOD 3: Supabase CLI (if installed)');
console.log('1. Install Supabase CLI: npm install -g supabase');
console.log('2. Login: supabase login');
console.log('3. Link project: supabase link --project-ref wagrmmbkukwblfpfxxcb');
console.log('4. Update password: supabase auth update-user --email camille@luniby.com --password Passollie2025$');
console.log('');

// Method 4: Via API with service role key
console.log('🔑 METHOD 4: API with Service Role Key (Advanced)');
console.log('1. Get service role key from: Dashboard > Settings > API');
console.log('2. Use this script with service role key:');
console.log('');
console.log('const { createClient } = require(\'@supabase/supabase-js\');');
console.log('const supabaseUrl = \'https://wagrmmbkukwblfpfxxcb.supabase.co\';');
console.log('const serviceRoleKey = \'YOUR_SERVICE_ROLE_KEY\';');
console.log('const supabase = createClient(supabaseUrl, serviceRoleKey);');
console.log('');
console.log('// Get user by email first');
console.log('const { data: users } = await supabase.auth.admin.listUsers();');
console.log('const user = users.users.find(u => u.email === \'camille@luniby.com\');');
console.log('');
console.log('// Update password');
console.log('const { data, error } = await supabase.auth.admin.updateUserById(user.id, {');
console.log('  password: \'Passollie2025$\'');
console.log('});');
console.log('');

console.log('✅ Choose the method that works best for your access level!');
console.log('📝 Note: Method 1 (Dashboard) is the safest and most straightforward.');
console.log('🔒 Security: Always use strong passwords and secure connections.');
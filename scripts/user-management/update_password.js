const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://wagrmmbkukwblfpfxxcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ3JtbWJrdWt3YmxmcGZ4eGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzI1MjYsImV4cCI6MjA2ODMwODUyNn0.9acMmbOCQZJ2uggvOYfIhqBFYdWGwu-ObNXyT5PPniw';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateUserPassword() {
  try {
    console.log('🔐 Updating password for amber_summer2000@gmail.com...');
    
    // First, we need to sign in as the user to get their session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'amber_summer2000@gmail.com',
      password: 'current_password_here' // You'll need to provide the current password
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      console.log('\n📝 Note: To update the password, you need to:');
      console.log('1. Know the current password for amber_summer2000@gmail.com');
      console.log('2. Or use the Supabase dashboard to reset the password');
      console.log('3. Or use the Supabase admin API with service role key');
      return;
    }

    // Update the password
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      password: '0001'
    });

    if (updateError) {
      console.error('❌ Password update failed:', updateError.message);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log('📧 Email: amber_summer2000@gmail.com');
    console.log('🔑 New password: 0001');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Alternative method using Supabase dashboard instructions
function showDashboardInstructions() {
  console.log('\n🔄 Alternative: Update password via Supabase Dashboard');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project: wagrmmbkukwblfpfxxcb');
  console.log('3. Navigate to Authentication > Users');
  console.log('4. Find amber_summer2000@gmail.com');
  console.log('5. Click "..." > "Reset password"');
  console.log('6. Set new password to: 0001');
}

// Alternative method using SQL (if you have admin access)
function showSQLInstructions() {
  console.log('\n💾 Alternative: Update password via SQL (Admin only)');
  console.log('1. Go to Supabase Dashboard > SQL Editor');
  console.log('2. Run this SQL command:');
  console.log(`
UPDATE auth.users 
SET encrypted_password = crypt('0001', gen_salt('bf'))
WHERE email = 'amber_summer2000@gmail.com';
  `);
}

// Run the password update
updateUserPassword();

// Show alternative methods
setTimeout(() => {
  showDashboardInstructions();
  showSQLInstructions();
}, 2000);
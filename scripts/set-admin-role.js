#!/usr/bin/env node

/**
 * Set Admin Role Script
 * Updates petcareintern123@gmail.com role to admin
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wagrmmbkukwblfpfxxcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ3JtbWJrdWt3YmxmcGZ4eGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzI1MjYsImV4cCI6MjA2ODMwODUyNn0.9acMmbOCQZJ2uggvOYfIhqBFYdWGwu-ObNXyT5PPniw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setAdminRole() {
  const adminEmail = 'petcareintern123@gmail.com';
  
  console.log('🚀 Setting admin role...');
  console.log(`Email: ${adminEmail}`);

  try {
    // Update role to admin
    console.log('\n📝 Updating role to admin...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', adminEmail);

    if (updateError) {
      console.error('❌ Role update failed:', updateError.message);
      console.log('Note: Make sure the user has signed up first at /signup');
      return;
    }

    console.log('✅ Role updated successfully');

    // Verify the update
    console.log('\n📝 Verifying admin access...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('email, role, full_name')
      .eq('email', adminEmail)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return;
    }

    console.log('✅ Admin role verified:');
    console.log(`   - Email: ${verifyData.email}`);
    console.log(`   - Role: ${verifyData.role}`);
    console.log(`   - Name: ${verifyData.full_name}`);

    console.log('\n🎉 Admin role set successfully!');
    console.log(`   Admin Portal: http://localhost:3000/admin`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setAdminRole().then(() => {
  console.log('\n✨ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
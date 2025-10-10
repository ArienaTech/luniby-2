#!/usr/bin/env node

/**
 * Set Admin Role Script for Ariena Phan
 * Updates ariena.phan@gmail.com role to admin
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wagrmmbkukwblfpfxxcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ3JtbWJrdWt3YmxmcGZ4eGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzI1MjYsImV4cCI6MjA2ODMwODUyNn0.9acMmbOCQZJ2uggvOYfIhqBFYdWGwu-ObNXyT5PPniw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setArienaaAdminRole() {
  const adminEmail = 'ariena.phan@gmail.com';
  
  console.log('🚀 Setting admin role for Ariena Phan...');
  console.log(`Email: ${adminEmail}`);

  try {
    // First, check if the user exists
    console.log('\n📝 Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, created_at')
      .eq('email', adminEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking user:', checkError.message);
      return;
    }

    if (!existingUser) {
      console.log('⚠️  User not found. Creating profile entry...');
      
      // Create a profile entry for the user
      const { data: createData, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: adminEmail,
          role: 'admin',
          full_name: 'Ariena Phan',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Profile creation failed:', createError.message);
        console.log('Note: The user might need to sign up first at /signup');
        return;
      }

      console.log('✅ Profile created with admin role');
    } else {
      console.log('✅ User found:', existingUser.email);
      
      // Update role to admin if not already admin
      if (existingUser.role !== 'admin') {
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
          return;
        }

        console.log('✅ Role updated successfully');
      } else {
        console.log('✅ User already has admin role');
      }
    }

    // Verify the final state
    console.log('\n📝 Verifying admin access...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('email, role, full_name, created_at')
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
    console.log(`   - Created: ${new Date(verifyData.created_at).toLocaleString()}`);

    console.log('\n🎉 Admin role set successfully for Ariena Phan!');
    console.log(`   Admin Portal: http://localhost:3000/admin`);
    console.log(`   Production Portal: https://your-domain.com/admin`);

    // Additional setup instructions
    console.log('\n📋 Next Steps:');
    console.log('1. Ariena can now sign in at /signin with her email');
    console.log('2. After signing in, she can access the admin dashboard at /admin');
    console.log('3. The admin dashboard provides access to:');
    console.log('   - User management');
    console.log('   - Provider verification');
    console.log('   - Qualification approvals');
    console.log('   - System overview and analytics');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setArienaaAdminRole().then(() => {
  console.log('\n✨ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
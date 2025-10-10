// Verify if listings table exists and check its structure
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wagrmmbkukwblfpfxxcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ3JtbWJrdWt3YmxmcGZ4eGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzI1MjYsImV4cCI6MjA2ODMwODUyNn0.9acMmbOCQZJ2uggvOYfIhqBFYdWGwu-ObNXyT5PPniw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyListingsTable() {
  console.log('🔍 VERIFYING LISTINGS TABLE');
  console.log('='.repeat(40));

  try {
    // Test if we can access listings table at all
    console.log('1️⃣ Testing basic access to listings table...');
    
    const { data, error, count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      console.log('   Code:', error.code);
      console.log('   Details:', error.details);
      
      if (error.message.includes('does not exist')) {
        console.log('\n💡 DIAGNOSIS: listings table does NOT exist!');
        console.log('   The table was never created or creation failed');
        return false;
      }
      
      if (error.message.includes('permission denied')) {
        console.log('\n💡 DIAGNOSIS: listings table exists but access is blocked');
        console.log('   RLS or permissions are preventing access');
        return true; // Table exists but access denied
      }
    } else {
      console.log(`✅ SUCCESS: listings table exists with ${count} total records`);
      if (data && data.length > 0) {
        console.log('📋 Sample record:');
        console.log('   Columns:', Object.keys(data[0]).join(', '));
      }
      return true;
    }
  } catch (e) {
    console.log('💥 Exception:', e.message);
    return false;
  }
}

async function testAlternativeApproach() {
  console.log('\n2️⃣ TESTING ALTERNATIVE APPROACH...');
  
  console.log('Since listings table has issues, let\'s test going back to marketplace_listings:');
  
  // Test marketplace_listings access
  const { data: marketplaceData, error: marketplaceError } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('provider_email', 'emily@gmail.com')
    .limit(1);

  if (marketplaceError) {
    console.log('❌ marketplace_listings error:', marketplaceError.message);
  } else {
    console.log(`✅ marketplace_listings works: ${marketplaceData.length} records for Emily`);
    if (marketplaceData.length > 0) {
      console.log(`   Sample: ${marketplaceData[0].name} - $${marketplaceData[0].price}`);
    }
  }
}

async function recommendQuickFix() {
  console.log('\n🔧 QUICK FIX RECOMMENDATION\n');
  
  console.log('Since the listings table approach is having issues, let\'s revert to marketplace_listings:');
  console.log('');
  console.log('📋 OPTION 1: Revert dashboard to use marketplace_listings');
  console.log('   - Change dashboard back to marketplace_listings');
  console.log('   - This will show Emily\'s data immediately');
  console.log('   - Accept that it\'s read-only (can view but not edit)');
  console.log('');
  
  console.log('📋 OPTION 2: Fix listings table properly');
  console.log('   - Recreate listings table with correct permissions');
  console.log('   - Ensure RLS policies are set up correctly');
  console.log('   - Migrate data properly');
  console.log('');
  
  console.log('📋 OPTION 3: Use marketplace_listings as read/write');
  console.log('   - Check if marketplace_listings is actually a table (not view)');
  console.log('   - If it\'s a table, use it directly');
  console.log('   - No need for separate listings table');
  console.log('');
  
  console.log('🎯 IMMEDIATE ACTION:');
  console.log('Let\'s revert the dashboard to use marketplace_listings so Emily can see her data right now!');
}

async function runVerification() {
  const tableExists = await verifyListingsTable();
  await testAlternativeApproach();
  await recommendQuickFix();
  
  console.log('\n📞 RECOMMENDATION:');
  if (tableExists) {
    console.log('✅ listings table exists but has permission issues');
    console.log('   Need to fix RLS policies or permissions');
  } else {
    console.log('❌ listings table doesn\'t exist or has major issues');
    console.log('   Recommend reverting to marketplace_listings for now');
  }
  
  console.log('\n🚀 QUICKEST FIX: Revert dashboard to marketplace_listings');
  console.log('   This will immediately show Emily\'s 6 listings!');
}

runVerification().catch(console.error);
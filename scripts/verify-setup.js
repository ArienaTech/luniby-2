#!/usr/bin/env node

/**
 * Setup Verification Script
 * Tests Sentry and SendGrid configurations
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('🔧 LUNIBY MARKETPLACE - SETUP VERIFICATION\n');

// Color codes for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, symbol, message) {
  console.log(`${colors[color]}${symbol} ${message}${colors.reset}`);
}

// Test SendGrid Configuration
function testSendGrid() {
  console.log(`${colors.blue}📧 SENDGRID CONFIGURATION${colors.reset}`);
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.REACT_APP_FROM_EMAIL;
  const fromName = process.env.REACT_APP_FROM_NAME;
  
  if (!apiKey) {
    log('red', '❌', 'SENDGRID_API_KEY not found in environment');
    return false;
  }
  
  if (!apiKey.startsWith('SG.')) {
    log('red', '❌', 'Invalid SendGrid API key format');
    return false;
  }
  
  log('green', '✅', 'SendGrid API Key found and valid format');
  log('green', '✅', `From Email: ${fromEmail || 'noreply@lunibycom.com'}`);
  log('green', '✅', `From Name: ${fromName || 'Luniby Marketplace'}`);
  
  // Test SendGrid connection
  try {
    sgMail.setApiKey(apiKey);
    log('green', '✅', 'SendGrid client configured successfully');
    return true;
  } catch (error) {
    log('red', '❌', `SendGrid configuration error: ${error.message}`);
    return false;
  }
}

// Test Sentry Configuration
function testSentry() {
  console.log(`\n${colors.blue}🚨 SENTRY CONFIGURATION${colors.reset}`);
  
  const authToken = process.env.SENTRY_AUTH_TOKEN;
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  
  if (!authToken) {
    log('red', '❌', 'SENTRY_AUTH_TOKEN not found in environment');
    return false;
  }
  
  if (!authToken.startsWith('sntrys_')) {
    log('red', '❌', 'Invalid Sentry auth token format');
    return false;
  }
  
  log('green', '✅', 'Sentry Auth Token found and valid format');
  
  // Decode token info
  try {
    const tokenData = authToken.split('_')[1];
    const decoded = JSON.parse(Buffer.from(tokenData, 'base64').toString());
    log('green', '✅', `Organization: ${decoded.org}`);
    log('green', '✅', `Region: ${decoded.region_url}`);
  } catch (error) {
    log('yellow', '⚠️', 'Could not decode token details');
  }
  
  if (!dsn) {
    log('yellow', '⚠️', 'REACT_APP_SENTRY_DSN not configured');
    log('blue', 'ℹ️', 'To get your DSN:');
    console.log('   1. Go to https://de.sentry.io');
    console.log('   2. Navigate to organization: lunibycom');
    console.log('   3. Select your project');
    console.log('   4. Go to Settings → Client Keys (DSN)');
    console.log('   5. Add to .env: REACT_APP_SENTRY_DSN=your-dsn');
    return false;
  }
  
  if (dsn.includes('de.sentry.io')) {
    log('green', '✅', 'Sentry DSN configured for EU region');
    return true;
  } else if (dsn.includes('sentry.io')) {
    log('green', '✅', 'Sentry DSN configured');
    return true;
  } else {
    log('red', '❌', 'Invalid Sentry DSN format');
    return false;
  }
}

// Test Environment File
function testEnvironment() {
  console.log(`\n${colors.blue}📁 ENVIRONMENT CONFIGURATION${colors.reset}`);
  
  const fs = require('fs');
  
  if (!fs.existsSync('.env')) {
    log('red', '❌', '.env file not found');
    return false;
  }
  
  log('green', '✅', '.env file exists');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n').filter(line => 
    line.trim() && !line.startsWith('#') && line.includes('=')
  );
  
  log('green', '✅', `${lines.length} environment variables configured`);
  
  return true;
}

// Send Test Email (optional)
async function sendTestEmail() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('\n📧 Send test email? (y/N): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.question('Enter test email address: ', async (email) => {
          try {
            const msg = {
              to: email,
              from: {
                email: process.env.REACT_APP_FROM_EMAIL || 'noreply@lunibycom.com',
                name: process.env.REACT_APP_FROM_NAME || 'Luniby Marketplace'
              },
              subject: 'Luniby Marketplace - Setup Test',
              text: 'This is a test email to verify your SendGrid configuration is working correctly.',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">🎉 Setup Test Successful!</h2>
                  <p>This is a test email to verify your SendGrid configuration is working correctly.</p>
                  <p><strong>Your Luniby Marketplace email system is ready!</strong></p>
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px;">
                    This email was sent from your Luniby Marketplace setup verification script.
                  </p>
                </div>
              `
            };
            
            await sgMail.send(msg);
            log('green', '✅', `Test email sent successfully to ${email}`);
          } catch (error) {
            log('red', '❌', `Failed to send test email: ${error.message}`);
          }
          rl.close();
          resolve();
        });
      } else {
        rl.close();
        resolve();
      }
    });
  });
}

// Main verification function
async function runVerification() {
  const results = {
    environment: testEnvironment(),
    sendgrid: testSendGrid(),
    sentry: testSentry()
  };
  
  console.log(`\n${colors.blue}📊 VERIFICATION SUMMARY${colors.reset}`);
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  
  if (passed === total) {
    log('green', '🎉', `All ${total} checks passed! Your setup is ready.`);
  } else {
    log('yellow', '⚠️', `${passed}/${total} checks passed. Review the issues above.`);
  }
  
  // Offer to send test email if SendGrid is working
  if (results.sendgrid) {
    await sendTestEmail();
  }
  
  console.log(`\n${colors.blue}🚀 NEXT STEPS${colors.reset}`);
  console.log('1. If Sentry DSN is missing, follow the instructions above');
  console.log('2. Run: npm start');
  console.log('3. Test your application');
  console.log('4. Monitor errors in Sentry dashboard');
  console.log('5. Check email delivery in SendGrid dashboard');
}

// Run the verification
runVerification().catch(console.error);
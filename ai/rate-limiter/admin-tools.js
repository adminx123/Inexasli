#!/usr/bin/env node

// Admin Support Tools for Rate Limiting and Payment Management
// Usage: node admin-tools.js <command> [options]

const RATE_LIMITER_URL = 'https://ratelimit.4hm7q4q75z.workers.dev/';
const ADMIN_KEY = process.env.ADMIN_KEY || 'your-secure-admin-key-here';

async function resetUserUsage(email) {
  console.log(`Resetting usage for user: ${email}`);
  
  try {
    const response = await fetch(RATE_LIMITER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task: 'resetUserUsage',
        adminKey: ADMIN_KEY,
        userEmail: email
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.message) {
      console.log('✅ Success:', data.message);
      console.log('📱 Devices reset:', data.devicesReset);
    } else {
      console.error('❌ Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function getUserStatus(email, fingerprint) {
  console.log(`Getting status for user: ${email}`);
  
  try {
    const payload = {
      task: 'getUserStatus',
      module: 'admin',
      fingerprint: fingerprint || { deviceId: 'admin', sessionId: 'admin' }
    };
    
    if (email) {
      payload.email = email;
    }
    
    const response = await fetch(RATE_LIMITER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('📊 User Status:');
      console.log('💳 Payment Status:', data.paymentStatus);
      console.log('⏱️  Rate Limit Status:', data.rateLimitStatus);
      console.log('🔓 Is Paid:', data.isPaid);
      console.log('📈 Remaining Usage:', data.remaining);
    } else {
      console.error('❌ Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

function showHelp() {
  console.log(`
🛠️  Admin Support Tools for Rate Limiting & Payment Management

Usage:
  node admin-tools.js <command> [options]

Commands:
  reset <email>           Reset daily usage for a user by email
  status <email>          Get payment and usage status for a user
  help                    Show this help message

Examples:
  node admin-tools.js reset user@example.com
  node admin-tools.js status user@example.com

Environment Variables:
  ADMIN_KEY              Admin key for authentication (required)

Note: Make sure ADMIN_KEY matches the key in your worker environment.
  `);
}

// Main execution
const [,, command, ...args] = process.argv;

switch (command) {
  case 'reset':
    if (!args[0]) {
      console.error('❌ Error: Email address required');
      console.log('Usage: node admin-tools.js reset <email>');
      process.exit(1);
    }
    resetUserUsage(args[0]);
    break;
    
  case 'status':
    if (!args[0]) {
      console.error('❌ Error: Email address required');
      console.log('Usage: node admin-tools.js status <email>');
      process.exit(1);
    }
    getUserStatus(args[0]);
    break;
    
  case 'help':
  case '--help':
  case '-h':
  default:
    showHelp();
    break;
}

// Stage 1 Test: Rate Limiter Foundation with Subscription Expiry
// Test the enhanced subscription expiry checking and TTL logic

const testData = {
  // Test case 1: Active subscription
  activeSubscription: {
    fingerprint: { deviceId: "test-device-1", sessionId: "test-session-1" },
    email: "test@example.com",
    module: "fashion",
    userData: {
      paymentStatus: {
        isPaid: true,
        tier: "MONTHLY",
        subscriptionEndsAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        subscriptionId: "sub_test123"
      },
      dailyCount: 2
    }
  },
  
  // Test case 2: Expired subscription
  expiredSubscription: {
    fingerprint: { deviceId: "test-device-2", sessionId: "test-session-2" },
    email: "expired@example.com", 
    module: "fashion",
    userData: {
      paymentStatus: {
        isPaid: true,
        tier: "MONTHLY",
        subscriptionEndsAt: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
        subscriptionId: "sub_expired123"
      },
      dailyCount: 4 // Above free tier limit
    }
  },
  
  // Test case 3: Free user
  freeUser: {
    fingerprint: { deviceId: "test-device-3", sessionId: "test-session-3" },
    email: null,
    module: "fashion",
    userData: {
      paymentStatus: {
        isPaid: false,
        tier: "FREE"
      },
      dailyCount: 1
    }
  }
};

// Log test scenario expectations
console.log("STAGE 1 TEST SCENARIOS:");
console.log("======================");
console.log("1. Active Subscription:");
console.log("   - Should remain MONTHLY tier");
console.log("   - TTL should be ~37 days (7 days + 30 day buffer)");
console.log("   - Request should be allowed");

console.log("\n2. Expired Subscription:");
console.log("   - Should auto-downgrade to FREE tier");
console.log("   - Daily count should be reset to free limit");
console.log("   - TTL should be 30 days (buffer only)");
console.log("   - Request should be blocked (exceeds free limit)");

console.log("\n3. Free User:");
console.log("   - Should remain FREE tier");
console.log("   - TTL should be 2 days");
console.log("   - Request should be allowed");

console.log("\n4. TTL Calculations:");
console.log("   - Paid active: (days until expiry) + 30 days");
console.log("   - Paid expired: 30 days (buffer only)");
console.log("   - Free: 2 days");

console.log("\nTo test: Send POST requests to rate limiter with these scenarios");
console.log("Check response for tier changes, TTL values, and subscription status");

// Helper function to calculate expected TTL
function calculateExpectedTTL(subscriptionEndsAt) {
  const now = Date.now();
  const subscriptionBuffer = 30 * 24 * 60 * 60; // 30 days in seconds
  
  if (subscriptionEndsAt) {
    const subscriptionEndSeconds = Math.ceil(subscriptionEndsAt / 1000);
    const currentSeconds = Math.ceil(now / 1000);
    
    if (subscriptionEndSeconds > currentSeconds) {
      return (subscriptionEndSeconds - currentSeconds) + subscriptionBuffer;
    } else {
      return subscriptionBuffer;
    }
  }
  
  return 172800; // 2 days for free users
}

// Expected TTL calculations
console.log("\nEXPECTED TTL VALUES:");
console.log("==================");
testData.activeSubscription.expectedTTL = calculateExpectedTTL(testData.activeSubscription.userData.paymentStatus.subscriptionEndsAt);
testData.expiredSubscription.expectedTTL = calculateExpectedTTL(testData.expiredSubscription.userData.paymentStatus.subscriptionEndsAt);
testData.freeUser.expectedTTL = calculateExpectedTTL(null);

console.log(`Active: ${Math.round(testData.activeSubscription.expectedTTL / 86400)} days`);
console.log(`Expired: ${Math.round(testData.expiredSubscription.expectedTTL / 86400)} days`);
console.log(`Free: ${Math.round(testData.freeUser.expectedTTL / 86400)} days`);

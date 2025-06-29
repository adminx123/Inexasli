/**
 * COMPREHENSIVE DEBUGGING SCRIPT FOR RATE LIMIT STATUS ISSUE
 * 
 * This script helps identify why rateLimitStatus is not being created
 * in localStorage for paid users, despite all the defensive logic.
 */

// Configuration and test data
const DEBUG_CONFIG = {
    TEST_EMAIL: 'debug@inexasli.com',
    EXPECTED_PAID_STATUS: {
        remaining: { perDay: 5 },
        limits: { perDay: 5 },
        isPaid: true,
        allowed: true,
        email: 'debug@inexasli.com',
        lastUpdated: Date.now()
    }
};

// Debug utilities
class LocalStorageDebugger {
    constructor() {
        this.logs = [];
        this.startTime = Date.now();
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const elapsed = Date.now() - this.startTime;
        const logEntry = {
            timestamp,
            elapsed,
            level,
            message
        };
        this.logs.push(logEntry);
        
        const colors = {
            error: '#e74c3c',
            warn: '#f39c12', 
            success: '#27ae60',
            info: '#3498db'
        };
        
        console.log(`%c[${elapsed}ms] ${message}`, `color: ${colors[level] || colors.info}`);
        return logEntry;
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
        this.startTime = Date.now();
    }
}

// Global debugger instance
const debugger = new LocalStorageDebugger();

// Helper functions
function setLocal(name, value) {
    try {
        localStorage.setItem(name, encodeURIComponent(value));
        debugger.log(`✅ localStorage.setItem('${name}', '${encodeURIComponent(value)}') successful`, 'success');
        return true;
    } catch (error) {
        debugger.log(`❌ localStorage.setItem('${name}') failed: ${error.message}`, 'error');
        return false;
    }
}

function getLocal(name) {
    try {
        const value = localStorage.getItem(name);
        const decoded = value !== null ? decodeURIComponent(value) : '';
        debugger.log(`🔍 localStorage.getItem('${name}') = '${decoded}'`, 'info');
        return decoded;
    } catch (error) {
        debugger.log(`❌ localStorage.getItem('${name}') failed: ${error.message}`, 'error');
        return '';
    }
}

function clearTestData() {
    const testKeys = ['authenticated', 'userEmail', 'rateLimitStatus', '_userFingerprint'];
    testKeys.forEach(key => {
        localStorage.removeItem(key);
        debugger.log(`🗑️ Removed localStorage key: ${key}`);
    });
    debugger.log('🧹 All test data cleared', 'success');
}

// Test localStorage basic functionality
function testLocalStorageBasic() {
    debugger.log('🧪 Testing basic localStorage functionality...');
    
    try {
        // Test 1: Basic string storage
        const testKey = 'test_basic_' + Date.now();
        const testValue = 'Hello World ' + Math.random();
        
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        
        if (retrieved === testValue) {
            debugger.log('✅ Basic localStorage read/write test PASSED', 'success');
        } else {
            throw new Error(`Value mismatch: expected "${testValue}", got "${retrieved}"`);
        }
        
        // Test 2: JSON storage
        const jsonKey = 'test_json_' + Date.now();
        const jsonValue = { test: true, number: 42, string: 'hello' };
        
        localStorage.setItem(jsonKey, JSON.stringify(jsonValue));
        const retrievedJson = JSON.parse(localStorage.getItem(jsonKey));
        
        if (retrievedJson.test === true && retrievedJson.number === 42) {
            debugger.log('✅ JSON localStorage test PASSED', 'success');
        } else {
            throw new Error('JSON storage/retrieval failed');
        }
        
        // Clean up
        localStorage.removeItem(testKey);
        localStorage.removeItem(jsonKey);
        
        return true;
        
    } catch (error) {
        debugger.log(`❌ Basic localStorage test FAILED: ${error.message}`, 'error');
        return false;
    }
}

// Test rateLimitStatus creation directly
function testRateLimitStatusCreationDirect() {
    debugger.log('🚀 Testing direct rateLimitStatus creation...');
    
    try {
        // Clear any existing rateLimitStatus
        localStorage.removeItem('rateLimitStatus');
        debugger.log('🧹 Cleared existing rateLimitStatus');
        
        // Test 1: Direct JSON storage
        const testStatus = {
            remaining: { perDay: 5 },
            limits: { perDay: 5 },
            isPaid: true,
            allowed: true,
            email: DEBUG_CONFIG.TEST_EMAIL,
            lastUpdated: Date.now()
        };
        
        debugger.log('📝 Attempting to store rateLimitStatus directly...');
        localStorage.setItem('rateLimitStatus', JSON.stringify(testStatus));
        
        // Verify it was stored
        const stored = localStorage.getItem('rateLimitStatus');
        if (stored) {
            const parsed = JSON.parse(stored);
            debugger.log('✅ Direct rateLimitStatus creation SUCCESSFUL', 'success');
            debugger.log(`📊 Stored data: ${JSON.stringify(parsed, null, 2)}`);
            return true;
        } else {
            throw new Error('rateLimitStatus was not stored');
        }
        
    } catch (error) {
        debugger.log(`❌ Direct rateLimitStatus creation FAILED: ${error.message}`, 'error');
        return false;
    }
}

// Test the actual ensureRateLimitStatusForPaidUser function
async function testEnsureRateLimitStatusFunction() {
    debugger.log('🎯 Testing ensureRateLimitStatusForPaidUser function...');
    
    try {
        // Set up paid user scenario
        clearTestData();
        setLocal('authenticated', 'paid');
        setLocal('userEmail', DEBUG_CONFIG.TEST_EMAIL);
        
        // Import and call the function
        debugger.log('📥 Importing rateLimiter.js...');
        const { ensureRateLimitStatusForPaidUser } = await import('/ai/rate-limiter/rateLimiter.js');
        
        debugger.log('🔧 Calling ensureRateLimitStatusForPaidUser()...');
        const result = ensureRateLimitStatusForPaidUser();
        
        // Check the result
        const storedStatus = localStorage.getItem('rateLimitStatus');
        
        if (storedStatus) {
            const parsed = JSON.parse(storedStatus);
            debugger.log('✅ ensureRateLimitStatusForPaidUser() SUCCESSFUL', 'success');
            debugger.log(`📊 Function result: ${JSON.stringify(result, null, 2)}`);
            debugger.log(`📊 Stored data: ${JSON.stringify(parsed, null, 2)}`);
            return { success: true, data: parsed };
        } else {
            debugger.log('❌ ensureRateLimitStatusForPaidUser() FAILED - no rateLimitStatus created', 'error');
            debugger.log(`🔍 Function returned: ${JSON.stringify(result)}`);
            return { success: false, reason: 'No rateLimitStatus created' };
        }
        
    } catch (error) {
        debugger.log(`❌ ensureRateLimitStatusForPaidUser() test FAILED: ${error.message}`, 'error');
        return { success: false, reason: error.message };
    }
}

// Test race condition scenarios
function testRaceConditions() {
    debugger.log('⚡ Testing race condition scenarios...');
    
    return new Promise((resolve) => {
        try {
            clearTestData();
            
            // Simulate concurrent localStorage operations
            const operations = [];
            
            // Operation 1: Set authenticated
            operations.push(() => {
                setLocal('authenticated', 'paid');
                debugger.log('🔄 Op1: Set authenticated=paid');
            });
            
            // Operation 2: Set email
            operations.push(() => {
                setLocal('userEmail', DEBUG_CONFIG.TEST_EMAIL);
                debugger.log('🔄 Op2: Set userEmail');
            });
            
            // Operation 3: Try to create rateLimitStatus
            operations.push(() => {
                const status = JSON.stringify(DEBUG_CONFIG.EXPECTED_PAID_STATUS);
                localStorage.setItem('rateLimitStatus', status);
                debugger.log('🔄 Op3: Set rateLimitStatus');
            });
            
            // Execute operations with small random delays
            let completedOps = 0;
            operations.forEach((op, index) => {
                setTimeout(() => {
                    op();
                    completedOps++;
                    if (completedOps === operations.length) {
                        // Check final state
                        setTimeout(() => {
                            const finalStatus = localStorage.getItem('rateLimitStatus');
                            const authenticated = getLocal('authenticated');
                            const email = getLocal('userEmail');
                            
                            debugger.log(`🏁 Race condition test complete:`);
                            debugger.log(`   authenticated: ${authenticated}`);
                            debugger.log(`   userEmail: ${email}`);
                            debugger.log(`   rateLimitStatus: ${finalStatus ? 'EXISTS' : 'MISSING'}`);
                            
                            resolve({
                                success: !!finalStatus,
                                authenticated,
                                email,
                                rateLimitStatus: finalStatus
                            });
                        }, 100);
                    }
                }, Math.random() * 50 + index * 10);
            });
            
        } catch (error) {
            debugger.log(`❌ Race condition test FAILED: ${error.message}`, 'error');
            resolve({ success: false, reason: error.message });
        }
    });
}

// Test browser-specific issues
function testBrowserSpecificIssues() {
    debugger.log('🌐 Testing browser-specific localStorage issues...');
    
    const issues = [];
    
    // Test 1: Check localStorage availability
    if (typeof Storage === 'undefined') {
        issues.push('localStorage not supported');
    }
    
    // Test 2: Check if in private/incognito mode
    try {
        localStorage.setItem('incognito_test', 'test');
        localStorage.removeItem('incognito_test');
    } catch (e) {
        issues.push('Private/incognito mode detected');
    }
    
    // Test 3: Check storage quota
    let quotaExceeded = false;
    try {
        const largData = 'x'.repeat(5000000); // 5MB
        localStorage.setItem('quota_test', largData);
        localStorage.removeItem('quota_test');
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            quotaExceeded = true;
            issues.push('Storage quota low');
        }
    }
    
    // Test 4: Check for extensions/scripts interfering
    const originalSetItem = localStorage.setItem;
    let setItemIntercepted = false;
    if (originalSetItem.toString().includes('[native code]') === false) {
        setItemIntercepted = true;
        issues.push('localStorage.setItem appears to be intercepted');
    }
    
    debugger.log(`🔍 Browser issue check results:`);
    if (issues.length === 0) {
        debugger.log('✅ No browser-specific issues detected', 'success');
    } else {
        issues.forEach(issue => {
            debugger.log(`⚠️ Issue: ${issue}`, 'warn');
        });
    }
    
    return {
        hasIssues: issues.length > 0,
        issues,
        quotaExceeded,
        setItemIntercepted
    };
}

// Run comprehensive test suite
async function runComprehensiveTests() {
    debugger.clearLogs();
    debugger.log('🚀 Starting comprehensive localStorage debugging tests...');
    
    const results = {
        basic: false,
        direct: false,
        function: null,
        raceCondition: null,
        browserIssues: null
    };
    
    // Test 1: Basic localStorage functionality
    results.basic = testLocalStorageBasic();
    
    // Test 2: Direct rateLimitStatus creation
    results.direct = testRateLimitStatusCreationDirect();
    
    // Test 3: Actual function test
    results.function = await testEnsureRateLimitStatusFunction();
    
    // Test 4: Race condition test
    results.raceCondition = await testRaceConditions();
    
    // Test 5: Browser-specific issues
    results.browserIssues = testBrowserSpecificIssues();
    
    // Generate summary report
    debugger.log('📋 COMPREHENSIVE TEST RESULTS:');
    debugger.log(`  ✅ Basic localStorage: ${results.basic ? 'PASS' : 'FAIL'}`);
    debugger.log(`  ✅ Direct creation: ${results.direct ? 'PASS' : 'FAIL'}`);
    debugger.log(`  ✅ Function test: ${results.function?.success ? 'PASS' : 'FAIL'}`);
    debugger.log(`  ✅ Race condition: ${results.raceCondition?.success ? 'PASS' : 'FAIL'}`);
    debugger.log(`  ✅ Browser issues: ${results.browserIssues?.hasIssues ? 'DETECTED' : 'NONE'}`);
    
    if (!results.function?.success) {
        debugger.log(`❌ FUNCTION FAILURE REASON: ${results.function?.reason}`, 'error');
    }
    
    if (!results.raceCondition?.success) {
        debugger.log(`❌ RACE CONDITION FAILURE REASON: ${results.raceCondition?.reason}`, 'error');
    }
    
    if (results.browserIssues?.hasIssues) {
        results.browserIssues.issues.forEach(issue => {
            debugger.log(`⚠️ BROWSER ISSUE: ${issue}`, 'warn');
        });
    }
    
    return results;
}

// Export functions for use in browser console
window.debugLocalStorage = {
    runComprehensiveTests,
    testLocalStorageBasic,
    testRateLimitStatusCreationDirect,
    testEnsureRateLimitStatusFunction,
    testRaceConditions,
    testBrowserSpecificIssues,
    clearTestData,
    getLogs: () => debugger.getLogs(),
    setLocal,
    getLocal
};

// Auto-run tests when script loads
debugger.log('🔧 localStorage debug script loaded. Run window.debugLocalStorage.runComprehensiveTests() to start.');

export { runComprehensiveTests, debugger as localStorageDebugger };

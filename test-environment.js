// Environment Detection Test
// Add this to your browser console to test environment detection

function testEnvironmentDetection() {
    const isLocalDev = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
    const paymentEndpoint = isLocalDev 
        ? "https://stripeintegration-dev.4hm7q4q75z.workers.dev/"
        : "https://stripeintegration.4hm7q4q75z.workers.dev/";
    
    console.log("Current hostname:", window.location.hostname);
    console.log("Current origin:", window.location.origin);
    console.log("Is local development:", isLocalDev);
    console.log("Payment endpoint:", paymentEndpoint);
    
    if (isLocalDev) {
        console.log("✅ Development environment detected - using dev worker");
        console.log("✅ Stripe will redirect to: http://127.0.0.1:5500/payment/redirectUrl.html");
    } else {
        console.log("🌐 Production environment detected - using production worker");
        console.log("🌐 Stripe will redirect to: https://inexasli.com/payment/redirectUrl.html");
    }
}

// Run the test
testEnvironmentDetection();

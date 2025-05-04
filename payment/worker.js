// Basic Cloudflare Worker for Stripe checkout integration

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    // Only process POST requests
    if (request.method === "POST") {
      try {
        const data = await request.json();
        
        // Check if this is a payment request
        if (data.task === "pay") {
          // Use Stripe API directly instead of requiring the library
          const stripeUrl = 'https://api.stripe.com/v1/checkout/sessions';
          
          const formData = new URLSearchParams();
          formData.append('payment_method_types[]', 'card');
          formData.append('customer_email', data.client_email);
          formData.append('client_reference_id', data.client_name);
          formData.append('line_items[0][price]', env.PRICE_ID);
          formData.append('line_items[0][quantity]', '1');
          formData.append('mode', 'subscription');
          // Fix URL case sensitivity - ensure it matches the actual file name in your system
          formData.append('success_url', `${env.DOMAIN_URL}/payment/redirectUrl.html?session_id={CHECKOUT_SESSION_ID}`);
          formData.append('cancel_url', `${env.DOMAIN_URL}/payment/redirectUrl.html?canceled=true`);
          
          const response = await fetch(stripeUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.STRIPE_RESTRICTED_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message || 'Failed to create Stripe session');
          }
          
          const session = await response.json();
          
          return new Response(JSON.stringify({ id: session.id }), {
            status: 200,
            headers: corsHeaders()
          });
        } 
        // Add payment verification endpoint
        else if (data.task === "checkPayment" && data.sessionId) {
          // Retrieve the session to check payment status
          const sessionUrl = `https://api.stripe.com/v1/checkout/sessions/${data.sessionId}`;
          
          const sessionResponse = await fetch(sessionUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${env.STRIPE_RESTRICTED_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          });
          
          if (!sessionResponse.ok) {
            const error = await sessionResponse.json();
            throw new Error(error.error.message || 'Failed to retrieve session');
          }
          
          const session = await sessionResponse.json();
          
          // Check the payment status - subscription mode uses different attributes
          let paymentStatus = "unpaid";
          if (session.subscription) {
            // For subscription mode, we need to check if a subscription was created
            paymentStatus = "paid";
          } else if (session.payment_status === "paid") {
            paymentStatus = "paid";
          } else if (session.payment_status === "no_payment_required") {
            paymentStatus = "no_payment_required";
          }
          
          return new Response(JSON.stringify({ 
            paymentStatus: paymentStatus,
            customerId: session.customer,
            customerEmail: session.customer_details?.email,
            subscriptionId: session.subscription
          }), {
            status: 200,
            headers: corsHeaders()
          });
        }
        else {
          return new Response(JSON.stringify({ error: "Invalid task" }), {
            status: 400,
            headers: corsHeaders()
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders()
        });
      }
    }

    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders()
    });
  }
};

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
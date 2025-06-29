/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { setLocal } from '/utility/setlocal.js';
import { getLocal } from '/utility/getlocal.js';

const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("session_id");
const container = document.querySelector(".container");
// Payment endpoint
const paymentEndpoint = "https://stripeintegration.4hm7q4q75z.workers.dev/";

document.addEventListener("DOMContentLoaded", async () => {
  const paid = getLocal("authenticated");

  // Simplified redirect function - always go to landing.html
  const redirectToLanding = () => {
    console.log("Redirecting to landing page");
    window.location.href = "/ai/landing/landing.html";
  };

  if (paid === "paid") {
    redirectToLanding();
  } else {
    if (sessionId) {
      try {
        console.log("Checking payment status with Cloudflare Worker for session:", sessionId);
        const res = await fetch(paymentEndpoint, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ task: "checkPayment", sessionId: sessionId }),
          mode: "cors"
        });
        
        console.log("Payment verification response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Payment verification error:", errorText);
          throw new Error(`Payment verification failed: ${res.status} ${errorText}`);
        }
        
        const data = await res.json();
        console.log("Payment verification response:", data);

        if (data.paymentStatus) {
          if (data.paymentStatus === "paid" || data.paymentStatus === "no_payment_required") {
            setLocal("authenticated", "paid", 32);
            container.innerHTML = "Payment successful! Redirecting...";
            
            // Remove the worksheet logic since website has changed
            setTimeout(redirectToLanding, 2000); // 2s delay for UX
          }
        } else if (data.error) {
          container.innerHTML = `
            <h1 style="text-transform: capitalize;">Payment Failed</h1>
            <p>Sorry, your payment attempt failed</p>
            <p>${data.error || ""}</p>
            <a href="mailto:support@inexasli.com" class="contact-support">Something's wrong? Contact support</a>
          `;
        } else {
          container.innerHTML = `
            <h1 style="text-transform: capitalize;">Payment Failed</h1>
            <p>Sorry, your payment attempt failed</p>
            <a href="mailto:support@inexasli.com" class="contact-support">Something's wrong? Contact support</a>
          `;
        }
      } catch (error) {
        console.error("Payment verification error:", error.message);
        container.innerHTML = `
          <h1 style="text-transform: capitalize;">Something Went Wrong</h1>
          <p>${error.message}</p>
          <p>Please try again later or contact support.</p>
          <a href="mailto:support@inexasli.com" class="contact-support">Contact Support</a>`;
      }
    } else {
      console.log("No session ID found in URL");
      container.innerHTML = "No or invalid session ID";
      redirectToLanding();
    }
  }
});
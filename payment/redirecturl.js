/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';
import { getCookie } from '/server/scripts/getcookie.js';

const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("session_id");
const container = document.querySelector(".container");
const lambda = "https://cup7hlgbjk.execute-api.us-east-1.amazonaws.com/production/create-checkout-session";

document.addEventListener("DOMContentLoaded", async () => {
  const paid = getLocal("authenticated");

  const redirectToLatest = () => {
    const promptCookie = getCookie("prompt") || { timestamp: 0 };
    const summaryCookie = getCookie("summary") || { timestamp: 0 };
    console.log(`promptTime: ${promptCookie.timestamp}, summaryTime: ${summaryCookie.timestamp}`);
    const redirectUrl = promptCookie.timestamp > summaryCookie.timestamp
      ? "/create/prompt.html"
      : "/budget/summary.html";
    window.location.href = redirectUrl;
  };

  if (paid === "paid") {
    redirectToLatest();
  } else {
    if (sessionId) {
      try {
        const res = await fetch(lambda, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task: "checkPayment", sessionId: sessionId }),
        });
        const data = await res.json();

        if (data.paymentStatus) {
          if (data.paymentStatus === "paid" || data.paymentStatus === "no_payment_required") {
            setLocal("authenticated", "paid", 32);
            container.innerHTML = "payment successful redirecting ......";
            const calculatedFromWorksheet = getLocal("calculated_from_worksheet");
            if (calculatedFromWorksheet === "true") {
              const totalRevenue = getLocal("totalRevenue");
              if (totalRevenue) {
                setLocal("income_sole_prop", totalRevenue, 32);
                setLocal("calculated_from_worksheet", "resolved", 32);
              }
            }
            setTimeout(redirectToLatest, 2000); // 2s delay for UX
          }
        } else if (data.error) {
          container.innerHTML = `
            <h1 style="text-transform: capitalize;">payment failed</h1>
            <p>sorry your payment attempt failed</p>
            <p>${data.error || ""}</p>
            <a href="mailto:support@inexasli.com" class="contact-support">something's wrong? contact support</a>
          `;
        } else {
          container.innerHTML = `
            <h1 style="text-transform: capitalize;">payment failed</h1>
            <p>sorry your payment attempt failed</p>
            <a href="mailto:support@inexasli.com" class="contact-support">something's wrong? contact support</a>
          `;
        }
      } catch (error) {
        console.error(error.message);
        container.innerHTML = `
          <h1 style="text-transform: capitalize;">something went wrong</h1>
          <p>${error.message}</p>
          <p>try again later</p>`;
      }
    } else {
      container.innerHTML = "no or invalid session id";
      redirectToLatest();
    }
  }
});
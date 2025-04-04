
       import { setLocal } from '/server/scripts/setlocal.js';
       import { getLocal } from '/server/scripts/getLocal.js';
       import { getCookie } from '/server/scripts/getcookie.js'; // Import getCookie
 
       const urlParams = new URLSearchParams(window.location.search);
       const sessionId = urlParams.get("session_id");
       const container = document.querySelector(".container");
 
       const lambda =
         "https://cup7hlgbjk.execute-api.us-east-1.amazonaws.com/production/create-checkout-session";
 
       document.addEventListener("DOMContentLoaded", async () => {
         const paid = getLocal("authenticated");
 
         if (paid === "paid") {
           // Check newest cookie and redirect
           const promptCookie = getCookie("prompt") || { timestamp: 0 };
           const summaryCookie = getCookie("summary") || { timestamp: 0 };
 
           const redirectUrl =
             promptCookie.timestamp > summaryCookie.timestamp
               ? "/create/prompt.html" // Adjust URL as needed
               : "/budget/summary.html";
 
           window.location.href = redirectUrl;
         } else {
           if (sessionId) {
             try {
               const res = await fetch(lambda, {
                 method: "POST",
                 headers: {
                   "Content-Type": "application/json",
                 },
                 body: JSON.stringify({
                   task: "checkPayment",
                   sessionId: sessionId,
                 }),
               });
 
               const data = await res.json();
 
               if (data.paymentStatus) {
                 if (data.paymentStatus === "paid" || data.paymentStatus === 'no_payment_required') {
                   setLocal('authenticated', "paid", 32);
                   container.innerHTML = "payment successful redirecting ......";
                   const calculatedFromWorksheet = getLocal("calculated_from_worksheet");
 
                   if (calculatedFromWorksheet === 'true') {
                     const totalRevenue = getLocal("totalRevenue");
                     
                     if (totalRevenue) {
                       setLocal("income_sole_prop", totalRevenue, 32);
                       setLocal("calculated_from_worksheet", "resolved", 32);
                     }
                   }
 
                   // Check newest cookie and redirect
                   const promptCookie = getCookie("prompt") || { timestamp: 0 };
                   const summaryCookie = getCookie("summary") || { timestamp: 0 };
 
                   const redirectUrl =
                     promptCookie.timestamp > summaryCookie.timestamp
                       ? "/create/prompt.html" // Adjust URL as needed
                       : "/budget/summary.html";
 
                   window.location.href = redirectUrl;
                 }
               } else if (data.error) {
                 container.innerHTML = `
                   <h1 style="text-transform: capitalize;">payment failed</h1>
                   <p>sorry your payment attempt failed</p>
                   <p>${data.error ? data.error : ""}</p>
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
             // Check newest cookie and redirect
             const promptCookie = getCookie("prompt") || { timestamp: 0 };
             const summaryCookie = getCookie("summary") || { timestamp: 0 };
 
             const redirectUrl =
               promptCookie.timestamp > summaryCookie.timestamp
                 ? "/create/prompt.html" // Adjust URL as needed
                 : "/budget/summary.html";
 
             window.location.href = redirectUrl;
           }
         }
       });
     
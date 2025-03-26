
// THis is for the HTML***********

/* 
<form class="payment-form" id="payment-form" style="margin-top: 30px;">
  <input type="text" class="payment-input" id="username" placeholder="input name" required >
  <input type="email" class="payment-input" id="useremail" placeholder="input email" required >
  <div id="status"></div>
  <button    class="pay-button" id="pay-button">Subscribe for Premium Educational Insights!</button>
 
 </form>
 <a  href="mailto:support@inexasli.com" class=" contact-support" >I have paid</a>
 <a href="https://billing.stripe.com/p/login/3cs2a0d905QE71mbII" class=" contact-support" style="margin-bottom: 20px;">Customer portal</a>
 */






// This goes on Html page with the form ***********

/*
<script src="https://js.stripe.com/v3/" async ></script>

    */      
          


//This goes on teh Html where data is to be dipslayed
          /* 



          const paid = getCookie("authenticated");
          
          
          if (paid == "paid") {
              window.location.href = "/budget/summary.html";
      
        } else {
          document.body.style.display = 'initial'
        }*/
          


          
          // payment scripts
          const lambda =
            "https://cup7hlgbjk.execute-api.us-east-1.amazonaws.com/production/create-checkout-session";
          const publicKey =
            "pk_test_51POOigILSdrwu9bgkDsm3tpdvSgP8PaV0VA4u9fSFMILqQDG0Bv8GxxFfNuTAv7knKX3x6685X3lYvxCs2iGEd9x00cSBedhxi";
          
            const payForm = document.querySelector("#payment-form");
            
            
            payForm.addEventListener("submit", (e) => {
              const stripe = Stripe(publicKey);
              console.log('function hit ', e)
                e.preventDefault();
                const payButton = document.querySelector("#pay-button");
                const nameInput = document.querySelector("#username");
                const emailInput = document.querySelector("#useremail");
                let payStatus = document.querySelector("#status");
                payStatus.innerHTML = "Please wait ......";
                const name = document.querySelector("#username").value;
                const email = document.querySelector("#useremail").value;
          
                if (!name || !email) {
                  payStatus.innerHTML = "Please enter your name and email to proceed.";
                  nameInput.disabled = false;
                  emailInput.disabled = false;
                  payButton.disabled = false;
                  return;
                }
          
                nameInput.disabled = true;
                emailInput.disabled = true;
                payButton.disabled = true;
          
                //   alert(`${name} ${email}`);
          
                async function attemptPay() {
                  const options = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      task: "pay",
                      client_email: email,
                      client_name: name,
                    }),
                  };
                  try {
                    const res = await fetch(lambda, options);
          
                    const data = await res.json();
          
                    if (data.id) {
                      payStatus.innerHTML =
                        "payment proccessing, reload page after payment";
                      await stripe.redirectToCheckout({ sessionId: data.id });
                    } else {
                      nameInput.disabled = false;
                      emailInput.disabled = false;
                      payButton.disabled = false;
                      console.log("session data not returned: kindly retry", data);
          
                      if (data.error) {
                        payStatus.innerHTML = data.error;
                      } else {
                        payStatus.innerHTML = "Payment failed. Please try again";
                      }
                    }
                  } catch (error) {
                    console.error(error.message);
                    payStatus.innerHTML =
                      "Unable to connect. Check your internet and try again.";
          
                    nameInput.disabled = false;
                    emailInput.disabled = false;
                    payButton.disabled = false;
                  }
                }
          
                attemptPay();
              });

           
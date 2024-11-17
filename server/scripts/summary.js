const price = 30000; // price of the subscription in cents


function getCookie1(name) {
  const value1 = `; ${document.cookie}`;
  const parts1 = value1.split(`; ${name}=`);
  let cookieValue1 =
    parts1.length === 2
      ? decodeURIComponent(parts1.pop().split(";").shift())
      : "";

  return cookieValue1 === "" ? "0" : cookieValue1;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  let cookieValue =
    parts.length === 2
      ? decodeURIComponent(parts.pop().split(";").shift())
      : "";

  // Get the selected frequency from the dropdown
  const frequencyDropdown = document.getElementById("frequency");
  const selectedFrequency = frequencyDropdown.value;

  // Convert the annual amount based on the selected frequency, if applicable
  if (selectedFrequency !== "annually" && !isNaN(cookieValue)) {
    if (selectedFrequency === "monthly") {
      cookieValue /= 12;
    } else if (selectedFrequency === "weekly") {
      cookieValue /= 52;
    }
  }

  return cookieValue === "" ? "0" : cookieValue;
}

function runFullCalculations() {
  document.addEventListener("DOMContentLoaded", function () {
    // Function to retrieve cookie value by name
  
    function updateOnChange() {
      // Update HTML elements with cookie values
      document.getElementById("RegionDropdown").textContent =
        "Region: " + getCookie("RegionDropdown");
      document.getElementById("SubregionDropdown").textContent =
        "Subregion: " + getCookie("SubregionDropdown");
  
      document.getElementById("taxable_sum").textContent =
        " $" + getCookie("ANNUALTAXABLEINCOME");
      document.getElementById("region_tax_sum").textContent =
        " $" + getCookie("ANNUALREGIONALTAX");
      document.getElementById("subregion_tax_sum").textContent =
        " $" + getCookie("ANNUALSUBREGIONALTAX");
      document.getElementById("tax_sum").textContent =
        " $" + getCookie("ANNUALTAX");
  
      document.getElementById("annual_income_sum").textContent =
        " $" + getCookie("ANNUALINCOME");
      document.getElementById("annual_expense_sum").textContent =
        " $" + getCookie("ANNUALEXPENSESUM");
      document.getElementById("cpp_sum").textContent =
        " $" + getCookie("ANNUALCPP");
      document.getElementById("ANNUALEI").textContent =
        " $" + getCookie("ANNUALEI");
  
      document.getElementById("annual_cpp_seresult").textContent =
        " $" + getCookie("CPPPAYABLESELFEMPLOYED");
      document.getElementById("annual_cpp_eresult").textContent =
        " $" + getCookie("CPPPAYABLEEMPLOYED");
  
      document.getElementById("TOTALMEDICARE").textContent =
        " $" + getCookie("TOTALMEDICARE");
      document.getElementById("TOTALSOCIALSECURITY").textContent =
        " $" + getCookie("TOTALSOCIALSECURITY");
      document.getElementById("TOTALSOCIALSECURITYE").textContent =
        " $" + getCookie("TOTALSOCIALSECURITYE");
      document.getElementById("TOTALSOCIALSECURITYSE").textContent =
        " $" + getCookie("TOTALSOCIALSECURITYSE");
  
      document.getElementById("TOTALTAXCG").textContent =
        " $" + getCookie("TOTALTAXCG");
  
      document.getElementById("ASSETS").textContent = " $" + getCookie1("ASSETS");
      document.getElementById("LIABILITIES").textContent =
        " $" + getCookie1("LIABILITIES");
  
      let ANNUALDISPOSABLEINCOME;
  
      if (getCookie("RegionDropdown") === "USA") {
        ANNUALDISPOSABLEINCOME =
          parseFloat(getCookie("ANNUALINCOME")) -
          parseFloat(getCookie("ANNUALEXPENSESUM")) -
          parseFloat(getCookie("TOTALMEDICARE")) -
          parseFloat(getCookie("TOTALSOCIALSECURITY")) -
          parseFloat(getCookie("TOTALTAXCG")) -
          parseFloat(getCookie("ANNUALTAX"));
      } else if (getCookie("RegionDropdown") === "CAN") {
        ANNUALDISPOSABLEINCOME =
          parseFloat(getCookie("ANNUALINCOME")) -
          parseFloat(getCookie("ANNUALEXPENSESUM")) -
          parseFloat(getCookie("ANNUALEI")) -
          parseFloat(getCookie("ANNUALCPP")) -
          parseFloat(getCookie("ANNUALTAX"));
      }
  
      // Update HTML element with the calculated value
      document.getElementById("ANNUALDISPOSABLEINCOME").textContent =
        " $" + ANNUALDISPOSABLEINCOME.toFixed(2);
  
      const frequencyDropdown = document.getElementById("frequency");
  
      let TIMETOPAYDEBT;
  
      TIMETOPAYDEBT =
        parseFloat(getCookie1("LIABILITIESNA")) / ANNUALDISPOSABLEINCOME;
  
      // Determine the text based on the selected frequency
      let frequencyText = "";
      switch (frequencyDropdown.value) {
        case "annual":
          frequencyText = "Years";
          break;
        case "monthly":
          frequencyText = "Months";
          break;
        case "weekly":
          frequencyText = "Weeks";
          break;
        default:
          frequencyText = "Unknown";
      }
  
      document.getElementById("TIMETOPAYDEBT").textContent =
        TIMETOPAYDEBT.toFixed(2) + " " + frequencyText;
  
      let ANNUALGOVERNMENTOBLIGATIONS;
  
      if (getCookie("RegionDropdown") === "USA") {
        ANNUALGOVERNMENTOBLIGATIONS =
          parseFloat(getCookie("TOTALSOCIALSECURITY")) +
          parseFloat(getCookie("TOTALMEDICARE"));
      } else if (getCookie("RegionDropdown") === "CAN") {
        ANNUALGOVERNMENTOBLIGATIONS =
          parseFloat(getCookie("ANNUALCPP")) + parseFloat(getCookie("ANNUALEI"));
      }
  
      // Update HTML element with the calculated value
      document.getElementById("ANNUALGOVERNMENTOBLIGATIONS").textContent =
        " $" + ANNUALGOVERNMENTOBLIGATIONS.toFixed(2);
  
      NETWORTH =
        parseFloat(getCookie1("ASSETS")) - parseFloat(getCookie1("LIABILITIES"));
      document.getElementById("NETWORTH").textContent = "$" + NETWORTH.toFixed(2);
  
      DEBTTOINCOME =
        parseFloat(getCookie("LIABILITIES")) /
        parseFloat(getCookie("ANNUALINCOME"));
      function colorChangeDTI() {
        // Get the debt-to-income ratio value
        var debtToIncomeText =
          document.getElementById("DEBTTOINCOME").textContent;
        var debtToIncome = parseFloat(debtToIncomeText);
  
        // Define the ranges
        var greatRange = 20;
        var goodMinRange = 20;
        var goodMaxRange = 36;
  
        // Apply color based on the value
        if (debtToIncome < greatRange) {
          document.getElementById("DEBTTOINCOME").style.color = "green";
        } else if (debtToIncome >= goodMinRange && debtToIncome <= goodMaxRange) {
          document.getElementById("DEBTTOINCOME").style.color = "yellow";
        } else {
          document.getElementById("DEBTTOINCOME").style.color = "red";
        }
      }
      document.getElementById("DEBTTOINCOME").textContent =
        DEBTTOINCOME.toFixed(3);
      colorChangeDTI();
  
      HOUSINGTOINCOME =
        parseFloat(getCookie("HOUSING")) / parseFloat(getCookie("ANNUALINCOME")); // Use a descriptive variable name
  
      function colorChangeHTI() {
        // Get the housing-to-income ratio value
        var htiText = document.getElementById("HOUSINGTOINCOME").textContent;
        var hti = parseFloat(htiText);
  
        // Define the ranges
        var greatRange = 25;
        var okayMinRange = 25;
        var okayMaxRange = 35;
  
        // Apply color based on the value
        if (hti < greatRange) {
          document.getElementById("HOUSINGTOINCOME").style.color = "green";
        } else if (hti >= okayMinRange && hti <= okayMaxRange) {
          document.getElementById("HOUSINGTOINCOME").style.color = "yellow";
        } else {
          document.getElementById("HOUSINGTOINCOME").style.color = "red";
        }
      }
  
      // Assuming HOUSINGTOINCOME is the ID of the element displaying HTI ratio
      document.getElementById("HOUSINGTOINCOME").textContent =
        HOUSINGTOINCOME.toFixed(3);
      colorChangeHTI();
  
      SAVINGSTODEBT =
        parseFloat(getCookie("LIQUIDASSETS")) /
        parseFloat(getCookie("LIABILITIES"));
  
      function colorChangeSavingsToDebt() {
        // Get the savings-to-debt ratio value
        var savingsToDebtText =
          document.getElementById("SAVINGSTODEBT").textContent;
        var savingsToDebt = parseFloat(savingsToDebtText);
  
        // Define the ranges
        var greatRange = 2; // Example threshold for "great" savings-to-debt ratio
        var goodMinRange = 1; // Example lower threshold for "good" savings-to-debt ratio
        var goodMaxRange = 2; // Example upper threshold for "good" savings-to-debt ratio
  
        // Apply color based on the value
        if (savingsToDebt >= greatRange) {
          document.getElementById("SAVINGSTODEBT").style.color = "green";
        } else if (
          savingsToDebt >= goodMinRange &&
          savingsToDebt <= goodMaxRange
        ) {
          document.getElementById("SAVINGSTODEBT").style.color = "yellow";
        } else {
          document.getElementById("SAVINGSTODEBT").style.color = "red";
        }
      }
  
      // Assuming "SAVINGSTODEBT" is the ID of the element displaying the savings-to-debt ratio
      document.getElementById("SAVINGSTODEBT").textContent =
        SAVINGSTODEBT.toFixed(3);
      colorChangeSavingsToDebt();
  
      FIRERATIO =
        parseFloat(getCookie("PASSIVEINCOME")) /
        parseFloat(getCookie("ANNUALEXPENSESUM")); // Descriptive variable name
  
      function colorChangeFIRE() {
        // Get the FIRE ratio value
        var FIREText = document.getElementById("FIRERATIO").textContent;
        var FIRE = parseFloat(FIREText);
  
        // Define the ranges for FIRE ratio
        var greatRange = 0.25; // Example threshold for "great" FIRE ratio
        var okayMinRange = 0.1; // Example lower threshold for "okay" FIRE ratio
        var okayMaxRange = 0.25; // Example upper threshold for "okay" FIRE ratio
  
        // Apply color based on the value
        if (FIRE >= greatRange) {
          document.getElementById("FIRERATIO").style.color = "green";
        } else if (FIRE >= okayMinRange && FIRE <= okayMaxRange) {
          document.getElementById("FIRERATIO").style.color = "yellow";
        } else {
          document.getElementById("FIRERATIO").style.color = "red";
        }
      }
  
      // Assuming FIRERATIO is the ID of the element displaying the FIRE ratio
      document.getElementById("FIRERATIO").textContent = FIRERATIO.toFixed(3);
      colorChangeFIRE();
    }
  
    updateOnChange();
  
    // Add an event listener to the frequency dropdown
    const frequencyDropdown = document.getElementById("frequency");
    frequencyDropdown.addEventListener("change", function () {
      // Call the update function when the frequency dropdown value changes
      updateOnChange();
    });
  });
  
  document.addEventListener("change", function () {
    var usaDiv = document.querySelector(".usa");
    var canDiv = document.querySelector(".can");
  
    var regionDropdownValue = getCookie("RegionDropdown");
  
    if (regionDropdownValue === "USA") {
      usaDiv.style.display = "block";
      canDiv.style.display = "hidden";
    } else if (regionDropdownValue === "CAN") {
      usaDiv.style.display = "hidden";
      canDiv.style.display = "block";
    }
    document.getElementById("ASSETS").textContent = " $" + getCookie1("ASSETS");
    document.getElementById("LIABILITIES").textContent =
      " $" + getCookie1("LIABILITIES");
  });

}

function runLimitedCalculations() {
      const netWorthElement = document.getElementById("NETWORTH");
      const assetsElement = document.getElementById("ASSETS");
      const liabilitiesElement = document.getElementById("LIABILITIES");
  
      if (netWorthElement && assetsElement && liabilitiesElement) {
          // Fetch values for my assets and liabilities from cookies
          const assets = parseFloat(getCookie("ASSETS")) ;
          const liabilities = parseFloat(getCookie("LIABILITIES")) ;
  
// calculate networth
          const netWorth = assets - liabilities;
  
          
          assetsElement.textContent = `$${assets.toFixed(2)}`;
          liabilitiesElement.textContent = `$${liabilities.toFixed(2)}`;
          netWorthElement.textContent = `$${netWorth.toFixed(2)}`;
      }

}




document.addEventListener('DOMContentLoaded', () => {

  const paid = getCookie('authenticated')
  const container = document.querySelector('.summary-content')
  
  
  if (paid == 'paid') {
     container.innerHTML = fullCals
     runFullCalculations()

  } else {
    container.innerHTML = limitedCals
    runLimitedCalculations()
    


    const payForm = document.querySelector("#payment-form");

payForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const payButton = document.querySelector("#pay-button");
  const nameInput = document.querySelector("#username");
  const emailInput = document.querySelector("#useremail");
  let payStatus = document.querySelector("#status");
    payStatus.innerHTML = "Please wait ......";
    const name = document.querySelector("#username").value;
    const email = document.querySelector("#useremail").value;
    
  if (!name || !email) {
    payStatus.innerHTML = "Name and email are required.";
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
    try {
      const res = await fetch(lambda, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: 'pay',
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "T-shirt",
                },
                unit_amount: price,
              },
              quantity: 1,
            },
          ],
          name: name,
          email:email
        }),
      });

      const data = await res.json();

      if (data.id) {
        payStatus.innerHTML = 'payment proccessing, reload page after payment'
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        nameInput.disabled = false;
        emailInput.disabled = false;
        payButton.disabled = false;
        console.log("session data not returned: kindly retry", data);

        if (data.error) {
            payStatus.innerHTML = data.error
        } else {

            payStatus.innerHTML = "session create failed, try again letter";
        }
      }
    } catch (error) {
      console.error(error.message);
      payStatus.innerHTML = "An unexpected error occurred. Please check your connection or try again later.";

      nameInput.disabled = false;
      emailInput.disabled = false;
      payButton.disabled = false;
    }
  }

  attemptPay();
});

    

    

  }

});








const fullCals = `
    <summary>
    <h2>Disposable Income<span id="ANNUALDISPOSABLEINCOME"></span></h2>
    <i>Income left after expenses, taxes & other obligations. Use: Debt repayment, savings, investments & discretionary spending.</i>
</summary>

<details style="margin-top:10px;">
    <p style="margin-left:20px;"><span id="RegionDropdown"></span>
        <span id="SubregionDropdown"></span></p>
    <i style="margin-left:20px;">Residence for tax and obligatory purposes</i>

    <p style="margin-left:20px;"><u>Income:</u> <span id="annual_income_sum"></span></p>
    <i style="margin-left:20px;">Total yearly earnings from all sources. Use: Budgeting, financial planning, loan applications.</i>

    <p style="margin-left:20px;"><u>Expense:</u> <span id="annual_expense_sum"></span></p>
    <i style="margin-left:20px;">Total yearly expenditures. Use: Identify spending patterns, budget adjustments.</i>

    <p style="margin-left:20px;"><u>Total Tax Payable:</u><span id="tax_sum"></span></p>
    <i style="margin-left:20px;">Sum of all taxes owed. Use: Financial planning, avoid underpayment penalties.</i>
    
    <details>
        <p style="margin-left:60px;"><u>Taxable Income:</u> <span id="taxable_sum"></span></p>
        <i style="margin-left:60px;">Gross income subject to taxes. Use: Tax planning, understand tax liabilities.</i>

        <p style="margin-left:60px;"><u>Regional Tax Payable:</u> <span id="region_tax_sum"></span></p>
        <i style="margin-left:60px;">Tax owed to the regional government. Use: Budget for tax obligations, financial planning.</i>

        <p style="margin-left:60px;"><u>Subregional Tax Payable:</u><span id="subregion_tax_sum"></span></p> 
        <i style="margin-left:60px;">Tax owed to subregion government. Use: Budgeting for tax obligations, financial planning.</i>
        
        <div class="usa">
            <p style="margin-left:60px;"><u>Capital Gains Tax:</u> <span id="TOTALTAXCG"></span></p>
            <i style="margin-left:60px;">Capital gains tax is a levy imposed on the profit realized from the sale of an asset, such as stocks, bonds, or real estate, at a higher price than its original purchase price. The tax rate typically depends on factors like the holding period and the individual's income bracket. Use: Capital gains tax generates revenue for governments from the profits made on asset sales.</i>
        </div>
    </details>
    
    <p style="margin-left:20px;"><u>Other Obligations:</u><span id="ANNUALGOVERNMENTOBLIGATIONS"></span></p>

    <details style="margin-top:10px;">
        <!-- CAN -->
        <div class="can">
            <p style="margin-left:60px;"><u>Self Employed CPP Payable:</u> <span id="annual_cpp_seresult"></span></p>
            <i style="margin-left:60px;">Canada Pension Plan contributions for self-employed individuals. Use: Retirement planning for self-employed.</i>

            <p style="margin-left:60px;"><u>Employed CPP Payable:</u> <span id="annual_cpp_eresult"></span></p>
            <i style="margin-left:60px;">Specific CPP contributions for employed individuals. Use: Retirement savings adjustment.</i>

            <p style="margin-left:60px;"><u>Total CPP Payable:</u> <span id="cpp_sum"></span></p>
            <i style="margin-left:60px;">General contributions to Canada Pension Plan. Use: Retirement planning. NOTE: your employer may have already deducted a portion of this total off your pay and remits it to the government on your behalf.</i>

            <p style="margin-left:60px;"><u>Total Employment Insurance Payable:</u> <span id="ANNUALEI"></span></p>
            <i style="margin-left:60px;">Contributions towards Employment Insurance. Use: Ensure coverage for job loss.</i>
        </div>

        <!-- USA -->
        <div class="usa">
            <p style="margin-left:60px;"><u>Social Security Total US:</u> <span id="TOTALSOCIALSECURITY"></span></p>
            <i style="margin-left:60px;">Social Security taxes are deductions from paychecks that fund benefits for retirees, disabled individuals, and survivors. Use: Social Security taxes are utilized to provide financial assistance to retirees, disabled persons, and survivors of deceased workers, ensuring financial security during various life stages.</i>

            <p style="margin-left:60px;"><u>Social Security Employed US:</u> <span id="TOTALSOCIALSECURITYE"></span></p>
            <i style="margin-left:60px;">Social Security taxes are deductions from paychecks that fund benefits for retirees, disabled individuals, and survivors. Use: Social Security taxes are utilized to provide financial assistance to retirees, disabled persons, and survivors of deceased workers, ensuring financial security during various life stages.</i>

            <p style="margin-left:60px;"><u>Social Security Self Employed US:</u> <span id="TOTALSOCIALSECURITYSE"></span></p>
            <i style="margin-left:60px;">Social Security taxes are deductions from paychecks that fund benefits for retirees, disabled individuals, and survivors. Use: Social Security taxes are utilized to provide financial assistance to retirees, disabled persons, and survivors of deceased workers, ensuring financial security during various life stages.</i>

            <p style="margin-left:60px;"><u>Medicare:</u> <span id="TOTALMEDICARE"></span></p>
            <i style="margin-left:60px;">Medicare taxes are payroll taxes that fund the Medicare program in the United States. Use: Medicare taxes fund the Medicare program, covering hospital stays, skilled nursing care, and other medical services for eligible individuals.</i>
        </div>
    </details>
</details>

    
<summary>
    <h2>Net Worth <span id="NETWORTH"></span></h2>
    <i>Assets minus liabilities. Use: Overall financial position, wealth tracking over time.</i>
</summary>

<details style="margin-top:10px;">
    <p style="margin-left:40px;"><u>Assets:</u><span id="ASSETS"></span></p>
    <i style="margin-left:40px;">Resources with economic value owned. Use: Wealth assessment, collateral for loans.</i>
   
    <p style="margin-left:40px;"><u>Liabilities:</u><span id="LIABILITIES"></span></p>
    <i style="margin-left:40px;">Financial debts or obligations. Use: Debt management, financial strategy formulation.</i>
</details>

<summary>
    <h2>Ratios</h2>
</summary>

<i>    Ratios serve to provide a quantitative comparison between two relevant financial metrics. They offer insights into various aspects of financial health, such as debt management, savings efficiency, affordability, and progress towards financial goals.</i>



<details style = "margin-top:10px;">
    <p><u>Debt to Income:</u> <span id="DEBTTOINCOME"></span></p>
    <i>Total debt as a percentage of income. Use: Evaluate borrowing capacity, financial health.</i>

    <p><u>Savings to Debt:</u> <span id="SAVINGSTODEBT"></span></p>
    <i>Savings as a percentage of debt. Use: Assess financial security, emergency fund sufficiency.</i>

    <p><u>Housing to Income:</u> <span id="HOUSINGTOINCOME"></span></p>
    <i>Housing costs as a percentage of income. Use: Assess housing affordability, financial stress.</i>

    <p><u>FIRE:</u> <span id="FIRERATIO"></span></p>
    <i>Financial Independence, Retire Early ratio; expenses covered by passive income. Use: Gauge progress towards financial independence, retirement planning.</i>


</details>
     
   <h2>Financial Projections</h2>
   
   <p><u>Revolving Debt - Time to Pay:</u> <span id="TIMETOPAYDEBT"></span></p>
<p>Revolving debt, such as student loans, lines of credit, credit cards, and tax arrears, allows for lump sum payments but usually incurs higher interest rates. This calculation estimates the time it will take to pay off the debt using disposable income if no savings are available.</p>

           <div style="padding: 20px;text-align:center;">

           </div>`

const limitedCals = `
<summary>
        <h2>Net Worth <span id="NETWORTH"></span></h2>
        <i>Assets minus liabilities. Use: Overall financial position, wealth tracking over time.</i>
    </summary>
    
    <details style="margin-top:10px;">
        <p style="margin-left:40px;"><u>Assets:</u><span id="ASSETS"></span></p>
        <i style="margin-left:40px;">Resources with economic value owned. Use: Wealth assessment, collateral for loans.</i>
       
        <p style="margin-left:40px;"><u>Liabilities:</u><span id="LIABILITIES"></span></p>
        <i style="margin-left:40px;">Financial debts or obligations. Use: Debt management, financial strategy formulation.</i>
    </details>
    
    <h2 style="text-transform: capitalize;">Master Your Money Skills </h2>
    <i> Unlock Premium Educational Content for Comprehensive Financial Insights!</i>
    <details style="margin-top: 10px;">
        <summary style="cursor: pointer;">Understanding Disposable Income:</summary>
        Grasp the concept of disposable income and its role as the money you have left after taxes to spend or save.
Exploring Total Income: Learn how to calculate and interpret your total income from all sources, which is crucial for budgeting and financial planning.
Analyzing Expenses: Discover what expenses are and how they affect your financial health, helping you understand spending patterns.
    </details>

    <details style="margin-top: 10px;">
        <summary style="cursor: pointer;">Tax Payable Explained: </summary>
        Get insights into what portion of your income goes towards various taxes and how this impacts your net earnings.
    </details>

    <details style="margin-top: 10px; margin-bottom: 20px;">
        <summary style="cursor: pointer;">Other Obligations Payable:</summary>
        Delve into what constitutes 'other obligations' and how they influence your cash flow.
    </details>

    <i style="margin-top: 10px;">Educational Ratios:</i>
    
    <details style="margin-top: 10px;">
        <summary style="cursor: pointer;">Debt-to-Income Insights:</summary>
         Learn how much of your income is suggested for servicing debt to maintain financial stability.
    </details>
    <details style="margin-top: 10px;">
        <summary style="cursor: pointer;">Savings vs. Debt Examination:</summary>
         Understand the educational benchmarks for a healthy savings-to-debt ratio.
    </details>
    <details style="margin-top: 10px;">
        <summary style="cursor: pointer;">Housing-to-Income Ratio:</summary>
         Educate yourself on the ideal percentage of income that should go towards housing costs.
    </details>
    <details style="margin-top: 10px;">
        <summary style="cursor: pointer;">FIRE (Financial Independence, Retire Early) Concepts:</summary>
         Get an introduction to the FIRE movement and the savings strategies it entails.
    </details>
    <details style="margin-top: 10px;">
        <summary style="cursor: pointer;">Debt Management Education:</summary>
         Explore the theoretical timeline for paying off revolving debts, offering a learning opportunity on debt reduction strategies.
    </details>
    <!-- <details style="margin-top: 10px;">
        <summary></summary>
    </details> -->

    <form class="payment-form" id="payment-form" style="margin-top: 30px;">
     <input type="text" class="payment-input" id="username" placeholder="input name" required >
     <input type="email" class="payment-input" id="useremail" placeholder="input email" required >
     <div id="status"></div>
     <button    class="pay-button" id="pay-button">subscribe</button>
    
    </form>
    <a href="mailto:support@inexasli.com" class=" contact-support" style="color:black;">i have paid</a>
`



// payment scripts

const lambda =
"https://cup7hlgbjk.execute-api.us-east-1.amazonaws.com/production/create-checkout-session";
const publicKey =
"pk_test_51POOigILSdrwu9bgkDsm3tpdvSgP8PaV0VA4u9fSFMILqQDG0Bv8GxxFfNuTAv7knKX3x6685X3lYvxCs2iGEd9x00cSBedhxi";


function getCookie(name) {
    const cookieArray = document.cookie.split(';');
    for (let cookie of cookieArray) {
      cookie = cookie.trim(); // Remove extra spaces
      if (cookie.startsWith(`${name}=`)) {
        return cookie.substring(name.length + 1);
      }
    }
    return null; // Return null if my cookie doesn't exist
  }

  







// payment-form
// payment-input
// pay-button


// tasks 
// checkPayment
// pay

// const d = {
//   body: {
//     task: 'checkpayment',
//     sessionId: 'cs_test_b1rSdkOphnEXtE91Qs2nEagBOwwwmt39TcCQYNsLjpiyivpATvRtqhe6OK'
//   }
// }
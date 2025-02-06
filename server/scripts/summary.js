// Add an event listener to the frequency dropdown
const frequencyDropdown = document.getElementById('frequency');
frequencyDropdown.addEventListener('change', function () {
    // Call the update function when the frequency dropdown value changes
    updateOnChange();
    timeToPay();
});


const tabs = document.querySelectorAll('.tab')

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location')
    const location = document.location.pathname


    if (location.includes(dataL)) {
        tab.removeAttribute('href')

        tab.classList.add('active')
    }
})

const paid = getCookie("authenticated");


if (paid == "paid") {

    document.body.style.display = 'initial'
} else {
    window.location.href = "./summary.html";
}


// net worth doesnt want the cookies to be effected by freuncy feild
function getCookie1(name) {
    const value1 = `; ${document.cookie}`;
    const parts1 = value1.split(`; ${name}=`);
    let cookieValue1 = parts1.length === 2 ? decodeURIComponent(parts1.pop().split(';').shift()) : '';

    return cookieValue1 === '' ? '0' : cookieValue1;
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    let cookieValue = parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : '';

    // Get the selected frequency from the dropdown
    const frequencyDropdown = document.getElementById('frequency');
    const selectedFrequency = frequencyDropdown.value;

    // Convert the annual amount based on the selected frequency, if applicable
    if (selectedFrequency !== 'annually' && !isNaN(cookieValue)) {
        if (selectedFrequency === 'monthly') {
            cookieValue /= 12;
        } else if (selectedFrequency === 'weekly') {
            cookieValue /= 52;
        }
    }

    return cookieValue === '' ? '0' : cookieValue;
}


document.addEventListener('DOMContentLoaded', function () {
    // Function to retrieve cookie value by name


    function updateOnChange() {    // Update HTML elements with cookie values
        document.getElementById('RegionDropdown').textContent = "Region: " + getCookie('RegionDropdown');
        document.getElementById('SubregionDropdown').textContent = "Subregion: " + getCookie('SubregionDropdown');

        document.getElementById('taxable_sum').textContent = " $" + parseFloat(getCookie('ANNUALTAXABLEINCOME')).toFixed(2);
        document.getElementById('region_tax_sum').textContent = " $" + parseFloat(getCookie('ANNUALREGIONALTAX')).toFixed(2);
        document.getElementById('subregion_tax_sum').textContent = " $" + parseFloat(getCookie('ANNUALSUBREGIONALTAX')).toFixed(2);
        document.getElementById('tax_sum').textContent = " $" + parseFloat((getCookie('ANNUALTAX'))).toFixed(2);

        document.getElementById('annual_income_sum').textContent = " $" + parseFloat(getCookie('ANNUALINCOME')).toFixed(2);
        document.getElementById('annual_expense_sum').textContent = " $" + parseFloat(getCookie('ANNUALEXPENSESUM')).toFixed(2);
        document.getElementById('cpp_sum').textContent = " $" + parseFloat(getCookie('ANNUALCPP')).toFixed(2);
        document.getElementById('ANNUALEI').textContent = " $" + parseFloat(getCookie('ANNUALEI')).toFixed(2);

        document.getElementById('HOUSING').textContent = " $" + parseFloat(getCookie('HOUSING')).toFixed(2);
        document.getElementById('TRANSPORTATION').textContent = " $" + parseFloat(getCookie('TRANSPORTATION')).toFixed(2);
        document.getElementById('DEPENDANT').textContent = " $" + parseFloat(getCookie('DEPENDANT')).toFixed(2);
        document.getElementById('DEBT').textContent = " $" + parseFloat(getCookie('DEBT')).toFixed(2);
        document.getElementById('DISCRETIONARY').textContent = " $" + parseFloat(getCookie('DISCRETIONARY')).toFixed(2);
        document.getElementById('ESSENTIAL').textContent = " $" + parseFloat(getCookie('ESSENTIAL')).toFixed(2);

        document.getElementById('annual_cpp_seresult').textContent = " $" + parseFloat(getCookie('CPPPAYABLESELFEMPLOYED')).toFixed(2);
        document.getElementById('annual_cpp_eresult').textContent = " $" + parseFloat(getCookie('CPPPAYABLEEMPLOYED')).toFixed(2);

        document.getElementById('TOTALMEDICARE').textContent = " $" + parseFloat(getCookie('TOTALMEDICARE')).toFixed(2);
        document.getElementById('TOTALSOCIALSECURITY').textContent = " $" + parseFloat(getCookie('TOTALSOCIALSECURITY')).toFixed(2);
        document.getElementById('TOTALSOCIALSECURITYE').textContent = " $" + parseFloat(getCookie('TOTALSOCIALSECURITYE')).toFixed(2);
        document.getElementById('TOTALSOCIALSECURITYSE').textContent = " $" + parseFloat(getCookie('TOTALSOCIALSECURITYSE')).toFixed(2);

        document.getElementById('TOTALTAXCG').textContent = " $" + parseFloat(getCookie('TOTALTAXCG')).toFixed(2);

        document.getElementById('ASSETS').textContent = " $" + parseFloat(getCookie1('ASSETS')).toFixed(2);
        document.getElementById('LIABILITIES').textContent = " $" + parseFloat(getCookie1('LIABILITIES')).toFixed(2);

        document.getElementById('debtcheckbox').textContent = getCookie('debtcheckbox');
        document.getElementById('dependantcheckbox').textContent = getCookie('dependantcheckbox');
        document.getElementById('romanticasset').textContent = getCookie('romanticasset');
        document.getElementById('romanticexpense').textContent = getCookie('romanticexpense');
        document.getElementById('romanticincome').textContent = getCookie('romanticincome');
        document.getElementById('romanticliability').textContent = getCookie('romanticliability');

let DISPOSABLEINCOME;

        if (getCookie('RegionDropdown') === 'USA') {
            DISPOSABLEINCOME = parseFloat(getCookie('ANNUALINCOME')) -
                parseFloat(getCookie('ANNUALEXPENSESUM')) -
                parseFloat(getCookie('TOTALMEDICARE')) -
                parseFloat(getCookie('TOTALSOCIALSECURITY')) -
                parseFloat(getCookie('TOTALTAXCG')) -
                parseFloat(getCookie('ANNUALTAX'));
        } else if (getCookie('RegionDropdown') === 'CAN') {
            DISPOSABLEINCOME = parseFloat(getCookie('ANNUALINCOME')) -
                parseFloat(getCookie('ANNUALEXPENSESUM')) -
                parseFloat(getCookie('ANNUALEI')) -
                parseFloat(getCookie('ANNUALCPP')) -
                parseFloat(getCookie('ANNUALTAX'));
        } else {
            DISPOSABLEINCOME = 0
        }

        // Update HTML element with the calculated value
        document.getElementById('DISPOSABLEINCOME').textContent = ' $' + DISPOSABLEINCOME.toFixed(2);

       
        let ANNUALGOVERNMENTOBLIGATIONS;

        if (getCookie('RegionDropdown') === 'USA') {
            ANNUALGOVERNMENTOBLIGATIONS = parseFloat(getCookie('TOTALSOCIALSECURITY')) +
                parseFloat(getCookie('TOTALMEDICARE'));
        } else if (getCookie('RegionDropdown') === 'CAN') {
            ANNUALGOVERNMENTOBLIGATIONS = parseFloat(getCookie('ANNUALCPP')) +
                parseFloat(getCookie('ANNUALEI'));
        } else {
            ANNUALGOVERNMENTOBLIGATIONS = 0
        }

        // Update HTML element with the calculated value
        document.getElementById('ANNUALGOVERNMENTOBLIGATIONS').textContent = ' $' + ANNUALGOVERNMENTOBLIGATIONS.toFixed(2);

        NETWORTH = parseFloat(getCookie1('ASSETS')) - parseFloat(getCookie1('LIABILITIES'));
        document.getElementById('NETWORTH').textContent = ' $' + NETWORTH.toFixed(2);


        DEBTTOINCOME = parseFloat(getCookie('LIABILITIES')) / parseFloat(getCookie('ANNUALINCOME'));

        function colorChangeDTI() {
            // Get the debt-to-income ratio value
            var debtToIncome = parseFloat(document.getElementById("DEBTTOINCOME").textContent);

            // Define the ranges based on your description
            var greatRange = 0.20; // Below 0.20 is great
            var okayMinRange = 0.20; // Okay starts at 0.20
            var okayMaxRange = 0.36; // Okay goes up to 0.36

            // Apply color based on the value
            if (debtToIncome < greatRange) {
                document.getElementById("DEBTTOINCOME").style.color = "green";
            } else if (debtToIncome >= okayMinRange && debtToIncome <= okayMaxRange) {
                document.getElementById("DEBTTOINCOME").style.color = "orange";
            } else {
                document.getElementById("DEBTTOINCOME").style.color = "red";
            }
        }
        if (isNaN(DEBTTOINCOME) || !isFinite(DEBTTOINCOME)) {
            document.getElementById('DEBTTOINCOME').textContent = ' Not Applicable'
        } else {

            document.getElementById('DEBTTOINCOME').textContent = DEBTTOINCOME.toFixed(3);
            colorChangeDTI(); // After setting the text content, call the function to update the color
        }


        HOUSINGTOINCOME = parseFloat(getCookie('HOUSING')) / parseFloat(getCookie('ANNUALINCOME')); // Use a descriptive variable name

        function colorChangeHTI() {
            // Get the housing-to-income ratio value
            var htiText = document.getElementById("HOUSINGTOINCOME").textContent;
            var hti = parseFloat(htiText);

            // Define the ranges
            var greatRange = .25;
            var okayMinRange = .25;
            var okayMaxRange = .35;

            // Apply color based on the value
            if (hti < greatRange) {
                document.getElementById("HOUSINGTOINCOME").style.color = "green";
            } else if (hti >= okayMinRange && hti <= okayMaxRange) {
                document.getElementById("HOUSINGTOINCOME").style.color = "orange";
            } else {
                document.getElementById("HOUSINGTOINCOME").style.color = "red";
            }
        }


        if (isNaN(HOUSINGTOINCOME)) {
            document.getElementById('HOUSINGTOINCOME').textContent = ' Not Applicable';

        } else {

            // Assuming HOUSINGTOINCOME is the ID of the element displaying HTI ratio
            document.getElementById('HOUSINGTOINCOME').textContent = HOUSINGTOINCOME.toFixed(3);
            colorChangeHTI();
        }

        SAVINGSTODEBT = parseFloat(getCookie('LIQUIDASSETS')) / parseFloat(getCookie('LIABILITIES'));

        function colorChangeSavingsToDebt() {
            // Get the savings-to-debt ratio value
            var savingsToDebtText = document.getElementById("SAVINGSTODEBT").textContent;
            var savingsToDebt = parseFloat(savingsToDebtText);

            // Define the ranges
            var greatRange = 2; // Example threshold for "great" savings-to-debt ratio
            var goodMinRange = 1; // Example lower threshold for "good" savings-to-debt ratio
            var goodMaxRange = 2; // Example upper threshold for "good" savings-to-debt ratio

            // Apply color based on the value
            if (savingsToDebt >= greatRange) {
                document.getElementById("SAVINGSTODEBT").style.color = "green";
            } else if (savingsToDebt >= goodMinRange && savingsToDebt <= goodMaxRange) {
                document.getElementById("SAVINGSTODEBT").style.color = "orange";
            } else {
                document.getElementById("SAVINGSTODEBT").style.color = "red";
            }
        }


        if (isNaN(SAVINGSTODEBT)) {

            document.getElementById('SAVINGSTODEBT').textContent = 'Not Applicable';
        } else {

            // Assuming "SAVINGSTODEBT" is the ID of the element displaying the savings-to-debt ratio
            document.getElementById('SAVINGSTODEBT').textContent = SAVINGSTODEBT.toFixed(3);
            colorChangeSavingsToDebt();
        }




        FIRERATIO = parseFloat(getCookie('PASSIVEINCOME')) / parseFloat(getCookie('ANNUALEXPENSESUM')); // Descriptive variable name

        function colorChangeFIRE() {
            // Get the FIRE ratio value
            var FIREText = document.getElementById("FIRERATIO").textContent;
            var FIRE = parseFloat(FIREText);

            // Define the ranges for FIRE ratio
            var greatRange = .25; // Example threshold for "great" FIRE ratio
            var okayMinRange = .10; // Example lower threshold for "okay" FIRE ratio
            var okayMaxRange = .25; // Example upper threshold for "okay" FIRE ratio

            // Apply color based on the value
            if (FIRE >= greatRange) {
                document.getElementById("FIRERATIO").style.color = "green";
            } else if (FIRE >= okayMinRange && FIRE <= okayMaxRange) {
                document.getElementById("FIRERATIO").style.color = "orange";
            } else {
                document.getElementById("FIRERATIO").style.color = "red";
            }
        }

        if (isNaN(FIRERATIO)) {

            document.getElementById('FIRERATIO').textContent = 'Not Applicable';
        } else {

            // Assuming FIRERATIO is the ID of the element displaying the FIRE ratio
            document.getElementById('FIRERATIO').textContent = FIRERATIO.toFixed(3);
            colorChangeFIRE();
        }



        document.getElementById('goalAmount').addEventListener('input', calculateGoal);

        document.getElementById('frequency').addEventListener('change', function () {
            calculateGoal(); // Recalculate the goal time when the frequency changes
       
        });

        function calculateGoal() {
            const disposableIncomeElement = document.getElementById('DISPOSABLEINCOME');
            let DISPOSABLEINCOME = parseFloat(disposableIncomeElement.textContent.replace('$', '').trim());

            if (isNaN(DISPOSABLEINCOME) || DISPOSABLEINCOME <= 0) {
                console.error("DISPOSABLEINCOME is not a valid number or is not positive.");
                return;
            }

            const goalAmount = document.getElementById('goalAmount').value;
            const parsedGoalAmount = parseFloat(goalAmount);

            if (!isNaN(parsedGoalAmount) && parsedGoalAmount > 0) {
                const frequencyDropdown = document.getElementById('frequency');
                const selectedFrequency = frequencyDropdown.value;
                let timeNeeded, timeUnit;

                // Convert annual disposable income to the selected frequency for calculation
                switch (selectedFrequency) {
                    case 'annual':
                        timeNeeded = parsedGoalAmount / DISPOSABLEINCOME;
                        timeUnit = "Years";
                        break;
                    case 'monthly':
                        // Monthly disposable income is annual income divided by 12
                        timeNeeded = parsedGoalAmount / (DISPOSABLEINCOME / 12);
                        timeUnit = "Months";
                        break;
                    case 'weekly':
                        // Weekly disposable income is annual income divided by 52
                        timeNeeded = parsedGoalAmount / (DISPOSABLEINCOME / 52);
                        timeUnit = "Weeks";
                        break;
                    default:
                        timeNeeded = 0;
                        timeUnit = "Unknown";
                }

                const resultElement = document.getElementById('goalResult');
                if (resultElement) {
                    resultElement.textContent = `${timeUnit} needed: ${timeNeeded.toFixed(2)}`;
                }
            } else {
                document.getElementById('goalResult').textContent = '';
            }
        }



    }

    updateOnChange();

    

    document.getElementById('ASSETS').textContent = " $" + getCookie1('ASSETS');
    document.getElementById('LIABILITIES').textContent = " $" + getCookie1('LIABILITIES');

});


// Function to get the value from a span by its ID
function getValueById(id) {
    return parseFloat(document.getElementById(id).textContent);
}

//  Start Pie
document.addEventListener('DOMContentLoaded', function () {
    const cookieNames = ['ESSENTIAL', 'DEBT', 'DEPENDANT', 'DISCRETIONARY', 'HOUSING', 'TRANSPORTATION'];

    // Get data from cookies
    const data = cookieNames.map(name => {
        const value = parseFloat(getCookie(name).replace('$', '').trim());
        return isNaN(value) ? 0 : value; // Return 0 if not a number to avoid NaN in chart data
    });

    // Configuration for the pie chart
    const config = {
        type: 'pie',
        data: {
            labels: cookieNames, // Use the cookie names as labels
            datasets: [{
                label: 'Expense Distribution',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(201, 203, 207, 0.2)',
                    'rgba(100, 100, 100, 0.2)'
                ],
                borderColor: [
                    'rgb(194, 194, 194)',
                    'rgb(165, 165, 165)',
                    'rgb(118, 118, 118)',
                    'rgb(101, 101, 101)',
                    'rgb(76, 76, 76)',
                    'rgb(63, 63, 63)',
                    'rgb(36, 36, 36)',
                    'rgb(3, 3, 3)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Expense Distribution'
                }
            }
        }
    };

    // Create the pie chart
    const myPieChart = new Chart(
        document.getElementById('myPieChart'),
        config
    );
});

// End pie



function timeToPay(){
    const frequencyDropdown = document.getElementById('frequency');
    const timeToPayDebtElement = document.getElementById('TIMETOPAYDEBT'); // Assuming this is where you show debt payment time

    function updateFrequencyText() {
        let frequencyText = '';
        switch (frequencyDropdown.value) {
            case 'annual':
                frequencyText = 'Years';
                break;
            case 'monthly':
                frequencyText = 'Months';
                break;
            case 'weekly':
                frequencyText = 'Weeks';
                break;
            default:
                frequencyText = 'Unknown';
        }
        
        // Update the text directly in the TIMETOPAYDEBT element
        if (timeToPayDebtElement) {
            let revolvingDebtValue = getCookie1('LIABILITIESNA');
            if (revolvingDebtValue && revolvingDebtValue !== '0' && !isNaN(parseFloat(revolvingDebtValue))) {
                let TIMETOPAYDEBT = parseFloat(revolvingDebtValue) / DISPOSABLEINCOME;
                if (DISPOSABLEINCOME <= 0) {
                    timeToPayDebtElement.textContent = "RISK OF INSOLVENCY";
                } else {
                    // Here you can decide if you want to convert TIMETOPAYDEBT based on frequency
                    // For now, let's just display the text without conversion
                    timeToPayDebtElement.textContent = TIMETOPAYDEBT.toFixed(2) + ' ' + frequencyText;
                }
            } else {
                timeToPayDebtElement.textContent = "Not Applicable";
            }
        }
    }

    // Attach the change event listener to the dropdown
    frequencyDropdown.addEventListener('change', updateFrequencyText);

    // Initial call to set up the state
    updateFrequencyText();
     }
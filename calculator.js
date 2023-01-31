const ApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${ApiUrl}${action}`)
        .then(response => response.json())
}

function fetchPoolProfit() {
    return statsApiCall('/profit');
}

function fetchRate() {
    return statsApiCall(`/rate`)
}

function getPoolProfitUSD(rate, profit) {
    return profit * rate
}

function perHour(value) {
    return (value / 24);
}

function costsPerTime(powerConsumption, electricityCosts, multiplier = 1) {
    return powerConsumption * multiplier / 1000 * electricityCosts;
}

function perWeek(value) {
    return (value * 7);
}

function addCell(td) {
    return td.insertCell();
 }

function addValue(tr, value, currencyValue = '', sign = '') {
    tr.innerHTML = `${sign}` + ` ${parseFloat(value).toFixed(4)}` + ` ${currencyValue}`
}

function addRow(tbody, period, reward, income, costs, profit, currencyValue) {
    let td = tbody.insertRow();
    let trPeriod = td.insertCell();
    trPeriod.innerHTML = period;
    addValue(addCell(td), reward, 'ALPH');
    addValue(addCell(td), income, currencyValue);
    addValue(addCell(td), costs, currencyValue, '-');
    addValue(addCell(td), profit, currencyValue);
}

function generateTable(calculatorForm) {
    const hashrateValue = calculatorForm.hashrate.value;
    const powerConsumptionValue = calculatorForm.power_consumption.value;
    const currencyValue = "USD";
    const electricityCostsValue = calculatorForm.electricity_costs.value;

    let tbody = document.getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";

    Promise.all([fetchRate(), fetchPoolProfit()]).then(function([object1, object2]) {
        let reward = object2.profit * hashrateValue;
        let income = getPoolProfitUSD(object1.rate, reward);

        addRow(
            tbody,
            '1 hour',
            perHour(reward),
            perHour(income),
            costsPerTime(powerConsumptionValue, electricityCostsValue),
            perHour(income) - costsPerTime(powerConsumptionValue, electricityCostsValue),
            currencyValue)

        addRow(
            tbody,
            '24 hours',
            reward,
            income,
            costsPerTime(powerConsumptionValue, electricityCostsValue, 24),
            income - costsPerTime(powerConsumptionValue, electricityCostsValue, 24),
            currencyValue)

        addRow(
            tbody,
            '7 days',
            perWeek(reward),
            perWeek(income),
            costsPerTime(powerConsumptionValue, electricityCostsValue, 168),
            perWeek(income) - costsPerTime(powerConsumptionValue, electricityCostsValue, 168),
            currencyValue)
    })
}

const calculatorForm = document.forms.calculator_form;

calculatorForm.addEventListener("submit", function (event) {
    event.preventDefault();
    generateTable(calculatorForm);
});

function init(calculatorForm) {
    generateTable(calculatorForm);
    document.getElementById("calculator_button").disabled = false;
}

init(calculatorForm);
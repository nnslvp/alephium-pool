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
    return profitUSD = profit * rate
}

function perHour(value) {
    return (value / 24)
}

function costsPerTime(power_consumption, electricity_costs, multiplier = 1) {
    return power_consumption * multiplier / 1000 * electricity_costs;
}

function perWeek(value) {
    return (value * 7)
}

function addValue(td, value, currency_value = '', sign = '') {
    let tr = td.insertCell();
    tr.innerHTML = `${sign}` + ` ${parseFloat(value).toFixed(4)}` + ` ${currency_value}`
}

function addRow(tbody, period, reward, income, costs, profit, currency_value) {
    let td = tbody.insertRow();
    let tr_period = td.insertCell();
    tr_period.innerHTML = period;
    addValue(td, reward, 'ALPH');
    addValue(td, income, currency_value);
    addValue(td, costs, currency_value, '-');
    addValue(td, profit, currency_value);
}

function generateTable(calculator_form) {
    const hashrate_value = calculator_form.hashrate.value;
    const power_consumption_value = calculator_form.power_consumption.value;
    const currency_value = "USD";
    const electricity_costs_value = calculator_form.electricity_costs.value;

    let tbody = document.getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";

    Promise.all([fetchRate(), fetchPoolProfit()]).then(function([object1, object2]) {
        let reward = object2.profit * hashrate_value;
        let income = getPoolProfitUSD(object1.rate, reward)

        addRow(
            tbody,
            '1 hour',
            perHour(reward),
            perHour(income),
            costsPerTime(power_consumption_value, electricity_costs_value),
            perHour(income) - costsPerTime(power_consumption_value, electricity_costs_value),
            currency_value)

        addRow(
            tbody,
            '24 hours',
            reward,
            income,
            costsPerTime(power_consumption_value, electricity_costs_value, 24),
            income - costsPerTime(power_consumption_value, electricity_costs_value, 24),
            currency_value)

        addRow(
            tbody,
            '7 days',
            perWeek(reward),
            perWeek(income),
            costsPerTime(power_consumption_value, electricity_costs_value, 168),
            perWeek(income) - costsPerTime(power_consumption_value, electricity_costs_value, 168),
            currency_value)
    })
}

const calculator_form = document.forms.calculator_form;

calculator_form.addEventListener("submit", function (event) {
    event.preventDefault();
    generateTable(calculator_form);
});

function init(calculator_form) {
    generateTable(calculator_form);
}

init(calculator_form);
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

function generateHTML(elements_id, periods) {
    let tbody = document.getElementsByTagName('tbody')[0];
    for (let i = 0; i < 3; i++) {
        let td = tbody.insertRow();
        for (let i = 0; i < 4; i++) {
            if (i === 0) {
                let tr = td.insertCell();
                let text = document.createTextNode(periods.shift());
                tr.appendChild(text);
            }
            let tr = td.insertCell();
            tr.setAttribute('id', elements_id.shift());
        }
    }
}

function addValue(value, element_id, currency_value = null) {
    const costs = ['1h_costs', '24h_costs', '7d_costs']
    if (costs.includes(element_id)) {
        document.getElementById(element_id).textContent = `- ${parseFloat(value).toFixed(4)}` + ` ${currency_value}`
    } else {
        document.getElementById(element_id).textContent = `${parseFloat(value).toFixed(4)}` + ` ${currency_value}`
    }
}

function addRow(reward, income, costs, profit, currency_value, element_reward_id, element_income_id, element_costs_id, element_profit_id) {
    addValue(reward, element_reward_id, 'ALPH');
    addValue(income, element_income_id, currency_value);
    addValue(costs, element_costs_id, currency_value);
    addValue(profit, element_profit_id, currency_value);
}

generateHTML(
    [
        '1h_reward',
        '1h_income',
        '1h_costs',
        '1h_profit',
        '24h_reward',
        '24h_income',
        '24h_costs',
        '24h_profit',
        '7d_reward',
        '7d_income',
        '7d_costs',
        '7d_profit'
    ],
    [
        '1 hour',
        '24 hours',
        '7 days'
    ]
)

function generateTable(calculator_form) {
    const hashrate_value = calculator_form.hashrate.value;
    const power_consumption_value = calculator_form.power_consumption.value;
    const currency_value = "USD";
    const electricity_costs_value = calculator_form.electricity_costs.value;

    Promise.all([fetchRate(), fetchPoolProfit()]).then(function([object1, object2]) {
        let reward = object2.profit * hashrate_value;
        let income = getPoolProfitUSD(object1.rate, reward)

        addRow(
            perHour(reward),
            perHour(income),
            costsPerTime(power_consumption_value, electricity_costs_value),
            perHour(income) - costsPerTime(power_consumption_value, electricity_costs_value),
            currency_value,
            '1h_reward',
            '1h_income',
            '1h_costs',
            '1h_profit')

        addRow(
            reward,
            income,
            costsPerTime(power_consumption_value, electricity_costs_value, 24),
            income - costsPerTime(power_consumption_value, electricity_costs_value, 24),
            currency_value,
            '24h_reward',
            '24h_income',
            '24h_costs',
            '24h_profit')

        addRow(
            perWeek(reward),
            perWeek(income),
            costsPerTime(power_consumption_value, electricity_costs_value, 168),
            perWeek(income) - costsPerTime(power_consumption_value, electricity_costs_value, 168),
            currency_value,
            '7d_reward',
            '7d_income',
            '7d_costs',
            '7d_profit')
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
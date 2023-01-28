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
    const floatProfit = parseFloat(profit);
    const floatRate = parseFloat(rate);
    return profitUSD = (floatProfit * floatRate).toFixed(4);
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

function addValue(value, element_id, currency_value = null){
    const costs = ['1h_costs', '24h_costs', '7d_costs']
    if (costs.includes(element_id)) {
        document.getElementById(element_id).textContent = `- ${parseFloat(value).toFixed(4)}` + ` ${currency_value}`
    }else {
        document.getElementById(element_id).textContent = `${parseFloat(value).toFixed(4)}` + ` ${currency_value}`    
    }
}

function addRow(reward, income, costs, profit, currency_value, element_reward_id, element_income_id, element_costs_id, element_profit_id) {
    addValue(reward, element_reward_id, 'ALPH');
    addValue(income, element_income_id, currency_value);
    addValue(costs, element_costs_id, currency_value);
    addValue(profit, element_profit_id, currency_value);
}

function generateTable(calculator_form) {
    const hashrate_value = calculator_form.hashrate.value;
    const power_consumption_value = calculator_form.power_consumption.value;
    const currency_value = "USD";
    const electricity_costs_value = calculator_form.electricity_costs.value;

    fetchPoolProfit().then(({profit}) => {
        fetchRate().then(
            ({rate}) => {
                reward = profit * hashrate_value;
                let income = getPoolProfitUSD(rate, reward)

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
                 costsPerTime(power_consumption_value,electricity_costs_value, 24),
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
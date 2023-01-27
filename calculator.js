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

function costsPerTime(value, multiplier = 1) {
    return value * multiplier / 1000;
}

function perWeek(value) {
    return (value * 7)
}

function addValue(value, element_id, currency_value = null){
    const costs = ['last_1h_costs', 'last_24h_costs', 'last_7d_costs']
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

const calculator_form = document.forms.calculator_form;

calculator_form.addEventListener("submit", function (event) {
    event.preventDefault();

    const hashrate_value = calculator_form.hashrate.value;
    const power_consumption_value = calculator_form.power_consumption.value;
    const currency_value = calculator_form.currency.value;

    fetchPoolProfit().then(({profit}) => {
        fetchRate().then(
            ({rate}) => {
                reward = profit * hashrate_value;
                let income = getPoolProfitUSD(rate, reward)

                addRow(
                 perHour(reward),
                 perHour(income),
                 costsPerTime(power_consumption_value),
                 perHour(income) - costsPerTime(power_consumption_value),
                 currency_value,
                 'last_1h_reward',
                 'last_1h_income',
                 'last_1h_costs', 
                 'last_1h_profit')

                addRow(
                 reward,
                 income, 
                 costsPerTime(power_consumption_value, 24),
                 income - costsPerTime(power_consumption_value, 24),
                 currency_value, 
                 'last_24h_reward', 
                 'last_24h_income', 
                 'last_24h_costs', 
                 'last_24h_profit')

                addRow(
                 perWeek(reward), 
                 perWeek(income), 
                 costsPerTime(power_consumption_value, 168),
                 perWeek(income) - costsPerTime(power_consumption_value, 168),
                 currency_value, 
                 'last_7d_reward', 
                 'last_7d_income', 
                 'last_7d_costs', 
                 'last_7d_profit')
            })
    })
});

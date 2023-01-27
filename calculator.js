const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
      .then(response => response.json())
}

function fetchPoolProfit() {
    return statsApiCall('/profit');
}

function fetchRate() {
    return statsApiCall(`/rate`)
}

function showPoolProfitUSD(rate, profit) {
    const floatProfit = parseFloat(profit);
    const floatRate = parseFloat(rate);
    const profitUSD = (floatProfit * floatRate).toFixed(4);

    document.getElementById('last_1h_profit').textContent = `${profitUSD}`
}

calculator_form.addEventListener("submit", function (event) {
    event.preventDefault();
    const calculator_form = document.forms.calculator_form;
    const hashrate_value = calculator_form.hashrate.value;
    const power_consumption_value = calculator_form.power_consumption.value;
    const pool_fee_value = calculator_form.pool_fee.value;
    const currency_value = calculator_form.currency.value;
    
});

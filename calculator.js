const ApiUrl = 'https://api.coinmore.io';

function statsApiCall(action) {
  return fetch(`${ApiUrl}${action}`).then((response) => response.json());
}

function fetchPoolProfit() {
  return statsApiCall('/profit?coin=alephium');
}

function fetchRate() {
  return statsApiCall(`/rate?coin=alephium`);
}

function getPoolProfitUSD(rate, profit) {
  return profit * rate;
}

function perHour(value) {
  return value / 24;
}

function costsPerTime(powerConsumption, electricityCosts, multiplier = 1) {
  return ((powerConsumption * multiplier) / 1000) * electricityCosts;
}

function perWeek(value) {
  return value * 7;
}

function addCell(td) {
  return td.insertCell();
}

function addValue(tr, value, currencyValue = '', sign = '') {
  tr.innerHTML =
    `${sign}` + ` ${parseFloat(value).toFixed(4)}` + ` ${currencyValue}`;
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
  let button = document.getElementById('calculator_button');
  button.disabled = true;
  button.classList.add('disabled');
  const hashrateValue = calculatorForm.hashrate.value;
  const powerConsumptionValue = calculatorForm.power_consumption.value;
  const currencyValue = 'USD';
  const electricityCostsValue = calculatorForm.electricity_costs.value;

  Promise.all([fetchRate(), fetchPoolProfit()]).then(function ([
    { rate },
    { profit },
  ]) {
    let tbody = document.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    let reward = profit * hashrateValue;
    let income = getPoolProfitUSD(rate.value, reward);

    addRow(
      tbody,
      '1 hour',
      perHour(reward),
      perHour(income),
      costsPerTime(powerConsumptionValue, electricityCostsValue),
      perHour(income) -
        costsPerTime(powerConsumptionValue, electricityCostsValue),
      currencyValue,
    );

    addRow(
      tbody,
      '24 hours',
      reward,
      income,
      costsPerTime(powerConsumptionValue, electricityCostsValue, 24),
      income - costsPerTime(powerConsumptionValue, electricityCostsValue, 24),
      currencyValue,
    );

    addRow(
      tbody,
      '7 days',
      perWeek(reward),
      perWeek(income),
      costsPerTime(powerConsumptionValue, electricityCostsValue, 168),
      perWeek(income) -
        costsPerTime(powerConsumptionValue, electricityCostsValue, 168),
      currencyValue,
    );
  });
  button.disabled = false;
  button.classList.remove('disabled');
}

const calculatorForm = document.forms.calculator_form;

calculatorForm.addEventListener('submit', function (event) {
  event.preventDefault();
  generateTable(calculatorForm);
});

function init(calculatorForm) {
  generateTable(calculatorForm);
}

init(calculatorForm);

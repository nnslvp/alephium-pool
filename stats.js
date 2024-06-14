const statsApiUrl = 'https://api.coinmore.io';
const MODAL = document.querySelector('.modal');
const OPEN_MODAL_BTNS = document.querySelectorAll('.open-modal-button');
const CLOSE_MODAL_BTN = document.querySelector('.close-modal-btn');
const FORM_MIN_PAYOUTS = MODAL.querySelector('#form-min-payouts');
const FORM_SUBMIT_BTN = MODAL.querySelector('.submit-btn');
const INPUT_MIN_PAYOUTS = FORM_MIN_PAYOUTS.querySelector('#input-min-payouts');
const STAT_MIN_PAYOUTS_VALUE = document.querySelector(
  '#stat-min-payouts-value'
);

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
        .then(response => response.json())
}

function fetchMyHashrate(wallet) {
    return Promise.all(
        [
            statsApiCall(`/workers?coin=alephium&wallet=${wallet}&period=3600`),
            statsApiCall(`/workers?coin=alephium&wallet=${wallet}&period=86400`),
        ]
    )
}

function fetchCurrencyInfo() {
    return statsApiCall(`/rate?coin=alephium`)
}

function fetchMyPayouts(wallet) {
    return Promise.all(
        [
            statsApiCall(`/payouts?coin=alephium&wallet=${wallet}&period=3600`),
            statsApiCall(`/payouts?coin=alephium&wallet=${wallet}&period=86400`),
        ]
    )
}

function statsApiPost(action) {
  return fetch(`${statsApiUrl}${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createUserValue(wallet, kind = 'min_payout', value = 0.1) {
  return statsApiPost(
    `/user_value?coin=alephium&wallet=${wallet}&kind=${kind}&value=${value}`
  );
}

function fetchUserValue(wallet, kind = 'min_payout') {
  return statsApiCall(
    `/user_value?coin=alephium&wallet=${wallet}&kind=${kind}`
  );
}

function fetchPoolValue(kind = 'min_payout') {
  return statsApiCall(`/pool_value?coin=alephium&kind=${kind}`);
}

function fetchMyBalance(wallet) {
    return statsApiCall(`/balance?coin=alephium&wallet=${wallet}`)
}

function fetchMyEvents(wallet) {
    return statsApiCall(`/events?coin=alephium&wallet=${wallet}`)
}

function shortenHm(hashRate, roundPlaces) {
    const denominator = [
        {d: 1000000000000, unit: 'TH'},
        {d: 1000000000, unit: 'GH'},
        {d: 1000000, unit: 'MH'},
        {d: 1, unit: 'H'}
    ]

    if (isNaN(hashRate)) {
        return null;
    } else {
        const hashRateFactor = Math.log10(hashRate) > 0 ? Math.log10(hashRate) : 0

        const factor = denominator.find(el => hashRateFactor - Math.log10(el.d) >= 0)

        const resultHashRateValue = Number((hashRate / factor.d).toFixed(roundPlaces))
        const resultHashRateMeasure = factor.unit

        return {
            hashrate: resultHashRateValue,
            units: resultHashRateMeasure
        }
    }
}

function showMyHashrate({day, hour}) {
    const shortHourHashRate = shortenHm(hour.hashrate, 2)
    const shortDayHashRate = shortenHm(day.hashrate, 2)

    document.getElementById('my_hashrate_1h').textContent = shortHourHashRate.hashrate
    document.getElementById('my_hashrate_1h_measure').textContent = shortHourHashRate.units

    document.getElementById('my_hashrate_24h').textContent = shortDayHashRate.hashrate
    document.getElementById('my_hashrate_24h_measure').textContent = shortDayHashRate.units
}

function showWorkersTable(workersDay, workersHour) {
    const tableBody = document.getElementById('workers-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    workersDay.forEach((workerDay) => {
        const workerHour = workersHour.find((w) => w.worker === workerDay.worker) || {};

        const row = tableBody.insertRow();
        const shortHashRateHour = workerHour.hashrate ? shortenHm(workerHour.hashrate, 2) : { hashrate: 'N/A', units: '' };
        const shortHashRateDay = workerDay.hashrate ? shortenHm(workerDay.hashrate, 2) : { hashrate: 'N/A', units: '' };

        row.insertCell(0).textContent = workerDay.worker || 'N/A';
        row.insertCell(1).textContent = `${shortHashRateHour.hashrate} ${shortHashRateHour.units} / ${shortHashRateDay.hashrate} ${shortHashRateDay.units}`;
        row.insertCell(2).textContent = `${workerHour.shares_count} / ${workerDay.shares_count}`;
        row.insertCell(3).textContent = workerDay.last_share_at ? new Date(workerDay.last_share_at).toLocaleString() : 'N/A';
    });
}


function amountUSD(amountInAlph, currencyRate) {
    return (parseFloat(amountInAlph) * currencyRate).toFixed(2)
}

function showMyPayouts({day, hour}, currencyRate) {
    document.getElementById('my_payouts_1h').textContent = parseFloat(hour.amount).toFixed(8)
    document.getElementById('my_payouts_1h_usd').textContent = amountUSD(hour.amount, currencyRate)

    document.getElementById('my_payouts_24h').textContent = parseFloat(day.amount).toFixed(8)
    document.getElementById('my_payouts_24h_usd').textContent = amountUSD(day.amount, currencyRate)
}


function showMyBalance(myBalanceData, currencyRate) {
    document.getElementById('balance').textContent = parseFloat(myBalanceData.amount).toFixed(8)
    document.getElementById('balance_usd').textContent = amountUSD(myBalanceData.amount, currencyRate)
}

function showPayoutsTable(payouts) {
    const tableBody = document.getElementById('payouts-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    payouts.forEach(payout => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = parseFloat(payout.amount).toFixed(8);
        row.insertCell(1).textContent = new Date(payout.timestamp).toLocaleString();
    });
}

function showEventsTable(events) {
    const tableBody = document.getElementById('events-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    events.forEach((event) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = event.worker ?? 'N/A';
        row.insertCell(1).textContent = event.message;
        row.insertCell(2).textContent = event.count;
        row.insertCell(3).textContent = new Date(event.latest).toLocaleString();
    });
}

function drawData(wallet) {
    disableButton();
    Promise.all(
        [
            fetchMyHashrate(wallet),
            fetchMyPayouts(wallet),
            fetchMyBalance(wallet),
            fetchMyEvents(wallet),
            fetchCurrencyInfo()
        ]
    ).then((
        [
            [hashrate1hResponse, hashrate24hResponse],
            [payouts1hResponse, payouts24hResponse],
            myBalanceResponse, myEventsResponse, currencyRate,
        ]
    ) => {
        const hashrate1h = hashrate1hResponse.workers.reduce((accumulator, v) => {
            return accumulator + parseFloat(v.hashrate)
        }, 0);

        const hashrate24h = hashrate24hResponse.workers.reduce((accumulator, v) => {
            return accumulator + parseFloat(v.hashrate)
        }, 0);

        const payouts1h = payouts1hResponse.payouts.reduce((accumulator, v) => {
            return accumulator + parseFloat(v.amount)
        }, 0);

        const payouts24h = payouts24hResponse.payouts.reduce((accumulator, v) => {
            return accumulator + parseFloat(v.amount)
        }, 0);

        showMyHashrate({
            hour: {hashrate: hashrate1h, units: hashrate1hResponse.units},
            day: {hashrate: hashrate24h, units: hashrate1hResponse.units}
        });
        showWorkersTable(hashrate1hResponse.workers, hashrate24hResponse.workers);
        showMyPayouts({hour: {amount: payouts1h}, day: {amount: payouts24h}}, currencyRate.rate.value);
        showPayoutsTable(payouts24hResponse.payouts)
        showMyBalance(myBalanceResponse, currencyRate.rate.value);
        showEventsTable(myEventsResponse.events);
        assignFormListenerMinPayoutsForm(wallet);
        return wallet;
      }
    )
    .then((wallet) => {
      fetchUserValue(wallet)
        .then(({ value }) => showMinPayouts(value))
        .catch((error) => {
          if (error.status === 404) {
            fetchPoolValue().then((defaultValue) => {
              showMinPayouts(defaultValue.value);
            });
          } else {
            console.info('Error:', error);
          }
        })
        .finally(() => {
          showStats();
          enableButton();
        });
    });
}

function showStats() {
    var element = document.getElementById("stats");
    element.classList.remove("hidden");
}

function disableButton() {
    const button = document.getElementById('show')
    button.textContent = 'Loading..'
    button.disabled = true
}

function enableButton() {
    const button = document.getElementById('show')
    button.textContent = 'Update'
    button.disabled = false
}

function setWalletParam(wallet) {
    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('wallet', wallet);

    window.location.search = urlParams;
}

function getWalletParam() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('wallet')?.trim();
}

function setWalletForm(wallet) {
    const walletInput = document.getElementById('wallet-input');
    walletInput.value = wallet;
}

function assignFormListener() {
    function processForm(e) {
        if (e.preventDefault) e.preventDefault();
        const walletInput = document.getElementById('wallet-input');
        if (walletInput.value)
            setWalletParam(walletInput.value)
        return false;
    }

    const form = document.getElementById('wallet-form');
    if (form.attachEvent) {
        form.attachEvent("submit", processForm);
    } else {
        form.addEventListener("submit", processForm);
    }

    document.getElementById('workers-tab').addEventListener('click', (e) => switchTab(e, 'workers'));
    document.getElementById('payouts-tab').addEventListener('click', (e) => switchTab(e, 'payouts'));
    document.getElementById('events-tab').addEventListener('click', (e) => switchTab(e, 'events'));
}


function switchTab(event, tabId) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active')
    })

    document.querySelectorAll('.tab-links .button').forEach(tab => {
        tab.classList.remove('button-outline')
        tab.classList.add('button-clear')
    })

    document.getElementById(tabId).classList.add('active')
    event.currentTarget.classList.add('button-outline')
    event.currentTarget.classList.remove('button-clear')
}

function init() {
    assignFormListener();

    const walletFromParams = getWalletParam();

    if (walletFromParams) {
        Cookies.set('wallet', walletFromParams, {expires: 365})
        setWalletForm(walletFromParams);
        drawData(walletFromParams);
    } else {
        const walletFromCookies = Cookies.get('wallet')
        if (walletFromCookies) {
            setWalletParam(walletFromCookies)
        }
    }
}

init();

function showMinPayouts(minPayoutsValue) {
  STAT_MIN_PAYOUTS_VALUE.textContent = minPayoutsValue;
  INPUT_MIN_PAYOUTS.value = minPayoutsValue;
}

OPEN_MODAL_BTNS.forEach((btn) => {
  btn.addEventListener('click', () => {
    MODAL.showModal();
  });
});

CLOSE_MODAL_BTN.addEventListener('click', () => {
  MODAL.close();
});

MODAL.addEventListener('click', (e) => {
  const dialogDimensions = MODAL.getBoundingClientRect();
  if (
    e.clientX < dialogDimensions.left ||
    e.clientX > dialogDimensions.right ||
    e.clientY < dialogDimensions.top ||
    e.clientY > dialogDimensions.bottom
  ) {
    MODAL.close();
  }
});


INPUT_MIN_PAYOUTS.addEventListener('blur', (event) => {
  validateInput(event.target);
});


function validateInput(input) {
  const errorMessageElement = document.getElementById('error-message');
  const inputValue = input.value.trim();
  if (!isValidNumber(inputValue)) {
    input.setCustomValidity(' ');
    errorMessageElement.textContent = 'Please enter a valid number.';
    FORM_SUBMIT_BTN.disabled = true;
  } else {
    input.setCustomValidity('');
    FORM_SUBMIT_BTN.disabled = false;
  }
}

function isValidNumber(value) {
  const regex = /^\d+(\.\d+)?$/;
  return regex.test(value);
}

function assignFormListenerMinPayoutsForm(wallet) {
  FORM_MIN_PAYOUTS.addEventListener('submit', (e) => {
    console.log(e.target.checkValidity());
    if (e.target.reportValidity()) {
      e.preventDefault();
      const newValue = Number(INPUT_MIN_PAYOUTS.value);
      createUserValue(wallet, 'min_payout', newValue)
        .then(() => {
          showMinPayouts(newValue);
          MODAL.close();
        })
        .catch((error) => {
          console.info('Error submitting form:', error);
        });
    }
  });
}

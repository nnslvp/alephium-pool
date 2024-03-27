const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
        .then(response => response.json())
}

function fetchMyHashrate(wallet) {
    return Promise.all(
        [
            statsApiCall(`/workers?wallet=${wallet}&period=3600`),
            statsApiCall(`/workers?wallet=${wallet}&period=86400`),
        ]
    )
}

function fetchCurrencyInfo() {
    return statsApiCall(`/rate`)
}

function fetchMyPayouts(wallet) {
    return Promise.all(
        [
            statsApiCall(`/payouts?wallet=${wallet}&period=3600`),
            statsApiCall(`/payouts?wallet=${wallet}&period=86400`),
        ]
    )
}

function fetchMyBalance(wallet) {
    return statsApiCall(`/balance?wallet=${wallet}`)
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

function showWorkersTable(workersHour, workersDay) {
    const tableBody = document.getElementById('workers-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';


    workersHour.forEach(workerHour => {
        const workerDay = workersDay.find(w => w.worker === workerHour.worker) || {};

        const row = tableBody.insertRow();
        const shortHashRateHour = workerHour.hashrate ? shortenHm(workerHour.hashrate, 2) : {hashrate: 'N/A', units: ''};
        const shortHashRateDay = workerDay.hashrate ? shortenHm(workerDay.hashrate, 2) : {hashrate: 'N/A', units: ''};

        row.insertCell(0).textContent = workerHour.worker || 'N/A';
        row.insertCell(1).textContent = `${shortHashRateHour.hashrate} ${shortHashRateHour.units} / ${shortHashRateDay.hashrate} ${shortHashRateDay.units}`;
        row.insertCell(2).textContent = `${workerHour.shares_count} / ${workerDay.shares_count}`;
        row.insertCell(4).textContent = workerHour.last_share_at ? new Date(workerHour.last_share_at).toLocaleString() : 'N/A';
    });
}

function amountUSD(amountInAlph, currencyRate) {
    return (parseFloat(amountInAlph) * currencyRate).toFixed(2)
}

function showMyPayouts({day, hour}, currencyRate) {
    document.getElementById('my_payouts_1h').textContent = parseFloat(hour.amount).toFixed(8)
    document.getElementById('my_payouts_1h_usd').textContent = amountUSD(hour.amount, currencyRate.rate)

    document.getElementById('my_payouts_24h').textContent = parseFloat(day.amount).toFixed(8)
    document.getElementById('my_payouts_24h_usd').textContent = amountUSD(day.amount, currencyRate.rate)
}


function showMyBalance(myBalanceData, currencyRate) {
    document.getElementById('balance').textContent = parseFloat(myBalanceData.ready_to_pay).toFixed(8)
    document.getElementById('balance_usd').textContent = amountUSD(myBalanceData.ready_to_pay, currencyRate.rate)
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

function drawData(wallet) {
    disableButton();
    Promise.all(
        [
            fetchMyHashrate(wallet),
            fetchMyPayouts(wallet),
            fetchMyBalance(wallet),
            fetchCurrencyInfo()
        ]
    ).then((
        [
            [hashrate1hResponse, hashrate24hResponse],
            [payouts1hResponse, payouts24hResponse],
            myBalanceResponse, currencyRate
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
        showMyPayouts({hour: {amount: payouts1h}, day: {amount: payouts24h}}, currencyRate);
        showPayoutsTable(payouts24hResponse.payouts)
        showMyBalance(myBalanceResponse, currencyRate);
        showStats();
        enableButton();
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
    return urlParams.get('wallet').trim();
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

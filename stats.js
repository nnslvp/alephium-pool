const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
      .then(response => response.json())
}

function fetchMyHashrate(wallet) {
    return Promise.all(
      [
          statsApiCall(`/hashrate?worker=${wallet}&period=3600`),
          statsApiCall(`/hashrate?worker=${wallet}&period=86400`),
      ]
    )
}

function fetchMyPayouts(wallet) {
    return Promise.all(
      [
          statsApiCall(`/payouts?worker=${wallet}&period=3600`),
          statsApiCall(`/payouts?worker=${wallet}&period=86400`),
      ]
    )
}

function fetchMyBalance(wallet) {
    return statsApiCall(`/balance?worker=${wallet}`)
}

function showMyHashrate({ day, hour }) {
    const toHm = (h) => (parseFloat(h) / 1000000).toFixed(2)

    document.getElementById('my_hashrate_1h').textContent = toHm(hour.hashrate)
    document.getElementById('my_hashrate_24h').textContent = toHm(day.hashrate)
}

function showMyPayouts({ day, hour }) {
    document.getElementById('my_payouts_1h').textContent = parseFloat(hour.amount).toFixed(8)
    document.getElementById('my_payouts_24h').textContent = parseFloat(day.amount).toFixed(8)
}

function showMyBalance(myBalanceData) {
    document.getElementById('balance').textContent = parseFloat(myBalanceData.ready_to_pay).toFixed(8)
}


function drawData(wallet) {
    disableButton();
    Promise.all(
      [
          fetchMyHashrate(wallet),
          fetchMyPayouts(wallet),
          fetchMyBalance(wallet)
      ]
    ).then((
      [
          [hashrate1hResponse, hashrate24hResponse],
          [payouts1hResponse, payouts24hResponse],
          myBalanceResponse
      ]
    ) => {
        showMyHashrate({ hour: hashrate1hResponse, day: hashrate24hResponse });
        showMyPayouts({ hour: payouts1hResponse.payouts, day: payouts24hResponse.payouts });
        showMyBalance(myBalanceResponse);
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
    return urlParams.get('wallet');
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
}

function init() {
    assignFormListener();

    const walletFromParams = getWalletParam();

    if (walletFromParams) {
        Cookies.set('wallet', walletFromParams, { expires: 365 })
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

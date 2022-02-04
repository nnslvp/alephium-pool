const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
      .then(response => response.json())
}

function fetchMyHashrate(wallet) {
    return statsApiCall(`/my_hashrate?worker=${wallet}`)
}

function fetchMyPayouts(wallet) {
    return statsApiCall(`/payouts_info?worker=${wallet}`)
}

function fetchMyBalance(wallet) {
    return statsApiCall(`/balance?worker=${wallet}`)
}

function showMyHashrate(myHashrateData) {
    document.getElementById('my_hashrate_1h').textContent = myHashrateData.my_hashrate_1h
    document.getElementById('my_hashrate_24h').textContent = myHashrateData.my_hashrate_24h
}

function showMyPayouts(myPayoutsData) {
    document.getElementById('my_payouts_1h').textContent = parseFloat(myPayoutsData['1h'].amount).toFixed(8)
    document.getElementById('my_payouts_24h').textContent = parseFloat(myPayoutsData['24h'].amount).toFixed(8)
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
          myHashrateData,
          myPayoutsData,
          myBalanceData
      ]
    ) => {
        showMyHashrate(myHashrateData);
        showMyPayouts(myPayoutsData);
        showMyBalance(myBalanceData);
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

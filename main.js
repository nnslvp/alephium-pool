const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
      .then(response => response.json())
}

function fetchPoolHashrate() {
    return statsApiCall(`/hashrate?period=3600`);
}

function fetchPoolProfit() {
    return statsApiCall('/profit');
}

function showPoolHashrate(hashrate) {
    const toHm = (h) => (parseFloat(h) / 1000000).toFixed(2)
    document.getElementById('pool_hashrate').textContent = `${toHm(hashrate)} MH/s`
}

function showPoolProfit(profit) {
    const roundProfit = parseFloat(profit).toFixed(4)
    document.getElementById('pool_profit').textContent = `${roundProfit} coins per GH`
}

function init() {
    Promise.all(
      [
          fetchPoolHashrate(),
          fetchPoolProfit()
      ]
    ).then((
      [
          { hashrate },
          { profit },
      ]
    ) => {
        showPoolHashrate(hashrate)
        showPoolProfit(profit)
    });
}

init();

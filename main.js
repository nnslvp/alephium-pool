const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
      .then(response => response.json())
}

function fetchPoolHashrate() {
    return statsApiCall('/pool_hashrate');
}

function fetchPoolProfit() {
    return statsApiCall('/profit');
}

function showPoolHashrate(hashrate) {
    document.getElementById('pool_hashrate').textContent = `${hashrate} MH/s`
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
          poolHashrateData,
          poolProfitData,
      ]
    ) => {
        showPoolHashrate(poolHashrateData.pool_hashrate_1h)
        showPoolProfit(poolProfitData.average_pool_profit)
    });
}

init();

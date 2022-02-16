const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
      .then(response => response.json())
}

function fetchCurrencyInfo() {
    return statsApiCall(`/rate`)
}

function fetchPoolHashrate() {
    return statsApiCall(`/hashrate?period=3600`);
}

function fetchPoolProfit() {
    return statsApiCall('/profit');
}

function fetchPoolSummary() {
    return statsApiCall('/summary');
}

function showPoolHashrate(hashrate) {
    const toHm = (h) => (parseFloat(h) / 1000000).toFixed(2)
    document.getElementById('pool_hashrate').textContent = `${toHm(hashrate)} MH/s`
}

function showPoolProfit(profit) {
    const roundProfit = parseFloat(profit).toFixed(4)
    document.getElementById('pool_profit').textContent = `${roundProfit}`
}

function showPoolProfitUSD(rate, profit) {
    const floatProfit = parseFloat(profit);
    const floatRate = parseFloat(rate);
    const profitUSD = (floatProfit * floatRate).toFixed(4);

    document.getElementById('pool_profit_usd').textContent = `${profitUSD}`
}

function showPool24hBlocks(blocksCount) {
    document.getElementById('24h_blocks').textContent = blocksCount
}

function showPoolLatestBlockAt(date) {
    const current = new Date()
    const at = new Date(date)
    const hours = (Math.abs(current - at) / 36e5).toFixed(2);

    document.getElementById('latest_block_at').textContent = `${hours} hour(s)`
}

function init() {
    Promise.all(
      [
          fetchPoolHashrate(),
          fetchPoolProfit(),
          fetchPoolSummary()
      ]
    ).then((
      [
          { hashrate },
          { profit },
          summary,
      ]
    ) => {
        showPoolHashrate(hashrate);
        showPoolProfit(profit);
        showPool24hBlocks(summary.blocks_24h);
        showPoolLatestBlockAt(summary.last_block_at);

        fetchCurrencyInfo().then(
          ({ rate }) => showPoolProfitUSD(profit, rate)
        )
    });
}

init();

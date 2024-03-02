const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
  return fetch(`${statsApiUrl}${action}`).then((response) => response.json());
}

function fetchCurrencyInfo() {
  return statsApiCall(`/rate`);
}

function fetchPoolProfit() {
  return statsApiCall('/profit');
}

function fetchPoolSummary() {
  return statsApiCall('/summary');
}

function shortenHm(hashRate, roundPlaces) {
  const denominator = [
    { d: 1000000000000, unit: 'TH' },
    { d: 1000000000, unit: 'GH' },
    { d: 1000000, unit: 'MH' },
    { d: 1, unit: 'H' },
  ];

  if (isNaN(hashRate)) {
    return null;
  } else {
    const hashRateFactor = Math.log10(hashRate) > 0 ? Math.log10(hashRate) : 0;

    const factor = denominator.find(
      (el) => hashRateFactor - Math.log10(el.d) >= 0
    );

    const resultHashRateValue = Number(
      (hashRate / factor.d).toFixed(roundPlaces)
    );
    const resultHashRateMeasure = factor.unit;

    return {
      hashrate: resultHashRateValue,
      units: resultHashRateMeasure,
    };
  }
}

function showPoolHashrate(hashrate) {
  const shortPoolHashRate = shortenHm(hashrate, 2);
  document.getElementById(
    'pool_hashrate'
  ).textContent = `${shortPoolHashRate.hashrate} ${shortPoolHashRate.units}/s`;
}

function showPoolProfit(profit) {
  const roundProfit = parseFloat(profit).toFixed(4);
  document.getElementById('pool_profit').textContent = `${roundProfit}`;
}

function showPoolProfitUSD(rate, profit) {
  const floatProfit = parseFloat(profit);
  const floatRate = parseFloat(rate);
  const profitUSD = (floatProfit * floatRate).toFixed(4);

  document.getElementById('pool_profit_usd').textContent = `${profitUSD}`;
}

function showPool24hBlocks(blocksCount) {
  document.getElementById('24h_blocks').textContent = blocksCount;
}

function showPoolLatestBlockAt(date) {
  const current = new Date();
  const at = new Date(date);
  const hours = (Math.abs(current - at) / 36e5).toFixed(2);

  document.getElementById('latest_block_at').textContent = `${hours} hour(s)`;
}

function init() {
  fetchPoolProfit().then(({ profit }) => {
    showPoolProfit(profit);
    fetchCurrencyInfo().then(({ rate }) => showPoolProfitUSD(profit, rate));
  });
  fetchPoolSummary().then((summary) => {
    showPoolHashrate(summary.pool_hashrate_1h, summary.hashrate_units);
    showPool24hBlocks(summary.blocks_24h);
    showPoolLatestBlockAt(summary.last_block_at);
  });
  showPings();
}

function testServer(server) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${server.host}:${server.port}`);
    const startTime = new Date().getTime();

    ws.onopen = () => {
      const endTime = new Date().getTime();
      const timeTaken = endTime - startTime;
      ws.close();
      resolve(timeTaken);
    };

    ws.onerror = () => {
      reject(new Error('Connection error'));
    };
  });
}

function showPings() {
  const servers = [
    { name: 'Europe', host: 'eu1.alephium-pool.com', port: 3030 },
    { name: 'Russia', host: 'ru1.alephium-pool.com', port: 3030 },
    { name: 'US', host: 'us1.alephium-pool.com', port: 3030 },
    { name: 'Asia', host: 'asia1.alephium-pool.com', port: 3030 },
  ];

  servers
    .reduce((chain, server, i) => {
      return chain
        .then(() => testServer(server))
        .then((timeTaken) => {
          servers[i].ping = timeTaken;
          updatePing(server.name, timeTaken);
        })
        .then(() => new Promise((resolve) => setTimeout(resolve, 500)));
    }, Promise.resolve())
    .then(() => {
      renderAndStyleServerFaster(servers);
    });
}

function updatePing(serverName, pingValue) {
  if (!serverName || !pingValue) {
    return;
  }
  const pingCell = document.getElementById(`ping-${serverName}`);

  if (pingCell) {
    pingCell.textContent = `${pingValue} ms`;
    pingCell.classList.add('fade-in-animation');
  }
}

function renderAndStyleServerFaster(servers) {
  const fasterServer = servers.reduce((prev, curr) =>
    prev.ping < curr.ping ? prev : curr
  );
  const pingCell = document.getElementById(`ping-${fasterServer.name}`);
  if (pingCell) {
    pingCell.classList.add('faster');
  }
}

init();

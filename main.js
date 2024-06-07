const statsApiUrl = 'https://api.coinmore.io';

function statsApiCall(action) {
  return fetch(`${statsApiUrl}${action}`).then((response) => response.json());
}

function fetchCurrencyInfo() {
  return statsApiCall(`/rate?coin=alephium`);
}

function fetchPoolProfit() {
  return statsApiCall('/profit?coin=alephium');
}

function fetchPoolHashRate() {
  return statsApiCall('/hashrate?coin=alephium');
}

function fetchPoolBlocks(period = 3600) {
  return statsApiCall(`/blocks?coin=alephium&period=${period}`);
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
    fetchCurrencyInfo().then(({ rate: { value } }) =>
      showPoolProfitUSD(profit, value)
    );
  });

  fetchPoolHashRate().then(({ hashrate }) => {
    showPoolHashrate(hashrate.hashrate);
  });

  fetchPoolBlocks(86400).then(({ last_block_at, count }) => {
    showPoolLatestBlockAt(last_block_at);
    showPool24hBlocks(count);
  });

  showPings();
}

function testServer(server) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://${server.host}:${server.port}`);
    let startTime = new Date().getTime();

    ws.onopen = () => {
      ws.send('1');
      startTime = new Date().getTime();
    };
    ws.onmessage = (e) => {
      if (e.data === '0') {
        const endTime = new Date().getTime();
        const timeTaken = endTime - startTime;
        ws.close();
        resolve(timeTaken);
      } else {
        ws.close();
        reject(new Error('Incorrect server response'));
      }
    };

    ws.onerror = () => {
      reject(new Error('Connection error'));
    };
  });
}

function showPings() {
  const servers = [
    // NOTE: The following servers are not working until DNS is not cloudflare, I cant handle SSL
    // { name: 'Europe', host: 'eu1.alephium-pool.com', port: 3031 },
    // { name: 'Russia', host: 'ru1.alephium-pool.com', port: 3031 },
    // { name: 'US', host: 'us1.alephium-pool.com', port: 3031 },
    // { name: 'Asia', host: 'asia1.alephium-pool.com', port: 3031 },
    { name: 'Europe', host: 'eu1.alephium.coinmore.io', port: 3031 },
    { name: 'Russia', host: 'ru1.alephium.coinmore.io', port: 3031 },
    { name: 'US', host: 'us1.alephium.coinmore.io', port: 3031 },
    { name: 'Asia', host: 'asia1.alephium.coinmore.io', port: 3031 },
  ];

  servers
    .reduce((chain, server, i) => {
      return chain
        .then(() => testServer(server))
        .then((timeTaken) => {
          servers[i].ping = timeTaken;
          updatePing(server.name, timeTaken);
        })
        .then(() => new Promise((resolve) => setTimeout(resolve, 500)))
      .catch((err) => console.error(err));
  }, Promise.resolve());
}

function updatePing(serverName, pingValue) {
  if (!serverName || !pingValue) {
    return;
  }
  const pingCell = document.getElementById(`ping-${serverName}`);
  const tooltip = pingCell.closest('.ping').querySelector('.tooltip');

  if (pingCell) {
    let message;
    let tooltipText;
    if (pingValue <= 50) {
      message = `😎`;
      tooltipText = '<= 50 ms';
    } else if (pingValue <= 100) {
      message = `🙂`;
      tooltipText = '50-100 ms';
    } else if (pingValue <= 200) {
      message = `😐`;
      tooltipText = '100-200 ms';
    } else {
      message = `😟`;
      tooltipText = '> 200 ms';
    }

    pingCell.textContent = message;
    tooltip.textContent = tooltipText;
    tooltip.classList.add('active');
    pingCell.classList.add('fade-in-animation');
  }
}

const copyButtons = document.querySelectorAll('.button-copy');

copyButtons.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const { currentTarget } = event;
    const row = btn.closest('tr');
    const host = row.querySelector('.host').textContent;
    let port = '';
    let protocol = '';
    const isCopyPortSSL = currentTarget.classList.contains(
      'button-copy-port-ssl'
    );

    if (isCopyPortSSL) {
      port = row.querySelector('.port-ssl').textContent;
      protocol = 'ssl://';
    } else {
      port = row.querySelector('.port').textContent;
      protocol = 'tcp://';
    }

    const copyText = `${protocol}${host}:${port}`;
    try {
      navigator.clipboard.writeText(copyText);
      currentTarget.classList.add('copied');
      setTimeout(() => {
        currentTarget.classList.remove('copied');
      }, 1000);
    } catch (err) {}
  });
});

init();

const statsApiUrl = 'https://api.alephium-pool.com';

function statsApiCall(action) {
    return fetch(`${statsApiUrl}${action}`)
      .then(response => response.json())
}

function fetchCurrencyInfo() {
    return statsApiCall(`/rate`)
}

function fetchPoolProfit() {
    return statsApiCall('/profit');
}

function fetchPoolSummary() {
    return statsApiCall('/summary');
}

function shortenHm(hashRate, roundPlaces) {
    const denominator = [
        {d: 1000000000000, unit:'TH'},
        {d:1000000000, unit:'GH'},
        {d:1000000, unit:'MH'},
        {d:1, unit:'H'}
    ]

    if(isNaN(hashRate)) {
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

function showPoolHashrate(hashrate) {
    const shortPoolHashRate = shortenHm(hashrate, 2)
    document.getElementById('pool_hashrate').textContent = `${shortPoolHashRate.hashrate} ${shortPoolHashRate.units}/s`
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
    fetchPoolProfit().then(({profit}) => {
        showPoolProfit(profit);
        fetchCurrencyInfo().then(
            ({rate}) => showPoolProfitUSD(profit, rate)
        )
    });
    fetchPoolSummary().then(summary => {
        showPoolHashrate(summary.pool_hashrate_1h, summary.hashrate_units)
        showPool24hBlocks(summary.blocks_24h);
        showPoolLatestBlockAt(summary.last_block_at);
    });
}

const servers = [
  {
    name: 'Region auto detection',
    host: 'detect-my-region.alephium-pool.com',
    port: 3030,
  },
  { name: 'Europe', host: 'eu1.alephium-pool.com', port: 3030 },
  { name: 'Russia', host: 'ru1.alephium-pool.com', port: 3030 },
  { name: 'US', host: 'us1.alephium-pool.com', port: 3030 },
  { name: 'Asia', host: 'asia1.alephium-pool.com', port: 3030 },
]

const serversPing = []

function testServer(server) {
  return new Promise((resolve, reject) => {
    const startTime = new Date().getTime()
    const ws = new WebSocket(`ws://${server.host}:${server.port}`)

    ws.onopen = () => {
      const endTime = new Date().getTime()
      const timeTaken = endTime - startTime
       const nameServer =
					server.name === 'Region auto detection'
						? 'RegionAutoDetection'
						: server.name
      serversPing.push({ name: nameServer, ping: timeTaken })
      updatePing(nameServer, timeTaken)
      ws.close()
      resolve()
    }

    ws.onerror = () => {
      resolve()
    }
  })
}

async function testServers(servers) {
  for (let index = 0; index < servers.length; index++) {
    await testServer(servers[index])
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

function addStyleFasterServer(server) {
  const id = `ping-${server.name}`
  const pingCell = document.getElementById(id)
  if (pingCell) {
    pingCell.classList.add('faster')
  }
}

function getFasterServer(servers) {
  return servers.reduce((prev, curr) => (prev.ping < curr.ping ? prev : curr))
}

function updatePing(serverName, pingValue) {
	if (!serverName || !pingValue) {
		return
	}
	const id = `ping-${serverName}`
	const pingCell = document.getElementById(id)

	if (pingCell) {
		pingCell.textContent = `${pingValue} ms`
		pingCell.classList.add('fade-in-animation')
	}
}

function renderAndStyleServerFaster() {
	const fasterServer = getFasterServer(serversPing)
	addStyleFasterServer(fasterServer)
}


init();

(async () => {
	await testServers(servers)
	renderAndStyleServerFaster()
})()

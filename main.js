function pool_hashrate() {
    return fetch('http://api.alephium-pool.com/pool_hashrate')
      .then(response => response.json())
}

function showPoolHashrate(hashrate) {
    document.getElementById('pool_hashrate').textContent = `${hashrate} MH/s`
}

function init() {
    pool_hashrate().then(response => {
        showPoolHashrate(response.pool_hashrate_1h)
    });
}

init();

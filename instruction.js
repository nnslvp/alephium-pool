const regionSelect = document.getElementById('region');
const walletsAddress = document.querySelectorAll('.wallets-address');
const methods = document.querySelectorAll('.method');
const workerNames = document.querySelectorAll('.worker-names');
const plainWorkerNames = document.querySelectorAll('.plain-worker-names');
const endpoints = document.querySelectorAll('.endpoint');
const miningForm = document.querySelector('#miningForm');

const servers = [
  // NOTE: The following servers are not working until DNS is not cloudflare, I cant handle SSL
  // { name: 'Europe', host: 'eu1.alephium-pool.com', port: 3031 },
  // { name: 'Russia', host: 'ru1.alephium-pool.com', port: 3031 },
  // { name: 'US', host: 'us1.alephium-pool.com', port: 3031 },
  // { name: 'Asia', host: 'asia1.alephium-pool.com', port: 3031 },
  {
    name: 'Europe',
    host: 'eu1.alephium.coinmore.io',
    address: 'eu1.alephium-pool.com:20032',
    port: 3031,
  },
  {
    name: 'Russia',
    host: 'ru1.alephium.coinmore.io',
    address: 'ru1.alephium-pool.com:20032',
    port: 3031,
  },
  {
    name: 'US',
    host: 'us1.alephium.coinmore.io',
    address: 'us1.alephium-pool.com:20032',
    port: 3031,
  },
  {
    name: 'Asia',
    host: 'asia1.alephium.coinmore.io',
    address: 'asia1.alephium-pool.com:20032',
    port: 3031,
  },
];

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
  const promises = servers.map((server) => {
    return testServer(server)
      .then((timeTaken) => {
        server.ping = timeTaken;
        updatePing(server.name, timeTaken);
      })
      .catch((error) => {
        console.error(`Error testing server ${server.name}:`, error);
      });
  });

  Promise.all(promises).then(() => {
    if (!regionSelect.value) {
      selectedDefaultRegion(servers);
    }
  });
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

function selectedDefaultRegion(servers) {
  const isAllServersNotHavePing = servers.every(({ ping }) => !ping);

  if (isAllServersNotHavePing) {
    return;
  }

  const fasterServer = servers.reduce((prev, curr) => {
    const prevValue = prev.ping ?? Infinity;
    const currValue = curr.ping ?? Infinity;

    return prevValue < currValue ? prev : curr;
  });

  regionSelect.value = fasterServer.name;
}

miningForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(miningForm);
  const wallet = formData.get('wallet');
  const rigName = formData.get('rigName');
  const region = formData.get('region');
  const paymentMethod = formData.get('paymentMethod');
  const { address, port } = servers.find((s) => s.name === region);

  walletsAddress.forEach((addressEl) => {
    if (wallet) addressEl.textContent = wallet;
  });

  methods.forEach((addressEl) => {
    if (paymentMethod === 'SOLO') addressEl.textContent = 'solo:';
  });

  workerNames.forEach((addressEl) => {
    if (rigName) addressEl.textContent = `.${rigName}`;
  });

  plainWorkerNames.forEach((addressEl) => {
    if (rigName) addressEl.textContent = rigName;
  });

  endpoints.forEach((endpointEl) => {
    endpointEl.textContent = address;
  });
});

const copyButtonsInsideTableServers = document.querySelectorAll(
  '.table-servers .button-copy',
);

const copyButtonsInsideCodeWrapper = document.querySelectorAll(
  '.code-wrapper .button-copy',
);

copyButtonsInsideTableServers.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const { currentTarget } = event;
    const row = btn.closest('tr');
    const host = row.querySelector('.host').textContent;
    let port = '';
    let protocol = '';
    const isCopyPortSSL = currentTarget.classList.contains(
      'button-copy-port-ssl',
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

copyButtonsInsideCodeWrapper.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const { currentTarget } = event;
    const copyText = btn
      .closest('.code-wrapper')
      .querySelector('code').textContent;

    try {
      navigator.clipboard.writeText(copyText);
      currentTarget.classList.add('copied');
      setTimeout(() => {
        currentTarget.classList.remove('copied');
      }, 1000);
    } catch (err) {}
  });
});

showPings();

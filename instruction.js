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
    { name: 'Europe', host: 'eu1.alephium-pool.com', port: 3031 },
    { name: 'Russia', host: 'ru1.alephium-pool.com', port: 3031 },
    { name: 'US', host: 'us1.alephium-pool.com', port: 3031 },
    { name: 'Asia', host: 'asia1.alephium-pool.com', port: 3031 },
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

const copyButtonsInsideTableServers = document.querySelectorAll(
  '.table-servers .button-copy'
);

const copyButtonsInsideCodeWrapper = document.querySelectorAll(
  '.code-wrapper .button-copy'
);

copyButtonsInsideTableServers.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const { currentTarget } = event;
    const row = btn.closest('tr');
    const host = row.querySelector('.host').textContent;
    let port = '';
    let protocol = ''
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

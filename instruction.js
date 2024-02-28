
const copyButtons = document.querySelectorAll('.button-copy')

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


copyButtons.forEach(btn => {
	btn.addEventListener('click', event => {
		const { currentTarget } = event
		const copyText = btn
			.closest('.code-wrapper')
			.querySelector('code').textContent
		try {
			navigator.clipboard.writeText(copyText)
			currentTarget.classList.add('copied')
			setTimeout(() => {
				currentTarget.classList.remove('copied')
			}, 1000)
		} catch (err) {
			console.error('Ошибка копирования: ', err)
		}
	})
})

function testServer(server) {
	return new Promise((resolve, reject) => {
		const startTime = new Date().getTime()
		const ws = new WebSocket(`ws://${server.host}:${server.port}`)

		ws.onopen = () => {
			const endTime = new Date().getTime()
			const timeTaken = endTime - startTime
			serversPing.push({ name: server.name, ping: timeTaken })
			ws.close()
			resolve()
		}

		ws.onerror = () => {
			console.log(`${server.name} не смог установить соединение`)
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
	const id = `ping-${server.name.replaceAll(' ', '')}`
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
	const id = `ping-${serverName.replaceAll(' ', '')}`
	const pingCell = document.getElementById(id)
	if (pingCell) {
		pingCell.textContent = `${pingValue} ms`
	}
}

function renderServersPing() {
	serversPing.forEach(({ name, ping }) => updatePing(name, ping))
	const fasterServer = getFasterServer(serversPing)
	addStyleFasterServer(fasterServer)
}

(async () => {
	await testServers(servers)
	renderServersPing()
})()

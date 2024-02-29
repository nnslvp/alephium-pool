
const copyButtons = document.querySelectorAll('.button-copy')

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
		}
	})
})
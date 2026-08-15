const titleModal = document.querySelector('#response_modal h3');
const textModal = document.querySelector('#response_modal .content p');
const successArr = ['Спасибо!', 'Ваша заявка успешно отправлена!'];
const errorArr = ["Ошибка", "Перезагрузите страницу и попробуйте снова"];

function getCookie(name) {
	var matches = document.cookie.match(new RegExp(
	"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	))
	return matches ? decodeURIComponent(matches[1]) : undefined
}

function showErrorMes(form, el, text){
	let field = form.querySelector(el);
	field.querySelector('small').innerText = text;
	field.querySelector('small').classList.remove('hidden');
}

document.querySelectorAll("form").forEach(function(form) {
	var btn = form.querySelector('button');

	form.addEventListener('submit', async function(e) {
		e.preventDefault();

		var formData = new FormData(form);
		const params = new URLSearchParams([...new FormData(e.target).entries()]);

		if(e.target.classList.contains('has-error')) {
			return false;
		}

		if(getCookie('fta')) {
			formData.append("fta", true);
		}

		var url = window.location.href;
		var replUrl = url.replace('?', '&');
		btn.innerHTML = 'Отправляем...';
		btn.setAttribute('disabled', true);

		formData.append("page", window.location.origin + window.location.pathname);
		window.location.search.slice(1).split("&").forEach(function(pair) {
			var param = pair.split("=");
			formData.append(param[0], param[1]);
		});
		if(getCookie('__gtm_campaign_url')) {
			var source = new URL(getCookie('__gtm_campaign_url'));
			source.search.slice(1).split("&").forEach(function(pair) {
				var param = pair.split("=");
				formData.append(param[0], param[1]);
			});
		}
		for (const pair of formData) {
			params.append(pair[0], pair[1]);
		}
		fetch('https://l.alexsab.ru/lead/lestnicy/', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params,
		})
		.then(res => res.json())
		.then(await function(data){
			btn.innerHTML = btn.dataset.btn ? btn.dataset.btn : 'Отправить';
			btn.removeAttribute('disabled');
			if (data.answer == 'required') {
				showErrorMes(form, data.field, data.message);
				return;
			}
			form.reset();
			Alpine.store('state').isTypeModalOpen = false;
			Alpine.store('state').isModalOpen = false;
			titleModal.innerText = successArr[0];
			textModal.innerText = successArr[1];
			Alpine.store('state').isResponseModalOpen = true;
		})
		.catch(await function(error) {
			console.error("Ошибка отправки данных формы: " + error);
			btn.innerHTML = btn.dataset.btn ? btn.dataset.btn : 'Отправить';
			btn.removeAttribute('disabled');
			Alpine.store('state').isTypeModalOpen = false;
			Alpine.store('state').isModalOpen = false;
			titleModal.innerText = errorArr[0];
			textModal.innerText = errorArr[1];
			Alpine.store('state').isResponseModalOpen = true;
		});
		return false;
	});
});

/*
El return de la api todavía hay que verlo, para ver cómo procesar los datos desde aquí
*/

window._config = {
    api: {
        invokeUrl: '' //Esta url luego se llenará con la api 
    }
};

function registrarUsuario(usuario, pass) {
	$.ajax({
		method: 'POST',
		url: _config.api.invokeUrl + '/heatsense', //la "carpeta" representa la localización de los métodos en la api
		data: JSON.stringify({
			user: {
				usuario: usuario,
				password: pass
			}
		}),
		contentType: 'application/json'
	});
}

function loginUsuario(usuario, pass) {
	$.ajax({
		method: 'GET',
		url: _config.api.invokeUrl + '/heatsense', 
		data: JSON.stringify({
			user: {
				usuario: usuario,
				password: pass
			}
		}),
		contentType: 'application/json'
	});
}
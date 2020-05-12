/*
El return de la api todavía hay que verlo, para ver cómo procesar los datos desde aquí
*/

window._config = {
    api: {
        invokeUrl: 'https://kirm7lqi9d.execute-api.us-east-1.amazonaws.com/prod' //Esta url luego se llenará con la api 
    }
};

function registrarUsuario(usuario, pass) {
	$.ajax({
		method: 'POST',
		url: _config.api.invokeUrl + '/heatsense', //la "carpeta" representa la localización de los métodos en la api
		data: JSON.stringify({
			user: usuario,
			password: pass
		}),
		contentType: 'application/json'
	});
}

function loginUsuario(usuario, pass) {
	$.ajax({
		method: 'GET',
		url: _config.api.invokeUrl + '/heatsense', 
		data: JSON.stringify({
			user: usuario,
			password: pass
		}),
		contentType: 'application/json'
	});
}
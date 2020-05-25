window._config = {
    cognito: {
        userPoolId: 'us-east-1_SPhF6m95j',
        userPoolClientId: '7de21ln51l1o995v5fq0ipc1vh',
        region: 'us-east-1'
    },
	api: {
        invokeUrl: 'https://kirm7lqi9d.execute-api.us-east-1.amazonaws.com/prod2'	//'https://kirm7lqi9d.execute-api.us-east-1.amazonaws.com/prod'
    }
};

var HeatSense = window.HeatSense || {};

(function scopeWrapper($) {
    var signinUrl = 'index.html';
    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

	var authToken;

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    HeatSense.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    HeatSense.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });
	
    HeatSense.authToken.then(function setAuthToken(token) {
        authToken = token;
    })

    /*
     * Cognito User Pool functions
     */
    function register(email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        userPool.signUp(email, password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
			Email: email,
            Password: password
        });
        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(email, code, onSuccess, onFailure) {
		createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }
	
	/*function forgot(email, onSuccess, onFailure) {
        createCognitoUser(email).forgotPassword(function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }
	
	function confirmForgotPassword(code, email, password) {
        createCognitoUser(email).confirmForgotPassword(code, password, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }*/

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }

    /*
     *  Event Handlers
     */
    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registerForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
		//$('#forgotForm').submit(handleForgot);
    });
	
	function getTemp(){
		var url = _config.api.invokeUrl + '/heatsense';
		var headers = {
                Authorization: authToken
            };
		alert("url: " + url);
		$.get({
			url: url,
            headers: {
                'Authorization': authToken,
				'Access-Control-Allow-Origin': '*'
            },
			success: function(data, status){
						alert("Data?: " + data);
					}
		});
		/*$.get(url, function(data, status){
			alert("Data?: " + data);
		});*/
		/*$.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/heatsense',
            headers: {
                Authorization: authToken
            },
			
		});*/
		alert("Data: " + data);
	}

    function handleSignin(event) {
        var email = $('#email').val();
        var password = $('#pass').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
				alert("Antes.");				
				getTemp();
				alert("Después.");		
				console.log('Successfully Logged In');
                window.location.href = 'good2go.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
        var email = $('#emailRegisterForm').val();
        var password = $('#passRegisterForm').val();
        var password2 = $('#passcheckRegisterForm').val();
        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
			alert(confirmation);
            if (confirmation) {
                window.location.href = 'verify.html';//?user=' + email;
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();
        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailVerifyForm').val();
		//var email = (new URLSearchParams(window.location.search)).searchParams.get('user');
		var code = $('#codeVerifyForm').val();
		var onSuccess = function verifySuccess(result) {
			console.log('call result: ' + result);
			console.log('Successfully verified');
			alert('Verification successful. You will now be redirected to the login page.');
			window.location.href = signinUrl;
		};
		var onFailure = function verifyError(err) {
			alert(err);
		};
		event.preventDefault();
		verify(email, code, onSuccess, onFailure);
    }
	
	/*function handleForgot(event) {
        var email = $('#email').val();
        event.preventDefault();
        forgot(email,
            function forgotSuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully forgot');
                alert('Forgot successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function forgotError(err) {
                alert(err);
            }
        );
    }*/
	
	/*function handleConfirmForgot(event) {
		var code = $('#codeInputConfirmForgot').val();
        var email = $('#usernameInputConfirmForgot').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();
        event.preventDefault();
        if (password === password2) {
            confirmForgotPassword(code, email, password, 
				function confirmForgotSuccess(result) {
					console.log('call result: ' + result);
					console.log('Successfully confirmed forgot');
					alert('Confirmed forgot successful. You will now be redirected to the login page.');
					window.location.href = signinUrl;
				},
				function confirmForgotError(err) {
					alert(err);
				}
			);
        } else {
            alert('Passwords do not match');
        }
    }*/
}(jQuery));

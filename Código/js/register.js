window._config = {
    cognito: {
        userPoolId: 'us-east-1_SPhF6m95j',
        userPoolClientId: '7de21ln51l1o995v5fq0ipc1vh',
        region: 'us-east-1'
    },
	api: {
        invokeUrl: 'https://4hd9ckubxi.execute-api.us-east-1.amazonaws.com/prod'
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
	
	function forgot(email, onSuccess, onFailure) {
        createCognitoUser(email).forgotPassword(email, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }
	
	function confirmForgotPassword(code, email, password, onSuccess, onFailure) {
        createCognitoUser(email).confirmPassword(code, password, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

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
		$('#forgotForm').submit(handleForgot);
		$('#confirmForgotForm').submit(handleConfirmForgot);
    });
	
	function getTemp(){
		var datos;
		var url = _config.api.invokeUrl + '/heatsense';
		var headers = {
                Authorization: authToken
            };
		
		$.ajax({
			method: 'GET',
			async: false,
			url: url,
            headers: {
                'Authorization': authToken,
				'Access-Control-Allow-Origin': '*'
            },
			success: function(output, status, xhr){
				datos = xhr.getResponseHeader("content-type");
			},
			error: function(output){
				console.log("Error");
			}
		});
		return datos;
	}

    function handleSignin(event) {
        var email = $('#email').val();
        var password = $('#pass').val();
		var temp;
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {	
				temp = getTemp();
				console.log("temp: " + temp);
				console.log('Successfully Logged In');
				if(temp > 37.6){
					window.location.href = 'stayhome.html';
				}else{
					window.location.href = 'good2go.html';
				}
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
	
	function handleForgot(event) {
        var email = $('#emailForgot').val();
        event.preventDefault();
        forgot(email,
            function forgotSuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully forgot');
                alert('Forgot successful. You will now be redirected to the confirm code forgot page.');
                window.location.href = "confirmForgot.html";
            },
            function forgotError(err) {
                alert(err);
            }
        );
    }
	
	function handleConfirmForgot(event) {
		var code = $('#codeInputConfirmForgot').val();
        var email = $('#emailInputConfirmForgot').val();
        var password = $('#passwordInputConfirmForgot').val();
        var password2 = $('#password2InputConfirmForgot').val();
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
    }
}(jQuery));

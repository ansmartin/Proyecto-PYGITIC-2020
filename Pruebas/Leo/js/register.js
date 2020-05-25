window._config = {
    cognito: {
        userPoolId: 'us-east-1_SPhF6m95j',
        userPoolClientId: '7de21ln51l1o995v5fq0ipc1vh',
        region: 'us-east-1'
    },
	api: {
        invokeUrl: 'https://kirm7lqi9d.execute-api.us-east-1.amazonaws.com/prod'
    }
};

var HeatSense = window.HeatSense || {};

(function scopeWrapper($) {
    var signinUrl = 'index.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

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

    /*
     * Cognito User Pool functions
     */

    function register(username, email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(username, password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(username, email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
			Email: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(username);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(username, code, onSuccess, onFailure) {
        createCognitoUser(username).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }
	
	/*function forgot(username, onSuccess, onFailure) {
        createCognitoUser(username).forgotPassword(function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }
	
	function confirmForgotPassword(code, username, password) {
        createCognitoUser(username).confirmForgotPassword(code, password, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }*/

    function createCognitoUser(username) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#register').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
		//$('#forgotForm').submit(handleForgot);
    });

    function handleSignin(event) {
		var username = $('#user').val();
        var email = $('#email').val();
        var password = $('#pass').val();
        event.preventDefault();
        signin(username, email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'ride.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
		var username = $('#user').val();
        var email = $('#email').val();
        var password = $('#pass').val();
        var password2 = $('#passcheck').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(username, email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        //var email = $('#emailInputVerify').val();
		var username = $('#user').val();
        	var code = $('#code').val();
        event.preventDefault();
        verify(username, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
	
	/*function handleForgot(event) {
        var username = $('#usernameInputForgot').val();
        event.preventDefault();
        forgot(username,
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
        var username = $('#usernameInputConfirmForgot').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();
        event.preventDefault();

        if (password === password2) {
            confirmForgotPassword(code, username, password, 
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

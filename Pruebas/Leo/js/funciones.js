/*
El return de la api todavía hay que verlo, para ver cómo procesar los datos desde aquí
*/

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

/*function registrarUsuario(usuario, pass) {
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
}*/


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//cognito-auth.js
/*global HeatSense _config AmazonCognitoIdentity AWSCognito*/

var HeatSense = window.HeatSense || {};

(function scopeWrapper($) {
    var signinUrl = 'signin.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    /*if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }*/

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
            Username: email,
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
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
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
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

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
            register(email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(email, code,
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
}(jQuery));


/////////////////////////////////////////////////////////////////////
//Login
<section class="form-wrap">
            <h1>Sign In</h1>
            <form id="signinForm">
              <input type="email" id="emailInputSignin" placeholder="Email" required>
              <input type="password" id="passwordInputSignin" placeholder="Password" pattern=".*" required>

              <input type="submit" value="Sign in">
            </form>
        </section>

        <script src="js/vendor/jquery-3.1.0.js"></script>
        <script src="js/vendor/bootstrap.min.js"></script>
        <script src="js/vendor/aws-cognito-sdk.min.js"></script>
        <script src="js/vendor/amazon-cognito-identity.min.js"></script>
        <script src="js/config.js"></script>
        <script src="js/cognito-auth.js"></script>


/////////////////////////////////////////////////////////////////////
//Registro
<section class="form-wrap">
            <h1>Register</h1>
            <form id="registrationForm">
              <input type="email" id="emailInputRegister" placeholder="Email" pattern=".*" required>
              <input type="password" id="passwordInputRegister" placeholder="Password" pattern=".*" required>
              <input type="password" id="password2InputRegister" placeholder="Confirm Password" pattern=".*" required>

              <input type="submit" value="Let's Ryde">
            </form>
        </section>

        <script src="js/vendor/jquery-3.1.0.js"></script>
        <script src="js/vendor/bootstrap.min.js"></script>
        <script src="js/vendor/aws-cognito-sdk.min.js"></script>
        <script src="js/vendor/amazon-cognito-identity.min.js"></script>
        <script src="js/config.js"></script>
        <script src="js/cognito-auth.js"></script>


/////////////////////////////////////////////////////////////////////
//Validación
<section class="form-wrap">
            <h1>Verify Email</h1>
            <form id="verifyForm">
              <input type="email" id="emailInputVerify" placeholder="Email" required>
              <input type="text" id="codeInputVerify" placeholder="Verification Code" pattern=".*" required>

              <input type="submit" value="Verify">
            </form>
        </section>

        <script src="js/vendor/jquery-3.1.0.js"></script>
        <script src="js/vendor/bootstrap.min.js"></script>
        <script src="js/vendor/aws-cognito-sdk.min.js"></script>
        <script src="js/vendor/amazon-cognito-identity.min.js"></script>
        <script src="js/config.js"></script>
        <script src="js/cognito-auth.js"></script>
/**
 * @file Handle Cognito actions :
 * authToken - Authorizaton token for logged in users.
 * sign up - Call of the _cognito-auth's function which create account.
 * verify - Call of the _cognito-auth's function which verify user's email after sign up.
 * sign in - Call of the _cognito-auth's function which check credentials and set user's authToken.
 * sign out - Call of the _cognito-auth's function which revokes user's authToken.
 * @author Amazon Cognito
 */

/*global MyWiki _config AmazonCognitoIdentity AWSCognito*/

var MyWiki = window.MyWiki || {};

(function scopeWrapper($) {
    var signinUrl = 'signin.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    MyWiki.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    MyWiki.getCurrentUser = function getCurrentUser() {
        var cognitoUser = userPool.getCurrentUser();
        if (cognitoUser != null) {
            cognitoUser.getSession(function(err, session) {
                if (err) {
                    alert(err);
                    return;
                }
                console.log('session validity: ' + session.isValid());
                MyWiki.user_email =  cognitoUser.username;
            });
        }
    };

    MyWiki.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
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

    function register(email, username, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var dataUsername = {
            Name: 'name',
            Value: username
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(email, password, [attributeEmail, dataUsername], null,
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
        // fix bug
        MyWiki.getCurrentUser = cognitoUser;
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
                // fix bug
                // MyWiki.user_email =  cognitoUser.username;
                MyWiki.user_email =  MyWiki.getCurrentUser.username;
                // TODO Use MyWikiShared.pagesRoot
                window.location.href = '../home/home.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {

        if ($('#registrationForm').valid()) {
            var email = $('#emailInputRegister').val();
            var username = $('#usernameInputRegister').val();
            var password = $('#passwordInputRegister').val();
            var password2 = $('#password2InputRegister').val();
    
            var onSuccess = function registerSuccess(result) {
                var cognitoUser = result.user;
                console.log('user name is ' + cognitoUser.getUsername());
                var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
                if (confirmation) {
                    window.location.href = 'verify-account.html';
                }
            };
            var onFailure = function registerFailure(err) {
                alert(err);
            };
            event.preventDefault();
    
            if (password === password2) {
                register(email, username, password, onSuccess, onFailure);
            } else {
                alert('Passwords do not match');
            }
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

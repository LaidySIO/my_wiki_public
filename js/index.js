/*global MyWiki _config*/

var MyWiki = window.MyWiki || {};

(function indexScopeWrapper($) {
    var authToken;
    // Check if user has a token
    MyWiki.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
            window.location.href = 'pages/home/home.html';
        }
    }).catch(function handleTokenError(error) {
        console.log(error);
    });

    $(function onDocReady() {

    });

}(jQuery));

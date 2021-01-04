/**
 * @file Handle shared Cognito actions :
 * authToken - get Authorizaton token for logged in users.
 * sign out - Handle click "LogOut" click in navbar > dropdown (Call of the Cognito function which revokes user's authToken)
 * @author Laidy Chinama
 */

/*global MyWiki _config AmazonCognitoIdentity AWSCognito*/

var MyWiki = window.MyWiki || {};
var MyWikiShared = window.MyWikiShared || {};

(function sharedCognitoScopeWrapper($) {

var authToken;
// Check if user has a token
MyWiki.authToken.then(function setAuthToken(token) {
    if (token) {
        MyWikiShared.authToken = token;
    } else {
        console.log("No token !!");
        window.location.href = MyWikiShared.pagesRoot + "account/signin.html";
    }
}).catch(function handleTokenError(error) {
    console.log(error);
    window.location.href = MyWikiShared.pagesRoot + "account/signin.html";
});

// When document is ready
$(function onDocReady() {
    // Handle click "LogOut" click in navbar > dropdown
    $(document).on('click','#signOut',function(){
        MyWiki.signOut();
        alert("You have been signed out.");
        window.location = MyWikiShared.pagesRoot + "account/signin.html";
    });

});


}(jQuery));

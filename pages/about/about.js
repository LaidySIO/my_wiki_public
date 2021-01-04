/*global MyWiki _config*/

var MyWikiShared = window.MyWikiShared || {};

var categories;

// set relative path to folder /pages
MyWikiShared.pagesRoot = "../";

(function aboutScopeWrapper($) {

    // DEBUG
    MyWiki.getCurrentUser();

    // When document is ready
    $(function onDocReady() {
        $('#aboutRootDiv').show();
    });

}(jQuery));

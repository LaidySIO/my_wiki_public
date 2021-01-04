var MyWikiShared = window.MyWikiShared || {};

(function sharedNavbarScopeWrapper($) {

// When document is ready
$(function onDocReady() {
    // Add navbar to html pages in folder /pages
    $( "body>div[id$='RootDiv']" ).prepend(generateNavbarHTML());

});

// Generate complete navbar
function generateNavbarHTML() {

    return '<nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">' +
               '<a class="navbar-brand" href="' + MyWikiShared.pagesRoot + 'home/home.html">My Wiki</a>' +
               '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"' +
                       'aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">' +
                   '<span class="navbar-toggler-icon"></span>' +
               '</button>' +
               '<div class="collapse navbar-collapse" id="navbarSupportedContent">' +
                    generateNavbarLeftLinksHTML() +
                    generateNavbarRightDropdown() +
               '</div>' +
           '</nav>';
}

// Generate navbars's left links e.g. : brand name, "home"...
function generateNavbarLeftLinksHTML() {

    return '<ul class="navbar-nav mr-auto">' +
              '<li class="nav-item active">' +
                  '<a class="nav-link" href="' + MyWikiShared.pagesRoot + 'home/home.html">Home <span class="sr-only">(current)</span></a>' +
              '</li>' +
              '<li class="nav-item">' +
                  '<a class="nav-link" href="#">Link</a>' +
              '</li>' +
              '<li class="nav-item">' +
                  '<a class="nav-link disabled" href="#">Disabled</a>' +
              '</li>' +
            '</ul>';
}

// Generate navbars's right dropdown e.g. : "profile", "settings", "logout"...
function generateNavbarRightDropdown() {

    return '<ul class="navbar-nav mr-5">' +
              '<li class="nav-item dropdown">' +
                  '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"' +
                     'data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                      'Dropdown' +
                  '</a>' +
                  '<div class="dropdown-menu" aria-labelledby="navbarDropdown">' +
                      '<a class="dropdown-item disabled" href="#">Profile</a>' +
                      '<a class="dropdown-item disabled" href="#">Settings</a>' +
                      '<a class="dropdown-item disabled" href="#">Help</a>' +
                      '<a class="dropdown-item" href="' + MyWikiShared.pagesRoot + 'about/about.html">About</a>' +
                      '<div class="dropdown-divider"></div>' +
                      '<a class="dropdown-item" href="#" id="signOut">Logout</a>' +
                  '</div>' +
              '</li>' +
            '</ul>';
}

}(jQuery));

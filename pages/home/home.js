/**
 * @file Home page after signin, shows all categories - home.html.
 * @author Laidy Chinama
 */

/*global MyWikiShared _shared-cognito*/

var MyWikiShared = window.MyWikiShared || {};

var categories;
var categoryId;

// set relative path to folder /pages
MyWikiShared.pagesRoot = "../";

(function homeScopeWrapper($) {

    // DEBUG
    MyWiki.getCurrentUser();

    // Set spinner visibility on ajax request status
    $(document).on({
        ajaxStart: function () {
            $('#spinner').addClass('spinner');
        },
        ajaxStop: function () {
            $('#spinner').removeClass('spinner');
        }
    });

    var getCategories = new Vue({
        el: '#categories',
        data: function () {
            return {
                categories: [],
            };
        },
        mounted: function () {
            this.load();
        },
        methods: {
            load: function () {
                var that = this;
                $.ajax({
                    method: 'GET',
                    url: _config.api.invokeUrl + '/categories',
                    headers: {
                        Authorization: MyWikiShared.authToken
                    },
                    success: function (data) {
                        that.categories = jsonToCategories(data.Items); 
                        console.log(that.categories);
                    },
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        if (jqXHR.responseText == undefined) {
                            noNetwork();
                        } else {
                            console.error('Error requesting Categories: ', textStatus, ', Details: ', errorThrown);
                            console.error('Response: ', jqXHR.responseText);
                            alert('An error occured when getting all categories:\n' + jqXHR.responseText);
                            noCategoriesDB();
                        }
                    }
                });
            }
        },
    });

    /**
     * Get all Categories from dynamoDB
     * @param {}
     * @return {void}
     * @callback success : completeRequest fail: debug error
     */
    function getCategories() {
        resetCategories(true);

        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/categories',
            headers: {
                Authorization: MyWikiShared.authToken
            },
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseText == undefined) {
                    noNetwork();
                } else {
                    console.error('Error requesting Categories: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    alert('An error occured when getting all categories:\n' + jqXHR.responseText);
                    noCategoriesDB();
                }
            }
        });
    }

    /**
     * Callback when getCategories() succeeded
     * @param {result} Json Array  - Array of Json object type Category
     * @return {void}
     */
    function completeRequest(result) {
        console.log('Response received from API: ', result);
        categoriesCount = result.Count;
        // TODO : sort categories
        // Convert array of json objects to array of javascript object
        categories = jsonToCategories(result.Items);
        console.log(categories);

        // Check if no categories found
        if (categoriesCount > 0) {
            isCategories();
            fillCategories(categories);
        } else {
            noCategoriesDB();
        }

    }

    // When document is ready
    $(function onDocReady() {

        // Load all categories
        // getCategories();

         // If user search categories
         $('#searchCategories').keyup(function () {
            var searchTarget = $('#searchCategories').val().toLowerCase();

            if (searchTarget.length > 1) {
                searchCategories(searchTarget);
            } else {
                fillCategories(categories);
            }
        });

        // Actions on categories cards
        $(document).on({
            mouseenter: function () {
                categoryId = this.id.slice(this.id.indexOf('_', 0) + 1);
                $(this).find('.edit-categ-circle').css({ display: 'block' });

            },
            mouseleave: function () {
                $(this).find('.edit-categ-circle').css({ display: 'none' });
                category = undefined;

            },
            click: function () {
                // Add code here
            },
        }, "div[id^='categoryCard_']");

        // Action on click edit category icon
        $(document).on('click','.edit-categ-circle',function(){
            console.log(categoryId);
            if (categoryId) {
                window.location = '../category/update/update-category.html?categoryID=' + categoryId;
            }
        });

        $('#homeRootDiv').show();

    });

    /**
     * Handle each categories - Loop through Javascript array of category to create their Card
     * @param {categArray} Javascript array of object  - Array of Javascript object type Category
     * @return {void}
     */
    function fillCategories(categArray) {
        // empty div #categories (div of all categories)
        resetCategories(false);
        for (const category of categArray) {
            createCategoryCard(category);
        }

        isCategories();
    }

    /**
     * Reset categories - Empty div #categories (div of all categories)
     * @param {isComplete} Boolean  - If true empty the array categories (Javacript array of all categories)
     * @return {void}
     */
    function resetCategories(isComplete) {
        if (isComplete) {
            categories = [];
        }
        $('#categories').empty();
    }

    /**
     * Add card for each categories in div #categories
     * @param {category} JavaScript object  - The category we whant to add in div #categories
     * @return {void}
     */
    function createCategoryCard(category) {

        const iconVisibility = category.public ? 'users' : 'user';

        const categoryCard = '<div id="categoryCard_' + category.id + '" class="card bg-light mb-3 mx-2" style="max-width: 15rem;">' +
            '<div class="edit-categ-circle">' +
            '<i class="fas fa-pen"></i></div>' +
            '<div class="card-header h-100" style="max-height: 15rem;">' +
            '<img src="'+ category.img +'" class="w-100  h-100"></img>' +
            '</div>' +
            '<div class="card-body" style="max-height: 15rem; ">' +
            '<h5 class="card-title">' + category.name +
            '<i class="fas fa-' + iconVisibility + ' fa-xs float-right"></i>' +
            '</h5>' +
            '<p class="card-text noselect">' + category.description + '</p>' +
            '</div>' +
            '</div>';

        $('#categories').append(categoryCard);
    }

    // When no categories found in DB
    function noCategoriesDB() {
        // Hide search input
        $('#searchCategoriesDiv').hide();
        // Hide categories list
        $('#categories').hide();

        // Show msg ex: "no categories found"
        $('#noCategories').css({ display: 'block' });
    }

    // When no categories found by search
    function noCategoriesQuery() {
        // Hide categories list
        $('#categories').hide();

        // Show msg ex: "no categories found"
        $('#noCategories').css({ display: 'block' });
    }


    // When at least 1 categories is found
    function isCategories() {
        // Show search input
        $('#searchCategoriesDiv').show();
        // Show categories list
        $('#categories').show();

        // Hide msg ex: "no categories found"
        $('#noCategories').css({ display: 'none' });
    }

    // When user has network issue
    function noNetwork() {
        alert("No Network");
        // Hide categories list + msg "no gategories found"
        $('#listCategRootDiv').hide();
        // Hide search input
        $('#searchCategoriesDiv').hide();
        // Hide button to add category
        $('#addCategoriesBtnDiv').hide();

        // Show msg ex : "No network connection"
        $('#noNetwork').css({ display: 'flex' });
    }

    /**
     * Search categories by Keywords entered by user
     * @param {searchTarget} String  - Keywords entered by user
     * @return {void}
     */
    function searchCategories(searchTarget) {

       var searcheCategoriesArr = [];
       for (const category of categories) {

            const categoryName = category.name.toLowerCase();
            const categoryDesc = category.description.toLowerCase();

            if (categoryName.includes(searchTarget) || categoryDesc.includes(searchTarget)) {
                console.log(category);
                console.log('found ' + categoryName + ' ' + categoryDesc );
                searcheCategoriesArr.push(category);
            }
       }

       // If there is a match, we fill all categories with matches
       if (searcheCategoriesArr.length > 0) {
           fillCategories(searcheCategoriesArr);
       } else {
           noCategoriesQuery();
       }

    }

}(jQuery));

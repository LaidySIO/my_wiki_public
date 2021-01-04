/**
 * @file Manage category update - update-category.html.
 * @author Laidy Chinama
 */

/*global MyWikiShared _shared-cognito*/

var MyWikiShared = window.MyWikiShared || {};

var url;
var category;
var categoryId;
var categoryImg;

var isFileSelected = false;

// set relative path to folder /pages
MyWikiShared.pagesRoot = "../../";

(function updateCategoryScopeWrapper($) {

    /**
     * Add base64 encoded img to new category
     * @param {updatedCategory} object - Category to update
     * @return {void}
     */
    function getCategEncodedImg(updatedCategory) {

        // TODO add verification for categoryImg !!
        generateFormDataImg(categoryImg, function(result) {
            updatedCategory.img = result.target.result;
            updateCategory(updatedCategory);
        }, function(err) {
             console.log('Error: ', err);
        });

    }

    /**
     * Update updatedCategory to dynamoDB & S3 (img)
     * @param {updatedCategory} object - category to update
     * @return {void}
     * @callback success : completeUpdateRequest fail: debug error
     */
    function updateCategory(updatedCategory) {

        // Send updated file to lambda
         $.ajax({
            method: 'PUT',
            url: _config.api.invokeUrl + '/categories/' + categoryId,
            headers: {
                Authorization: MyWikiShared.authToken
            },
            data: JSON.stringify({
                Category: {
                    CategoryId : categoryId,
                    Name: updatedCategory.name,
                    Description: updatedCategory.description,
                    Public: updatedCategory.public,
                    ImgURL: updatedCategory.img
                }
            }),
            contentType: 'application/json',
            success: completeUpdateRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting Categories: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when updating your category:\n' + jqXHR.responseText);
            }
        });
    }

    /**
     * Delete category to dynamoDB & S3 (img)
     * @param {category} object - category to delete
     * @return {void}
     * @callback success : completeDeleteRequest fail: debug error
     */
    function deleteCategory(category) {
        // DEBUG
        console.log(category.img);
        console.log(categoryId);

         $.ajax({
            method: 'DELETE',
            url: _config.api.invokeUrl + '/categories/' + categoryId,
            headers: {
                Authorization: MyWikiShared.authToken
            },
            data: JSON.stringify({
                Category: {
                    CategoryId : categoryId,
                    ImgURL: category.img
                }
            }),
            contentType: 'application/json',
            success: completeDeleteRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting Categories: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when updating your category:\n' + jqXHR.responseText);
            }
        });
    }

    /**
     * Search category by name in DynamoDB to check duplicate
     * @param {categoryName} string - category's name entered by the user
     * @return {void}
     * @callback success : completeFindRequest fail: debug error
     */
    function findCategory(categoryName) {

        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/categories/name/' + categoryName,
            headers: {
                Authorization: MyWikiShared.authToken
            },
            success: completeFindRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting Categories: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when checking your category:\n' + jqXHR.responseText);
            }
        });
    }

    /**
     * Load category by id in DynamoDB
     * @param {categoryId} string - category's id
     * @return {void}
     * @callback success : completeFindByIdRequest fail: debug error
     */
    function findCategoryById(categoryId) {

        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/categories/' + categoryId,
            headers: {
                Authorization: MyWikiShared.authToken
            },
            success: completeFindByIdRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting Categories: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when searching your category:\n' + jqXHR.responseText);
            }
        });
    }

    // When document is ready
    $(function onDocReady() {
        getUrl();
        getCategoryId();
        findCategoryById(categoryId);
        $('#update-category').click(handleUpdateCategoryClick);
        $('#delete-category').click(handleDeleteCategoryClick);
        $('#updateCategoryName').keyup(handleFindCategoryChange);
        $('#updateCategoryImg').change(handleImageCategoryChange);

        $('#updateCategRootDiv').show();

        // TEST NOT ALLOW SPACE AND NOT A-Za-z
        // alert(/^[^-\s][a-zA-Z_\s-]+$/.test('sf jd'));
    });

    // on click button "Update Category"
    function handleUpdateCategoryClick(event) {
        if ($('#updateCategoryForm').valid()) {
            var updatedCategory = {
                name: $('#updateCategoryName').val(),
                description: $('#updateCategoryDesc').val(),
                public: $("#updateCategoryForm input[type='radio']:checked").val() == 'public' ? true : false,
                img: category.img
            };
            event.preventDefault();

            if (!isFileSelected) {
                updateCategory(updatedCategory);
            } else {
                getCategEncodedImg(updatedCategory);
            }
        }
    }

    // on click button "Delete Category"
    function handleDeleteCategoryClick(event) {
        console.log(category);
        if (category != undefined) {
            deleteCategory(category);
        } else {
            alert('An error occured, please try again.');
            window.location.href = '../../home/home.html';
        }
    }

    // on change category name : check duplicate name !
    function handleFindCategoryChange(event) {
        const categoryName = $('#updateCategoryName').val();
        if (categoryName.length > 0) {
            findCategory(categoryName);
        }
    }

    // on change category img
    function handleImageCategoryChange(event) {
        var inputFileValue = $('#updateCategoryImg').val();

        if (inputFileValue != '') { // If user select an image
            isFileSelected = true;
            categoryImg = event.target.files;

            if (categoryImg && categoryImg[0]) {
                var reader = new FileReader();
                reader.onload = function (e) { // Previsualize selected image
                    $('#selectedCategoryImg').attr('src', e.target.result);
                }
                reader.readAsDataURL(categoryImg[0]);
            }
        } else { // If no image selected, we set previous image
            isFileSelected = false;
            categoryImg = undefined;
            $('#selectedCategoryImg').attr('src', category.img);

        }
    }

    function completeUpdateRequest(result) {
        console.log('completeUpdateRequest : Response received from API: ', result);
        window.location.href = '../../home/home.html';
    }

    function completeDeleteRequest(result) {
        console.log('completeDeleteRequest : Response received from API: ', result);
        window.location.href = '../../home/home.html';
    }

    function completeFindRequest(result) {
        console.log('completeFindRequest : Response received from API: ', result);
        if (result.Count > 0) {
            // TODO Add msg for duplicate
            console.log("DUPLICATE");

        }
    }

    function completeFindByIdRequest(result) {
        console.log('completeFindByIdRequest : Response received from API: ', result);
        if (result.Count > 0) {
            createCategory(result.Items[0]);
        }  else {
              alert('An error occured, please try again.');
              window.location.href = '../../home/home.html';
          }
    }

    function getUrl() {
        url = window.location.href;
        console.log('URL ==> ' + url);
    }

    // Store current category ID in global variable categoryId
    function getCategoryId() {
        categoryId = getParam("categoryID", url);
        console.log('categoryId ==> ' + categoryId);
    }

    /**
     * Get category's id from url params
     * @param {param} string - url parameter which contains category's id
     * @param {url} string - current url
     * @return {results or null} - return category's ID or null if not found
     */
    function getParam( param, url ) {
        param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+param+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( url );
        return results == null ? null : results[1];
    }

    // Convert json object to javascript object
    function createCategory(jsonCategory) {
        // Set gobal variable category
        category = jsonToCategory(jsonCategory)

        // Fill form fields with caregory's values
        fillValues();

    }

    // Fill fields with category's values
    function fillValues() {

        $('#updateCategoryName').val(category.name);
        $('#updateCategoryName').closest('div.form-group').addClass('is-filled');

        $('#updateCategoryDesc').val(category.description);
        $('#updateCategoryDesc').closest('div.form-group').addClass('is-filled');

        $public = $('input:radio[name=isPublicRadios]');
        if (!category.public) {
            $public.filter('[value=private]').prop('checked', true);
        } else {
            $public.filter('[value=public]').prop('checked', true);

        }

        $('#selectedCategoryImg').attr('src', category.img);
    }

    // Generate and return base64 encoded selected category's image
    function generateFormDataImg(categoryImg, result, error) {
        var encodedFile;
        var file = categoryImg[0];
        var reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = result;
        reader.onerror = error;
    }

}(jQuery));

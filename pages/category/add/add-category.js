/**
 * @file Manage category create - add-category.html.
 * @author Laidy Chinama
 */

/*global MyWikiShared _shared-cognito*/

var MyWikiShared = window.MyWikiShared || {};

var categoryImg;
var isFileSelected = false;
const defaultCategoryImg = 'https://mywikibucket.s3-eu-west-1.amazonaws.com/mywiki-categ-img/default_categ_img.jpg';

// set relative path to folder /pages
MyWikiShared.pagesRoot = "../../";


(function addCategoryScopeWrapper($) {

    /**
     * Add base64 encoded img to new category
     * @param {newCategory} object - new category to create
     * @return {void}
     */
    function getCategEncodedImg(newCategory) {

        // TODO add verification for categoryImg !!
        generateFormDataImg(categoryImg, function(result) {
            newCategory.img = result.target.result;
            addCategory(newCategory);
        }, function(err) {
             console.log('Error: ', err);
        });

    }

    /**
     * Add newCategory to dynamoDB & S3 (img)
     * @param {newCategory} object - new category to create
     * @return {void}
     * @callback success : completeAddRequest fail: debug error
     */
    function addCategory(newCategory) {
        // DEBUG
        console.log(newCategory);
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/categories',
            headers: {
                Authorization: MyWikiShared.authToken
            },
            data: JSON.stringify({
                Category: {
                    Name: newCategory.name,
                    Description: newCategory.description,
                    Public: newCategory.public,
                    ImgURL: newCategory.img

                }
            }),
            contentType: 'application/json',
            success: completeAddRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting Categories: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when saving your newCategory:\n' + jqXHR.responseText);
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
                alert('An error occured when searching your category:\n' + jqXHR.responseText);
            }
        });
    }

    // When document is ready
    $(function onDocReady() {
        $('#add-category').click(handleAddCategoryClick);
        $('#addCategoryName').keyup(handleFindCategoryChange);
        $('#createCategoryImg').change(handleImageCategoryChange);

        // Show default image for category
        $('#selectedCategoryImg').attr('src', defaultCategoryImg);

        $('#addCategRootDiv').show();

        // TEST NOT ALLOW SPACE AND NOT A-Za-z
        // alert(/^[^-\s][a-zA-Z_\s-]+$/.test('sf jd'));
    });

    /**
     * Handle click button to save a category
     * Check the form validity, create new object Category
     * and generate base64 encoded image or set default image url
     * @param {event}
     * @return {void}
     */
    function handleAddCategoryClick(event) {
        if ($('#addCategoryForm').valid()) {
            var newCategory = {
                name: $('#addCategoryName').val(),
                description: $('#addCategoryDesc').val(),
                public: $("#addCategoryForm input[type='radio']:checked").val() == 'public' ? true : false
            };
            event.preventDefault();

           if (!isFileSelected) {
               newCategory.img = defaultCategoryImg;
               addCategory(newCategory);
           } else {
               getCategEncodedImg(newCategory);
           }
        }
    }

    /**
     * Handle new category's name entered by the user
     * @param {event}
     * @return {void}
     */
    function handleFindCategoryChange(event) {
        const categoryName = $('#addCategoryName').val();
        if (categoryName.length > 0) {
            findCategory(categoryName);
        }
    }

    /**
     * Handle new category's image selected by the user
     * @param {event}
     * @return {void}
     */
    function handleImageCategoryChange(event) {
        var inputFileValue = $('#createCategoryImg').val();

        if (inputFileValue != '') {
            isFileSelected = true;
            categoryImg = event.target.files;

            if (categoryImg && categoryImg[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('#selectedCategoryImg').attr('src', e.target.result);
                }
                reader.readAsDataURL(categoryImg[0]);
            }
        } else {
            isFileSelected = false;
            categoryImg = undefined;
            $('#selectedCategoryImg').attr('src', defaultCategoryImg);

        }
    }

    function completeAddRequest(result) {
        console.log('completeAddRequest : Response received from API: ', result);
        window.location.href = '../../home/home.html';
    }

    function completeFindRequest(result) {
        console.log('completeFindRequest : Response received from API: ', result);
        if (result.Count > 0) {
            alert("this category already exists !! ");
        }
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

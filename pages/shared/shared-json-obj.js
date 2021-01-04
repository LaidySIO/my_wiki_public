/**
 * @file Convert json objects/arrays to javascript objects/arrays.
 * @author Laidy Chinama
 */


/* *********************  CATEGORY ********************* */

/**
 * Generates an array of Javascript object type Category
 * @param {jsonCategories} array - array of json objects type Category
 * @return {categoriesArr} - array of Javascript object type Category
 */
function jsonToCategories(jsonCategories) {
    categoriesArr = [];
    for (const jsonCategory of jsonCategories) {
        categoriesArr.push(jsonToCategory(jsonCategory));
    }

    return categoriesArr;
}

/**
 * Generates a Javascript object type Category
 * @param {jsonCategory} object - a json object type Category
 * @return {categoryObj} - Javascript object type Category
 */
function jsonToCategory(jsonCategory) {

    return categoryObj = {
        id: jsonCategory['CategoriesId']['S'],
        name: jsonCategory['CategoryName']['S'],
        description: jsonCategory['Category']['M']['Description']['S'],
        public: jsonCategory['Category']['M']['Public']['BOOL'],
        creator: jsonCategory['User']['S'],
        creationDate: jsonCategory['RequestTime']['S'],
        img: jsonCategory['Category']['M']['ImgURL']['S']
    }
}
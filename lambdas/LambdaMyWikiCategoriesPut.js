const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
        errorResponse('Authorization not configured', context.awsRequestId, callback);
        return;
    }

    // Because we're using a Cognito User Pools authorizer, all of the claims
    // included in the authentication token are provided in the request context.
    // This includes the username as well as other attributes.
    const username = event.requestContext.authorizer.claims['cognito:username'];

    // The body field of the event in a proxy integration is a raw string.
    // In order to extract meaningful values, we need to first parse this string
    // into an object. A more robust implementation might inspect the Content-Type
    // header first and use a different parsing strategy based on that value.
    const requestBody = JSON.parse(event.body);
    const newCategory = requestBody.Category;
    const categoriesId = newCategory.CategoryId;

    // boolean check if newCategory.ImgURL is an URL or base64 encoded image
    var isimageURL = true;

    if (!validURL(newCategory.ImgURL)) {
        isimageURL = false;
        uploadImgToS3(newCategory.ImgURL, categoriesId);
    }

    const category = {
        Name: newCategory.Name,
        Description: newCategory.Description,
        Public: newCategory.Public,
        ImgURL : isimageURL ? newCategory.ImgURL : generateImgUrl(categoriesId)
    };

    recordRide(categoriesId, username, category).then(() => {
        // You can use the callback function to provide a return value from your Node.js
        // Lambda functions. The first parameter is used for failed invocations. The
        // second parameter specifies the result data of the invocation.

        // Because this Lambda function is called by an API Gateway proxy integration
        // the result object must use the following structure.
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                CategoriesId: categoriesId,
                Category: category,
                CategoryName: category.Name,
                Eta: '30 seconds',
                Rider: username,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);

        // If there is an error during processing, catch it and return
        // from the Lambda function successfully. Specify a 500 HTTP status
        // code and provide an error message in the body. This will provide a
        // more meaningful error response to the end client.
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

function recordRide(categoriesId, username, category) {
    return ddb.update({
        TableName: 'Categories',
        Key: {
            CategoriesId: categoriesId
        },
        UpdateExpression: "set CategoryName=:cn, Category=:c, UpdateTime=:u",
        ExpressionAttributeValues: {
            ":cn": category.Name,
            ":c": category,
            ":u": new Date().toISOString()
        },
        ReturnValues: "UPDATED_NEW"
    }).promise();
}

function uploadImgToS3(categImg, categoriesId) {
    let encodedImage = categImg;
    let decodedImage = Buffer.from(encodedImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    var filePath = process.env.ROOTPATH + categoriesId + ".jpg"
    var params = {
        "Body": decodedImage,
        "Bucket": process.env.BUCKET,
        "Key": filePath
    };
    s3.upload(params, function(err, data) {
        if (err) {
            console.error(err);
        }
        else {
            let response = {
                "statusCode": 200,
                "headers": {
                    "my_header": "my_value"
                },
                "body": JSON.stringify(data),
                "isBase64Encoded": false
            };
        }
    }).promise();
}

function generateImgUrl(categoriesId) {
    return `https://${process.env.BUCKET}.s3-${process.env.ZONE}.amazonaws.com/${process.env.ROOTPATH}${categoriesId}.jpg`
}

function toUrlString(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}

function validURL(url) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(url);
}

# My Wiki

## What ?

"My Wiki" is a web application that allows you to create your knowledge base on various subjects
 and share it with other users !
 
**The application is still under development**
 

## Why ?

It is a personal project which aims to become familiar with [serverless](https://www.cloudflare.com/learning/serverless/what-is-serverless/) using [AWS](https://aws.amazon.com/serverless/build-a-web-app/?nc1=h_ls)

![alt text][logo]

[logo]: https://d1.awsstatic.com/diagrams/Serverless_Architecture.5434f715486a0bdd5786cd1c084cd96efa82438f.png "Project's architecture"

## How ?

My Wiki is a basic web applications using stack : HTML, CSS, JavaScript (JQuery).

#### If you whant to run this app : 
**Please follow this [tutorial](https://aws.amazon.com/fr/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/)** to setup your environment and learn more about : 
* AWS Amplify 
* Amazon Cognito 
* Amazon API Gateway 
* AWS Lambda
* Amazon DynamoDB

---

API calls "use" directly **API Gateway** to **read data from DynamoDB**  
API calls invoke **Lambda** to **add, update or delete data to DynamoDB**

| Methods        | With             | Sources                  |
| -------------- |:----------------:| ------------------------:|
| GET            | API Gateway      |    tutorials [#1] & [#2] |
| POST           | Lambda           |    [lambda-folder]       |
| PUT            | Lambda           |    [lambda-folder]       |
| DELETE         | Lambda           |    [lambda-folder]       |

[lambda-folder]: https://github.com/LaidySIO/my_wiki_public/tree/master/lambdas
[#1]: https://medium.com/@likhita507/using-api-gateway-to-get-data-from-dynamo-db-using-without-using-aws-lambda-e51434a4f5a0
[#2]: https://medium.com/brlink/rest-api-just-with-apigateway-and-dynamodb-8a9b0cd76b7a

---

Lambdas are written in Node.js and have **environment variable** for exemple in file [LambdaMyWikiCategoriesPost](https://github.com/LaidySIO/my_wiki_public/blob/master/lambdas/LambdaMyWikiCategoriesPost.js) : 
* BUCKET : your bucket name (ex: my-project)
* ROOTPATH : target path (ex: users-img if the folder is **/my-project/users-img/**)
* ZONE : your bucket zone (ex: us-est-1)

See [here](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html "Using AWS Lambda environment variables") for more details

---

You will have to update file [config.js](https://github.com/LaidySIO/my_wiki_public/blob/master/js/config.js) fill in Cognito and API Gateway infos. 
==> see this [tutorial](https://aws.amazon.com/fr/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/) at *step 5*.

---

Images are stored with S3 (you can find exemples of actions on S3 objets in folder [/lambdas](https://github.com/LaidySIO/my_wiki_public/tree/master/lambdas)

---

#### If you want to try this application : 
I will give you the link soon :)


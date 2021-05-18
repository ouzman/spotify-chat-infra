const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

const FUNCTION_NAME = process.env.SPOTIFY_LAMBDA_FUNCTION_NAME;

exports.getUserInfo = async ({ accessToken }) => {
    const payload = {
        eventType: 'getUserInfo',
        payload: {
            accessToken
        }
    };

    return lambda.invoke({
        FunctionName: FUNCTION_NAME,
        Payload: JSON.stringify(payload)
    }).promise()
        .then(event => event.Payload)
        .then(payload => JSON.parse(payload));
}

exports.getAuthorizeUrl = async ({ callbackUrl }) => {
    const payload = {
        eventType: 'getAuthorizeUrl',
        payload: {
            callbackUrl,
        }
    };

    return lambda.invoke({
        FunctionName: FUNCTION_NAME,
        Payload: JSON.stringify(payload)
    }).promise()
        .then(event => event.Payload)
        .then(payload => JSON.parse(payload));
}

exports.getToken = async ({ accessToken }) => {
    const payload = {
        eventType: 'getToken',
        payload: {
            requestUrl,
            callbackUrl,
        }
    };

    return lambda.invoke({
        FunctionName: FUNCTION_NAME,
        Payload: JSON.stringify(payload)
    }).promise()
        .then(event => event.Payload)
        .then(payload => JSON.parse(payload));
}
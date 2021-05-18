const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

const FUNCTION_NAME = process.env.SPOTIFY_LAMBDA_FUNCTION_NAME;

exports.getCurrentlyPlaying = async ({ accessToken, refreshToken }) => {
    const payload = {
        eventType: 'getCurrentlyPlaying',
        payload: {
            accessToken,
            refreshToken,
        }
    };

    return lambda.invoke({
        FunctionName: FUNCTION_NAME,
        Payload: JSON.stringify(payload)
    }).promise()
        .then(event => event.Payload)
        .then(payload => JSON.parse(payload));
}
const { LambdaClient } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({});

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
const { Lambda } = require('@aws-sdk/client-lambda');
const { log } = require('../util');

const lambda = new Lambda({});

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
    })
    .then(event => Buffer.from(event.Payload).toString('utf-8'))
    .then(payload => JSON.parse(payload));
}
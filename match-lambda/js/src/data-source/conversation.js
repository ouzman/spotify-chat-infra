const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

const FUNCTION_NAME = process.env.CONVERSATION_LAMBDA_FUNCTION_NAME;

exports.createConversation = async ({ songId, userUris }) => {
    const payload = {
        eventType: 'CreateConversation',
        payload: {
            songId,
            userUris,
        }
    };

    return lambda.invoke({
        FunctionName: FUNCTION_NAME,
        Payload: JSON.stringify(payload)
    }).promise()
        .then(event => event.Payload)
        .then(payload => JSON.parse(payload));
}
const AWS = require('aws-sdk');

const { log } = require('./util');

const { AWS_REGION, AWS_ACCOUNT_ID, CLIENT_RESPONSE_QUEUE } = process.env;
const CLIENT_RESPONSE_QUEUE_URL = `https://sqs.${AWS_REGION}.amazonaws.com/${AWS_ACCOUNT_ID}/${CLIENT_RESPONSE_QUEUE}`

const sqs = new AWS.SQS();

const createConnectedMessage = ({ event }) => ({
    connectionId: event.requestContext.connectionId,
    type: 'CONNECTED',
    context: {}
});

const createEchoMessage = ({ event }) => ({
    connectionId: event.requestContext.connectionId,
    type: 'ECHO',
    context: {
        requestBody: JSON.parse(event.body),
    }
})

const routeHandlers = {
    '$connect': async ({ event }) => { 
        const message = createConnectedMessage({ event });

        const sqsResponse = await sendResponseToClient(message);

        log({ message, sqsResponse });
    },
    '$disconnect': async ({ event }) => { },
    '$default': async ({ event }) => {
        const message = createEchoMessage({ event });

        const sqsResponse = await sendResponseToClient(message);

        log({ message, sqsResponse });
    }
}

const sendResponseToClient = async ({ connectionId, type: messageType, context: messageContext }) => {
    return sqs.sendMessage({
        MessageBody: JSON.stringify({
            connectionId,
            messageType,
            messageContext,
        }),
        QueueUrl: CLIENT_RESPONSE_QUEUE_URL
    }).promise();
}

exports.handler = async (event, context) => {
    log({ event, context });

    const { routeKey } = event.requestContext;

    const routeHandler = routeHandlers[routeKey];

    if (!routeHandler) {
        throw Error(`Unknown route: ${routeKey}`);
    }

    await routeHandler({ event });

    return {};
};

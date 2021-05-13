const AWS = require('aws-sdk');

const { log } = require('./util');

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

        const managementApiClient = new AWS.ApiGatewayManagementApi({ 
            endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
        });

        const response = await managementApi.postToConnection({
            ConnectionId: message.connectionId,
            Data: JSON.stringify({ message }),
        }).promise();

        log({ message, response });

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

const AWS = require('aws-sdk');

const { log } = require('./util');

const { findBySpotifyUri, getByConnectionId, createConnection, deleteByConnectionId } = require('./data-source/connections');

const createEchoMessage = ({ event }) => ({
    connectionId: event.requestContext.connectionId,
    type: 'ECHO',
    context: {
        requestBody: JSON.parse(event.body),
    }
})

const routeHandlers = {
    '$connect': async ({ event }) => {
        const { connectionId, authorizer: { principalId: spotifyUri } } = event.requestContext;

        const connections = await findBySpotifyUri({ spotifyUri });

        connections.forEach(connection => {
            // TODO: close connections
            // TODO: dismiss active conversations
        });

        await createConnection({ connectionId, userUri });
     },
    '$disconnect': async ({ event }) => { 
        const { connectionId, authorizer: { principalId: userUri } } = event.requestContext;

        const connection = await getByConnectionId({ connectionId });

        // TODO: dismiss active conversation

        await deleteByConnectionId({ connectionId });
    },
    '$default': async ({ event }) => {
        const message = createEchoMessage({ event });

        const managementApi = new AWS.ApiGatewayManagementApi({ 
            endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
        });

        const response = await managementApi.postToConnection({
            ConnectionId: message.connectionId,
            Data: JSON.stringify({ message }),
        }).promise();

        log({ message, response });
    }
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

const AWS = require('aws-sdk');

const { log } = require('./util');

const { getBySpotifyUri, setConnectionId } = require('./data-source/users');

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

        const user = await getBySpotifyUri({ spotifyUri });

        if (!!user.ConnectionId) {
            // TODO: close connection
            // TODO: dismiss conversation
        }

        await setConnectionId({ user, connectionId });
     },
    '$disconnect': async ({ event }) => { 
        const { connectionId, authorizer: { principalId: spotifyUri } } = event.requestContext;

        const user = await getBySpotifyUri({ spotifyUri });

        if (user.ConnectionId === connectionId) {
            await setConnectionId({ user, connectionId: '' });
        }
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

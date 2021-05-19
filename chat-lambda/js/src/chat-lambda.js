const AWS = require('aws-sdk');

const { log } = require('./util');

const { findByUseryUri, getByConnectionId, createConnection, deleteByConnectionId } = require('./data-source/connections');

const managementApi = new AWS.ApiGatewayManagementApi({ endpoint: process.env.CHAT_API_ENDPOINT });

const createEchoMessage = ({ event }) => ({
    connectionId: event.requestContext.connectionId,
    type: 'ECHO',
    context: {
        requestBody: JSON.parse(event.body),
    }
})

const routeHandlers = {
    '$connect': async ({ event }) => {
        const { connectionId, authorizer: { principalId: userUri } } = event.requestContext;

        const connections = await findByUseryUri({ userUri });
        log({ message: 'Stale connections found', connections });
        
        for (const connection of connections) {
            try {
                await deleteByConnectionId({ connectionId: connection.ConnectionId });
                log({ message: 'Connection removed from database', connection });

                await managementApi.deleteConnection({ ConnectionId: message.connectionId }).promise();    
                log({ message: 'Connection closed on API GW', connection });
            } catch (error) {
                log({ error });
            }    
            // TODO: dismiss active conversations
        }

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

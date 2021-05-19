const AWS = require('aws-sdk');

const { log } = require('./util');

const { findByUseryUri, getByConnectionId, createConnection, deleteByConnectionId } = require('./data-source/connections');

const createEchoMessage = ({ event }) => ({
    connectionId: event.requestContext.connectionId,
    type: 'ECHO',
    context: {
        requestBody: JSON.parse(event.body),
    }
})

const actionHandlers = {
    '$connect': async ({ event }) => {
        const { connectionId, authorizer: { principalId: userUri } } = event.requestContext;

        const connections = await findByUseryUri({ userUri });

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

    const { action } = event.requestContext.body;

    const actionHandler = actionHandlers[action];

    if (!actionHandler) {
        throw Error(`Unknown action: ${action}`);
    }

    await actionHandler({ event });

    return {};
};

const aws = require('aws-sdk');

const { log } = require('./util');

log({ endpoint: process.env.CHAT_API_ENDPOINT.replace(/^wss/, "https") });

const managementApiClient = new aws.ApiGatewayManagementApi({ 
    endpoint: process.env.CHAT_API_ENDPOINT.replace(/^wss/, "https"),
});

exports.handler = async (event, context) => {
    log({ event, context });

    for (const record of event.Records) {
        const { connectionId, messageType, messageContext } = JSON.parse(record.body);

        const response = await managementApiClient.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ messageType, messageContext }),
        }).promise();

        log({ response });
    }


    return {
        statusCode: 200,
        body: "OK"
    }
};

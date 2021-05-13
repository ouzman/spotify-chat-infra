const aws = require('aws-sdk');

const { log } = require('./util');

const managementApiClient = new aws.ApiGatewayManagementApi({ 
    endpoint: process.env.CHAT_API_ENDPOINT,
});

exports.handler = async (event, context) => {
    log({ event, context });

    for (const record of event.Records) {
        const { connectionId, message: { body: messageBody } } = record.body;

        const response = await managementApiClient.postForConnection({
            ConnectionId: connectionId,
            body: JSON.stringify(messageBody),
        }).promise();

        log({ response });
    }


    return {
        statusCode: 200,
        body: "OK"
    }
};

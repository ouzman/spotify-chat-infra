const AWS = require('aws-sdk');

const { log } = require('./util');

const { AWS_REGION, AWS_ACCOUNT_ID, CLIENT_RESPONSE_QUEUE } = process.env;
const CLIENT_RESPONSE_QUEUE_URL = `https://sqs.${AWS_REGION}.amazonaws.com/${AWS_ACCOUNT_ID}/${CLIENT_RESPONSE_QUEUE}`

const sqs = new AWS.SQS();

const getSuccessRouteHandler = ({ bodyFunction } = {}) => {
    return ({ event }) => {
        return {
            body: bodyFunction && bodyFunction({ event }) || undefined,
        };
    }
}

const routeHandlers = {
    '$connect': getSuccessRouteHandler(),
    '$disconnect': getSuccessRouteHandler(),
    '$default': getSuccessRouteHandler({ bodyFunction: ({ event }) => ({ requestBody: event.body }) }),
}

const getResponse = ({ routeKey, event }) => {
    const handler = routeHandlers[routeKey];

    if (!!handler) {
        return handler({ event });
    } else {
        return {
            statusCode: 400,
            message: `Unknown route: ${routeKey}`
        }
    }
}

const sendResponseToClient = async ({ connectionId, message }) => {
    return sqs.sendMessage({
        MessageBody: JSON.stringify({
            connectionId,
            message
        }),
        QueueUrl: CLIENT_RESPONSE_QUEUE_URL
    }).promise();
}

exports.handler = async (event, context) => {
    log({ event, context });

    const { routeKey, connectionId } = event.requestContext;

    const response = getResponse({ routeKey, event });

    const sqsResponse = await sendResponseToClient({ connectionId, message: response });

    log({ event, context, response, sqsResponse });

    return {};
};

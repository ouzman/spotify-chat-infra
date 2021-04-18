const { log } = require('./util');
const { handler: apiGatewayRouteHandler } = require('./handlers/api-gateway-route');
const { handler: lambdaInvokeHandler } = require('./handlers/lambda-invoke');

function handlerFactory({ event }) {
    if (!!event.routeKey) {
        return apiGatewayRouteHandler({ event });
    } else if (!!event.eventType) {
        return invokeLambdaHandler({ event });
    }
}

exports.handler = async (event, context) => {
    log({ event, context });

    const handler = handlerFactory({ event });

    return handler({ event });
};

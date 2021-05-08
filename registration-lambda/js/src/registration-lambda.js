const { log } = require('./util');
const { handler: apiGatewayRouteHandler } = require('./handlers/api-gateway-route');
const { handler: lambdaInvokeHandler } = require('./handlers/lambda-invoke');

async function handlerFactory({ event }) {
    if (!!event.routeKey) {
        return apiGatewayRouteHandler({ event });
    } else if (!!event.eventType) {
        return lambdaInvokeHandler({ event });
    }
}

exports.handler = async (event, context) => {
    log({ event, context });

    const handler = await handlerFactory({ event });

    return handler({ event });
};

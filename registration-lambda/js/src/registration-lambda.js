const { log } = require('./util');
const { handler: apiGatewayRouteHandler } = require('./api-gateway-routes');

exports.handler = async (event, context) => {
    log({ event, context });

    const handler = await apiGatewayRouteHandler({ event });

    return handler({ event });
};

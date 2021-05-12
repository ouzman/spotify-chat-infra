const { log } = require('./util');

const getSuccessRouteHandler = ({ bodyFunction }) => {
    return ({ event }) => {
        return { 
            statusCode: 200,
            body: JSON.stringify({
                message: 'OK',
                body: bodyFunction && bodyFunction({ event }) || undefined,
            })
         };    

    }
}

const routeHandlers = {
    '$connect': getSuccessRouteHandler(),
    '$disconnect': getSuccessRouteHandler(),
    '$default': getSuccessRouteHandler({ bodyFunction: event => ({ requestBody: event.requestContext.body }) }),
}


exports.handler = async (event, context) => {
    log({ event, context });

    const { routeKey } = event.requestContext;

    const handler = routeHandlers[routeKey];

    if (!!handler) {
        return handler({ event });
    } else {
        return {
            statusCode: 400,
            message: `Unknown route: ${routeKey}`
        }
    }
};

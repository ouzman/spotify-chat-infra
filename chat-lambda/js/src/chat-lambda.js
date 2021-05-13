const { log } = require('./util');

const getSuccessRouteHandler = ({ bodyFunction } = {}) => {
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

exports.handler = async (event, context) => {
    log({ event, context });

    const { routeKey } = event.requestContext;

    const response = getResponse({ routeKey, event });

    log({ event, context, response});

    return response;
};

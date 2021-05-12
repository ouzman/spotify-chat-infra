const { log } = require('./util');

exports.handler = async (event, context) => {
    log({ event, context });

    if (event.requestContext.routeKey === '$disconnect' || event.requestContext.routeKey === '$connect') {
        return { 
            statusCode: 200,
            body: JSON.stringify({
                message: 'OK',
            })
         };    
    }

    if (event.routeKey === '$default') {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'OK',
                body: event.requestContext.body,
            })
        }
    }
};

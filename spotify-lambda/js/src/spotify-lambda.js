const { log } = require('./util');
const { handler: lambdaInvokeHandler } = require('./handlers/lambda-invoke');

async function handlerFactory({ event }) {
    if (!!event.eventType) {
        return lambdaInvokeHandler({ event });
    }
}

exports.handler = async (event, context) => {
    log({ event, context });

    const handler = await handlerFactory({ event });

    const response = await handler({ event });

    log({ response });

    return response;
};

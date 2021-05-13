const { log } = require('./util');

exports.handler = async (event, context) => {
    log({ event, context });

    return {
        statusCode: 200,
        body: "OK"
    }
};

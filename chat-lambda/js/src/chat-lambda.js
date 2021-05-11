const { log } = require('./util');

exports.handler = async (event, context) => {
    log({ event, context });

    return { status: 'OK' };
};

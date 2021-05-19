const uuid = require('uuid');

exports.generateId = () => Buffer.from(uuid.parse(uuid.v4())).toString('base64').slice(0, -2);

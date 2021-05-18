const AWS = require('aws-sdk');

const { log } = require('../util');

const dynamo = new AWS.DynamoDB.DocumentClient();

const { 
    CONNECTIONS_DB_TABLE_NAME: TABLE_NAME, 
    CONNECTIONS_DB_USER_URI_INDEX_NAME: USER_URI_INDEX_NAME 
} = process.env;

exports.findAll = async ({ }) => {
    log({ method: 'findAll', params: { } });

    return dynamo.scan({
        TableName: TABLE_NAME,
    }).promise()
        .then(res => res.Items);
}
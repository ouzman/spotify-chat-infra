const AWS = require('aws-sdk');

const { log } = require('../util');

const dynamo = new AWS.DynamoDB.DocumentClient();

const { 
    CONNECTIONS_DB_TABLE_NAME: TABLE_NAME, 
    CONNECTIONS_DB_USER_URI_INDEX_NAME: USER_URI_INDEX_NAME 
} = process.env;

exports.findByUseryUri = async ({ userUri }) => {
    log({ method: 'findByUseryUri', params: { userUri } });

    return dynamo.query({
        TableName: TABLE_NAME,
        IndexName: USER_URI_INDEX_NAME,
        KeyConditionExpression: 'UserUri = :uri',
        ExpressionAttributeValues: { ':uri': userUri }
    }).promise()
        .then(debug => { console.log({ debug, attr: debug.Items }); return debug; })
        .then(res => res.Items);
}
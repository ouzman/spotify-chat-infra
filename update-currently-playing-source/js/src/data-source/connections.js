const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { log } = require('../util');

const dynamodb = new DynamoDB({});

const { 
    CONNECTIONS_DB_TABLE_NAME: TABLE_NAME, 
    CONNECTIONS_DB_USER_URI_INDEX_NAME: USER_URI_INDEX_NAME 
} = process.env;

exports.findAll = async ({ }) => {
    log({ method: 'findAll', params: { } });

    return dynamodb.scan({
        TableName: TABLE_NAME,
    })
    .then(res => res.Items);
}
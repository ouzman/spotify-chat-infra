const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.API_KEYS_DB_TABLE_NAME

exports.getByApiKey = async ({ apiKey }) => {
    return dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            'ApiKey': apiKey
        }
    }).promise();
}
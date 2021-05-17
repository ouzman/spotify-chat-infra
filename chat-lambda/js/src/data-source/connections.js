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
        .then(res => res.Items);
}

exports.createConnection = async ({ connectionId, userUri }) => {
    log({ method: 'createConnection', params: { connectionId, userUri } });

    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'ConnectionId': connectionId },
        UpdateExpression: 'SET #USER=:userUri',
        ExpressionAttributeNames: {
            '#USER': 'UserUri',
        },
        ExpressionAttributeValues: {
            ':userUri': userUri,
        },
        ReturnValues: 'ALL_NEW'
    }).promise()
        .then(res => res.Attributes);
}

exports.getByConnectionId = async ({ connectionId }) => {
    log({ method: 'getByConnectionId', params: { connectionId } });

    return dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            'ConnectionId': connectionId
        }
    }).promise()
        .then(res => res.Item);
}

exports.deleteByConnectionId = async ({ connectionId }) => {
    log({ method: 'deleteByConnectionId', params: { connectionId } });

    return dynamo.delete({
        TableName: TABLE_NAME,
        Key: {
            'ConnectionId': connectionId
        }
    }).promise();
}
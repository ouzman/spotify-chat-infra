const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

const { TABLE_NAME, USER_URI_INDEX_NAME } = process.env;

exports.findByUseryUri = async ({ userUri }) => {
    return dynamo.get({
        TableName: TABLE_NAME,
        IndexName: USER_URI_INDEX_NAME,
        KeyConditionExpression: 'UserUri = :uri',
        ExpressionAttributeValues: { ':uri': userUri }
    }).promise()
        .then(res => res.Items);
}

exports.createConnection = async ({ connectionId, userUri }) => {
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
    return dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            'ConnectionId': connectionId
        }
    }).promise()
        .then(res => res.Item);
}

exports.deleteByConnectionId = async ({ connectionId }) => {
    return dynamo.delete({
        TableName: TABLE_NAME,
        Key: {
            'ConnectionId': connectionId
        }
    }).promise();
}
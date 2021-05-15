const AWS = require('aws-sdk');

const crypto = require("crypto");

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.API_KEYS_DB_TABLE_NAME
const USER_URI_INDEX_NAME = process.env.API_KEYS_DB_USER_URI_INDEX

exports.createApiKey = async ({ user }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'ApiKey': generateApiKey({ user }) },
        UpdateExpression: 'SET #USERURI=:spotifyUri',
        ExpressionAttributeNames: {
            '#USERURI': 'UserUri'
        },
        ExpressionAttributeValues: {
            ':spotifyUri': user.SpotifyUri
        },
        ReturnValues: 'ALL_NEW'
    }).promise()
        .then(res => res.Attributes);
}

exports.queryByUserUri = async ({ userUri }) => {
    return dynamo.query({
        TableName: TABLE_NAME,
        IndexName: USER_URI_INDEX_NAME,
        KeyConditionExpression: 'UserUri = :uri',
        ExpressionAttributeValues: { ':uri': userUri }
    }).promise()
        .then(res => res.Items);
}

exports.deleteByApiKey = async ({ apiKey }) => {
    return dynamo.delete({
        TableName: TABLE_NAME,
        Key: {
            'ApiKey': apiKey
        }
    }).promise();
}

function generateApiKey({ user }) {
    return crypto.createHash('sha256')
        .update(`spotifychat-salt:${user.AccessToken}:${user.RefreshToken}`)
        .digest('hex');
}
const AWS = require('aws-sdk');

const crypto = require("crypto");

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.API_KEYS_DB_TABLE_NAME

exports.createApiKey = async ({ user }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'ApiKey': generateApiKey({ user }) },
        UpdateExpression: 'SET #USER=:spotifyUri',
        ExpressionAttributeNames: {
            '#USER': 'User'
        },
        ExpressionAttributeValues: {
            ':spotifyUri': user.SpotifyUri
        },
        ReturnValues: 'ALL_NEW'
    }).promise();
}

exports.getByApiKey = async ({ apiKey }) => {
    return dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            'ApiKey': apiKey
        }
    }).promise();
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
    return scrypto.createHash('sha256')
        .update(`spotifychat-salt:${user.AccessToken}:${user.RefreshToken}`)
        .digest('hex');
}
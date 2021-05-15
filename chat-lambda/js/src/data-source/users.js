const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.USERS_DB_TABLE_NAME

exports.setConnectionId = async ({ user, connectionId }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'SpotifyUri': user.SpotifyUri },
        UpdateExpression: 'SET #CONN=:connectionId',
        ExpressionAttributeNames: {
            '#CONN': 'ConnectionId',
        },
        ExpressionAttributeValues: {
            ':connectionId': connectionId,
        },
        ReturnValues: 'ALL_NEW',
    }).promise()
        .then(res => res.Attributes);
}

exports.getBySpotifyUri = async ({ spotifyUri }) => {
    return dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            'SpotifyUri': spotifyUri,
        }
    }).promise()
        .then(res => res.Item);
}
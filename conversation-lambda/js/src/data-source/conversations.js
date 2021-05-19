const AWS = require('aws-sdk');

const { generateId } = require('../generators');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.CONVERSATIONS_DB_TABLE_NAME


exports.createConversation = async ({ song, users }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'Id': generateId() },
        UpdateExpression: 'SET #SONG=:song, #USERS=:users, #DATE=:date',
        ExpressionAttributeNames: {
            '#SONG': 'Song',
            '#USERS': 'Users',
            '#DATE': 'Date'
        },
        ExpressionAttributeValues: {
            ':song': song,
            ':users': users,
            ':date': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW'
    }).promise()
        .then(res => res.Attributes);
}

exports.getBySpotifyUri = async ({ spotifyUri }) => {
    return dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            'SpotifyUri': spotifyUri
        }
    }).promise()
        .then(res => res.Item);
}
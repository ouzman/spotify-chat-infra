const AWS = require('aws-sdk');
const uuid = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.CONVERSATIONS_DB_TABLE_NAME

const generateId = () => Buffer.from(uuid.parse(uuid.v4())).toString('base64').slice(0, -2);

exports.createConversation = async ({ song, users }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'Id': generateId() },
        UpdateExpression: '#SONG=:song, #USERS=:users',
        ExpressionAttributeNames: {
            '#SONG': 'Song',
            '#USERS': 'Users'
        },
        ExpressionAttributeValues: {
            ':song': song,
            ':users': users,
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
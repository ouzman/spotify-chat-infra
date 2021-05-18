const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.USERS_DB_TABLE_NAME

exports.updateUserNowPlayingBySpotifyUri = async ({ spotifyUri, nowPlaying }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'SpotifyUri': spotifyUri },
        UpdateExpression: !!nowPlaying ? 'SET #PLAYING=:nowPlaying' : 'REMOVE #PLAYING',
        ExpressionAttributeNames: {
            '#PLAYING': 'NowPlaying',
        },
        ExpressionAttributeValues: {
            ':nowPlaying': nowPlaying,
        },
        ReturnValues: 'ALL_NEW'
    }).promise()
        .then(res => res.Attributes);
}

exports.updateUserTokensBySpotifyUri = async ({ spotifyUri, accessToken, refreshToken }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'SpotifyUri': spotifyUri },
        UpdateExpression: 'SET #ACCT=:accessToken, #REFT=:refreshToken',
        ExpressionAttributeNames: {
            '#ACCT': 'AccessToken',
            '#REFT': 'RefreshToken'
        },
        ExpressionAttributeValues: {
            ':accessToken': accessToken,
            ':refreshToken': refreshToken,
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
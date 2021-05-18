const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { log } = require('../util');

const dynamodb = new DynamoDB({});

const TABLE_NAME = process.env.USERS_DB_TABLE_NAME

exports.updateUserNowPlayingBySpotifyUri = async ({ spotifyUri, nowPlaying }) => {
    // log({ method: 'updateUserNowPlayingBySpotifyUri', params: { spotifyUri, nowPlaying } });

    return dynamodb.updateItem({
        TableName: TABLE_NAME,
        Key: { 'SpotifyUri': spotifyUri },
        UpdateExpression: !!nowPlaying ? 'SET #PLAYING=:nowPlaying' : 'REMOVE #PLAYING',
        ExpressionAttributeNames: {
            '#PLAYING': 'NowPlaying',
        },
        ExpressionAttributeValues: {
            ':nowPlaying': { 'S': nowPlaying },
        },
        ReturnValues: 'ALL_NEW'
    })
    .then(res => res.Attributes);
}

exports.updateUserTokensBySpotifyUri = async ({ spotifyUri, accessToken, refreshToken }) => {
    // log({ method: 'updateUserTokensBySpotifyUri', params: { spotifyUri, accessToken, refreshToken } });

    return dynamodb.updateItem({
        TableName: TABLE_NAME,
        Key: { 'SpotifyUri': spotifyUri },
        UpdateExpression: 'SET #ACCT=:accessToken, #REFT=:refreshToken',
        ExpressionAttributeNames: {
            '#ACCT': 'AccessToken',
            '#REFT': 'RefreshToken'
        },
        ExpressionAttributeValues: {
            ':accessToken': { 'S': accessToken },
            ':refreshToken': { 'S': refreshToken },
        },
        ReturnValues: 'ALL_NEW'
    }).then(res => res.Attributes);
}

exports.getBySpotifyUri = async ({ spotifyUri }) => {
    // log({ method: 'getBySpotifyUri', params: { spotifyUri } });

    return dynamodb.getItem({ TableName: TABLE_NAME, Key: { 'SpotifyUri': { 'S': spotifyUri } } })
    .then(res => res.Item);
}
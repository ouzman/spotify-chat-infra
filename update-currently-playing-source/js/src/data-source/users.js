const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { log } = require('../util');

const dynamodb = new DynamoDB({});

const TABLE_NAME = process.env.USERS_DB_TABLE_NAME

exports.updateUserNowPlayingBySpotifyUri = async ({ spotifyUri, nowPlaying }) => {
    log({ method: 'updateUserNowPlayingBySpotifyUri', params: { spotifyUri, nowPlaying } });

    if (!nowPlaying) {
        return dynamodb.updateItem({
            TableName: TABLE_NAME,
            Key: { 'SpotifyUri': { 'S': spotifyUri } },
            UpdateExpression: 'REMOVE #PLAYING',
            ExpressionAttributeNames: { '#PLAYING': 'NowPlaying' },
        });    
    } else {
        return dynamodb.updateItem({
            TableName: TABLE_NAME,
            Key: { 'SpotifyUri': { 'S': spotifyUri } },
            UpdateExpression: 'SET #PLAYING=:nowPlaying',
            ExpressionAttributeNames: { '#PLAYING': 'NowPlaying' },
            ExpressionAttributeValues: {
                ':nowPlaying': {
                    'M': {
                        id: { 'S': nowPlaying.id },
                        name: { 'S': nowPlaying.name },
                        artist: { 'S': nowPlaying.artist },
                        image: { 'S': nowPlaying.image },    
                    }
                }
            },
        });    
    }
}

exports.updateUserTokensBySpotifyUri = async ({ spotifyUri, accessToken, refreshToken }) => {
    log({ method: 'updateUserTokensBySpotifyUri', params: { spotifyUri, accessToken, refreshToken } });

    return dynamodb.updateItem({
        TableName: TABLE_NAME,
        Key: { 
            'SpotifyUri': { 'S': spotifyUri } 
        },
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
    log({ method: 'getBySpotifyUri', params: { spotifyUri } });

    return dynamodb.getItem({ TableName: TABLE_NAME, Key: { 'SpotifyUri': { 'S': spotifyUri } } })
    .then(res => res.Item);
}
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.USERS_DB_TABLE_NAME

exports.createUser = async ({ tokenInfo, spotifyUser }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'SpotifyUri': spotifyUser['uri'] },
        UpdateExpression: 'SET #NAME=:displayName, #IMAGE=:imageUrl, #ACCT=:accessToken, #REFT=:refreshToken',
        ExpressionAttributeNames: {
            '#NAME': 'DisplayName',
            '#IMAGE': 'ImageUrl',
            '#ACCT': 'AccessToken',
            '#REFT': 'RefreshToken'
        },
        ExpressionAttributeValues: {
            ':displayName': spotifyUser['display_name'],
            ':imageUrl': spotifyUser['images'] && spotifyUser['images'][0] && spotifyUser['images'][0].url || '',
            ':accessToken': tokenInfo['access_token'],
            ':refreshToken': tokenInfo['refresh_token'],
        },
    }).promise();
}

exports.getBySpotifyUri = async ({ spotifyUri }) => {
    return dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            'SpotifyUri': spotifyUri
        }
    }).promise();
}
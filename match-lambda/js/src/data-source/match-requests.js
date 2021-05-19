const AWS = require('aws-sdk');
const { DateTime } = require('luxon');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.MATCH_REQUESTS_DB_TABLE_NAME

exports.upsertMatchRequest = async ({ songId, requestDate, userUri }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'SongId': songId },
        UpdateExpression: 'SET #REQT=:requestDate, #USER=:userUri',
        ExpressionAttributeNames: {
            '#REQT': 'RequestDate',
            '#USER': 'UserUri',
        },
        ExpressionAttributeValues: {
            ':requestDate': requestDate,
            ':userUri': userUri,
        },
        ReturnValues: 'ALL_NEW'
    }).promise()
        .then(res => res.Attributes);
}

exports.popMatchRequest = async ({ songId, prohibitedUserUri, requestDateRangeFromNowInSeconds }) => {
    const now = DateTime.now().setZone('UTC');
    const minValidDate = now.minus({ seconds: requestDateRangeFromNowInSeconds });

    return dynamo.delete({
        TableName: TABLE_NAME,
        Key: {
            'SongId': songId,
        },
        ConditionExpression: 'UserUri <> :prohibitedUserUri AND RequestDate BETWEEN :minValidDate AND :now',
        ExpressionAttributeNames: {
            '#REQT': 'RequestDate',
            '#USER': 'UserUri',
        },
        ExpressionAttributeValues: {
            ':prohibitedUserUri': prohibitedUserUri,
            ':minValidDate': minValidDate.toISO(),
            ':now': now.toISO(),
        },
        ReturnValues: 'ALL_OLD'
    }).promise()
        .then(res => res.Attributes)
        .catch(e => {
            if (e.code === 'ConditionalCheckFailedException') {
                return { };
            } else {
                throw e;
            }
        });
}
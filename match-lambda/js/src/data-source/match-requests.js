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
    var now = DateTime.now().toUTC({});
    var minValidDate = now.minus({ seconds: requestDateRangeFromNowInSeconds });

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
            ':minValidDate': minValidDate.toISO({ includeOffset: true }),
            ':now': now.toISO({ includeOffset: true }),
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
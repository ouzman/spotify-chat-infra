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
    const now = DateTime.now();
    const minValidDate = now.minus({ seconds: requestDateRangeFromNowInSeconds });

    return dynamo.delete({
        TableName: TABLE_NAME,
        Key: {
            'SongId': songId,
        },
        ConditionExpression: '#USER <> :prohibitedUserUri AND #REQT > :minValidDate AND #REQT < :now',
        ExpressionAttributeNames: {
            '#REQT': 'RequestDate',
            '#USER': 'UserUri',
        },
        ExpressionAttributeValues: {
            ':prohibitedUserUri': prohibitedUserUri,
            ':minValidDate': minValidDate.toISO({ includeOffset: false }),
            ':now': now.toISO({ includeOffset: false }),
        },
        ReturnValues: 'ALL_OLD'
    }).promise()
        .then(res => res.Attributes);;
}
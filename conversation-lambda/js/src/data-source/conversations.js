const AWS = require('aws-sdk');

const { generateId } = require('../generators');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.CONVERSATIONS_DB_TABLE_NAME


exports.createConversation = async ({ song, userUris }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'Id': generateId() },
        UpdateExpression: 'SET #SONG=:song, #UURIS=:userUris, #DATE=:date, #MSGS=:messages',
        ExpressionAttributeNames: {
            '#SONG': 'Song',
            '#UURIS': 'UserUris',
            '#DATE': 'Date',
            '#MSGS': 'Messages',
        },
        ExpressionAttributeValues: {
            ':song': song,
            ':userUris': userUris,
            ':date': new Date().toISOString(),
            ':messages': [],
        },
        ReturnValues: 'ALL_NEW'
    }).promise()
        .then(res => res.Attributes);
}

exports.getById = async ({ conversationId }) => {
    return dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            'Id': conversationId
        }
    }).promise()
        .then(res => res.Item);
}

exports.addNewMessage = async ({ conversationId, actorId, messageId, messageContent }) => {
    const message = {
        id: messageId,
        actorId,
        content: messageContent,
        date: new Date().toISOString(),
    };

    await dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'Id': conversationId },
        UpdateExpression: 'SET #MSGS=list_append(if_not_exists(#MSGS, :empty_list), :newMessages)',
        ExpressionAttributeNames: {
            '#MSGS': 'Messages',
        },
        ExpressionAttributeValues: {
            ':newMessages': [message],
            ':empty_list': [],
        },
        ReturnValues: 'ALL_NEW'
    }).promise();
    
    return message;
}

exports.findByUseryUri = async ({ userUri }) => {
    return dynamo.scan({
        TableName: TABLE_NAME,
        FilterExpression : 'contains(#UURIS, :userUri)',
        ExpressionAttributeNames: {
            '#UURIS': 'UserUris',
        },
        ExpressionAttributeValues: {
            ':userUri': userUri,
        },
    }).promise()
        .then(res => res.Items);
}

 
const AWS = require('aws-sdk');

const { generateId } = require('../generators');

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.CONVERSATIONS_DB_TABLE_NAME


exports.createConversation = async ({ song, users }) => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: { 'Id': generateId() },
        UpdateExpression: 'SET #SONG=:song, #USERS=:users, #DATE=:date, #MSGS=:messages',
        ExpressionAttributeNames: {
            '#SONG': 'Song',
            '#USERS': 'Users',
            '#DATE': 'Date',
            '#MSGS': 'Messages',
        },
        ExpressionAttributeValues: {
            ':song': song,
            ':users': users,
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
        Key: { 'Id': generateId() },
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
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

const FUNCTION_NAME = process.env.API_KEYS_DB_TABLE_NAME

exports.getUserInfo = async ({ accessToken }) => {
    const payload = {
        eventType: 'getUserInfo',
        payload: {
            accessToken
        }
    };

    return lambda.invoke({
        FunctionName: FUNCTION_NAME, 
        Payload: JSON.stringify(payload), 
        Qualifier: "1"
    }).promise();
}



    
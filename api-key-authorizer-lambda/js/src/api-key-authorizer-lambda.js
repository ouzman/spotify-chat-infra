const { log } = require('./util');

const { getByApiKey } = require('./data-source/api-keys');

const allow = ({ event, spotifyUri, apiKey }) => {
    const { methodArn } = event;

    return {
        principalId: spotifyUri,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: methodArn,
                }
            ]
        },
        context: { 
            apiKey,
        }
    }
}

const deny = () => {
    throw Error('Unauthorized');
}

exports.handler = async (event, context) => {
    log({ event, context });

    try {
        const apiKey = event.headers['X-SC-ApiKey'];

        const apiKeyDocument = await getByApiKey({ apiKey }); 
    
        const { SpotifyUri: spotifyUri } = apiKeyDocument;

        const response = allow({ event, apiKey, spotifyUri });

        log({ event, status: 'SUCCESS', response });

        return response;
    } catch (error) {
        log({ event, status: 'FAIL', error })
        
        deny();
    }
};

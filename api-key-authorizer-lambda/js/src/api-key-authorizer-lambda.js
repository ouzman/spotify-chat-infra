const { log } = require('./util');

const { getByApiKey } = require('./data-source/api-keys');

const HEADER_NAME = 'X-SC-ApiKey';

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
        const apiKey = event.headers[HEADER_NAME];

        if (!apiKey) {
            throw Error(`Request doesn't have ${HEADER_NAME} header`);
        }

        const { Item: apiKeyDocument } = await getByApiKey({ apiKey }); 
        
        if (!apiKeyDocument) {
            throw Error(`Unknown API Key: ${apiKey}`);
        }

        log({ apiKeyDocument });
    
        const { SpotifyUri: spotifyUri } = apiKeyDocument;

        const response = allow({ event, apiKey, spotifyUri });

        log({ event, status: 'SUCCESS', response });

        return response;
    } catch (error) {
        log({ event, status: 'FAIL', error })
        
        deny();
    }
};

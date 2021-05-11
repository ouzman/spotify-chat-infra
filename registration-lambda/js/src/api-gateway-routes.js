const { log } = require('./util');

const { getAuthorizeUrl, getToken } = require('./spotify-authorizer');
const { getUserInfo } = require('./data-source/spotify')
const { createUser } = require('./data-source/users');
const { createApiKey } = require('./data-source/apiKeys');

const generateCallbackUrl = ({ event }) => `https://${event.requestContext.domainName}/callback`
const getRequestUrl = ({ event }) => `https://${event.requestContext.domainName}${event.rawPath}?${event.rawQueryString}`

const routeHandlers = {
    'GET /login': async ({ event }) => {
        return {
            statusCode: 302,
            headers: {
                'location': await getAuthorizeUrl({ callbackUrl: generateCallbackUrl({ event }) }),
            },
        }
    },
    'GET /callback': async ({ event }) => {
        const { data: tokenInfo } = await getToken({
            requestUrl: getRequestUrl({ event }),
            callbackUrl: generateCallbackUrl({ event }),
        });

        log({ tokenInfo });

        return spotifyAuthSuccess({ event, tokenInfo });
    }
}

async function spotifyAuthSuccess({ event, tokenInfo }) {
    const spotifyUserResponse = await getUserInfo({ accessToken: tokenInfo['access_token'] });

    log({ spotifyUserResponse });

    if (spotifyUserResponse.status !== 0) {
        return businessError({ event, errorMessage: spotifyUserResponse.errorMessage })
    }

    const { spotifyUser } = spotifyUserResponse.context;

    const user = await createUser({ tokenInfo, spotifyUser });

    log({ user });

    const { ApiKey: apiKey } = await createApiKey({ user });

    log({ apiKey });

    return apiKeyResponse({ apiKey });
}

function apiKeyResponse({ apiKey }) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'done',
            apiKey
        }),
        headers: {
            'content-type': 'application/json'
        }
    };
}

function businessError({ event, errorMessage }) {
    return {
        status: 400,
        body: JSON.stringify({
            message: errorMessage
        }),
        headers: {
            'content-type': 'application/json'
        }
    }
}

function unknown({ event }) {
    return {
        status: 404,
        body: JSON.stringify({
            message: 'Not found',
        }),
        headers: {
            'content-type': 'application/json'
        }
    }
}

exports.handler = async ({ event }) => {
    const { routeKey } = event;

    return routeHandlers[routeKey] || unknown;
};
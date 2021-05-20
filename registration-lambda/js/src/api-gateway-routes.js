const { log } = require('./util');

const { getUserInfo, getAuthorizeUrl, getToken } = require('./data-source/spotify')
const { upsertUser, getBySpotifyUri } = require('./data-source/users');
const { createApiKey, queryByUserUri, deleteByApiKey } = require('./data-source/apiKeys');

const generateCallbackUrl = ({ event }) => `https://${event.requestContext.domainName}/callback`
const getRequestUrl = ({ event }) => `https://${event.requestContext.domainName}${event.rawPath}?${event.rawQueryString}`

const routeHandlers = {
    'GET /login': async ({ event }) => {
        const { context: { url } } = await getAuthorizeUrl({ callbackUrl: generateCallbackUrl({ event }) });

        return {
            statusCode: 302,
            headers: {
                'location': url,
            },
        }
    },
    'GET /callback': async ({ event }) => {
        const { context: { tokenData: tokenInfo } } = await getToken({
            requestUrl: getRequestUrl({ event }),
            callbackUrl: generateCallbackUrl({ event }),
        });

        log({ tokenInfo });

        return spotifyAuthSuccess({ event, tokenInfo });
    },
    'POST /logout': async ({ event }) => {
        const apiKey = event.headers['x-sc-apikey'];

        if (!apiKey) {
            return logoutFailedResponse();
        }
        
        const deletedKey = await deleteByApiKey({ apiKey });

        if (!!deletedKey) {
            return logoutSuccessResponse();
        } else {
            return logoutFailedResponse();
        }
    },
}

async function spotifyAuthSuccess({ event, tokenInfo }) {
    const spotifyUserResponse = await getUserInfo({ accessToken: tokenInfo['access_token'], refreshToken: tokenInfo['refresh_token'] });

    log({ spotifyUserResponse });

    if (spotifyUserResponse.status !== 0) {
        return businessError({ event, errorMessage: spotifyUserResponse.errorMessage })
    }

    const { spotifyUser, updatedTokenInfo } = spotifyUserResponse.context;
    
    const upToDateTokenInfo = updatedTokenInfo || tokenInfo;
    
    const user = await upsertUser({ tokenInfo: upToDateTokenInfo, spotifyUser });

    log({ user });
    
    const apiKeyUserUriList = await queryByUserUri({ userUri: user.SpotifyUri });
    
    await apiKeyUserUriList
        .map(({ ApiKey }) => ApiKey)
        .reduce((acc, apiKey) => acc.then(() => deleteByApiKey({ apiKey })), Promise.resolve());

    const { ApiKey: apiKey } = await createApiKey({ user });

    log({ apiKey });

    return apiKeyResponse({ apiKey, userId: user.SpotifyUri });
}

function logoutSuccessResponse() {
    return {
        statusCode: 200,
    };
}

function logoutFailedResponse() {
    return {
        statusCode: 401,
    };
}

function apiKeyResponse({ apiKey, userId }) {
    return {
        statusCode: 302,
        headers: {
            'content-type': 'application/json',
            'location': `spotify-chat://auth?apikey=${apiKey}&userId=${userId}`,
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
const fetch = require('node-fetch');
const Request = require('node-fetch').Request;
const SpotifyAuthorizer = require('../authorizer');

const { log } = require('../util');

const SPOTIFY_BASE_URI = 'https://api.spotify.com';

const eventHandlers = {
    'getToken': async ({ event }) => {
        const { callbackUrl } = event.payload;

        const url = await getAuthorizeUrl({ callbackUrl });

        return {
            status: 0,
            context: {
                url,
            }
        }
    },
    'getAuthorizeUrl': async ({ event }) => {
        const { requestUrl, callbackUrl } = event.payload;
        
        const tokenResponse = await getToken({ requestUrl, callbackUrl });

        return {
            status: 0,
            context: {
                tokenDate: tokenResponse.data,
            }
        }
    },
    'getUserInfo': async ({ event }) => {
        const { accessToken } = event.payload;

        const request = new Request(`${SPOTIFY_BASE_URI}/v1/me`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${accessToken}`,
            }
        });

        let response;
        let updatedTokenData;
        try {
            ({ response, updatedTokenData } = await fetchWithRefreshTokenRetry({ request, accessToken, refreshToken }));
        } catch (error) {
            return networkError({ event, error });
        }

        const responseBody = await response.json();

        log({ responseBody });

        if (response.ok === false) {
            return errorResponse({ event, request, response: responseBody })
        }

        const spotifyUser = {
            uri: responseBody['uri'],
            displayName: responseBody['display_name'],
            image: responseBody['images'] && responseBody['images'][0] && responseBody['images'][0]['url'] || null,
        };

        return {
            status: 0,
            context: {
                spotifyUser,
                updatedTokenData,
            }
        }
    },  
    'getCurrentlyPlaying': async ({ event }) => {
        const { accessToken, refreshToken } = event.payload;

        const request = new Request(`${SPOTIFY_BASE_URI}/v1/me/player`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${accessToken}`,
            }
        });

        let response;
        let updatedTokenData;
        try {
            ({ response, updatedTokenData } = await fetchWithRefreshTokenRetry({ request, accessToken, refreshToken }));
        } catch (error) {
            return networkError({ event, error });
        }

        const responseBody = await response.json();

        log({ responseBody });

        if (response.ok === false) {
            return errorResponse({ event, request, response: responseBody })
        }

        return {
            status: 0,
            context: {
                currentlyPlaying: responseBody,
                updatedTokenData,
            }
        }
    },  
}

async function fetchWithRefreshTokenRetry ({ request, accessToken, refreshToken }) {
    const response = await fetch(request);

    if (response.status === 401 && response.headers.get('www-authenticate').includes('error_description="The access token expired"')) {
        const { data: updatedTokenData } = await SpotifyAuthorizer.refreshToken({ accessToken, refreshToken });

        const newRequest = {
            ...request,
            headers: {
                ...request.headers,
                authorization: `Bearer ${updatedTokenData['access_token']}`,
            }
        }

        const newResponse = await fetch(newRequest);

        return { response: newResponse, updatedTokenData };
    }

    return { response, updatedTokenData: null };
}

function errorResponse({ event, request, response }) {
    return {
        status: response.error.status,
        errorMessage: response.error.message,
        context: {
            request,
            response
        }
    }
}

function networkError({ event, error }) {
    return {
        status: 2,
        errorMessage: 'Network error occurred',
        context: {
            error
        }
    }
}

function unknownError({ event }) {
    return {
        status: 1,
        errorMessage: 'Unknown event type'
    }
}

exports.handler = async ({ event }) => {
    const { eventType } = event;

    return eventHandlers[eventType] || unknownError;
}
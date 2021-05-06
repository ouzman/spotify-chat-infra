const fetch = require('node-fetch');
const Request = require('node-fetch').Request;

const { log } = require('../util');

const SPOTIFY_BASE_URI = 'https://api.spotify.com';

const eventHandlers = {
    'getUserInfo': async ({ event }) => {
        const { accessToken } = event.payload;

        const request = new Request(`${SPOTIFY_BASE_URI}/v1/me`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${accessToken}`,
            }
        });

        let response;
        try {
            response = await fetch(request);    
        } catch (error) {
            return networkError({ event, error });
        }

        const responseBody = await response.json();

        log({ responseBody });

        if (response.ok === false) {
            return errorResponse({ event, request, response: responseBody })
        }

        const eventPayload = {
            uri: responseBody['uri'],
            displayName: responseBody['display_name'],
            image: responseBody['images'] && responseBody['images'][0] && responseBody['images'][0]['url'] || null,
        };

        return {
            status: 0,
            payload: eventPayload,
        }
    },  
}

async function errorResponse({ event, request, response }) {
    const jsonResponse = await response.json()
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
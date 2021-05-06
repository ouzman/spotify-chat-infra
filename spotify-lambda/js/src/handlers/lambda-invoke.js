const fetch = require('node-fetch');
var fetchAbsolute = require('fetch-absolute');

const { log } = require('../util');

const spotifyApi = fetchAbsolute(fetch)('https://api.spotify.com');

const eventHandlers = {
    'getUserInfo': async ({ event }) => {
        const { accessToken } = event.payload;

        const response = await spotifyApi('/v1/me', {
            method: 'GET',
            headers: {
                authorization: `Bearer ${accessToken}`,
            }
        });

        const responseBody = await response.json();

        log({ responseBody });

        return {
            status: 0,
            payload: {
                responseBody,
            },
        }
    },  
}


function unknown({ event }) {
    return {
        status: 1,
        body: "Unknown event type"
    }
}

exports.handler = async ({ event }) => {
    const { eventType } = event;

    return eventHandlers[eventType] || unknown;
}
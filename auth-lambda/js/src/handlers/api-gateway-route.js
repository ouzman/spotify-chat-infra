const { log } = require('../util');

const ClientOAuth2 = require('client-oauth2')

const spotifyAuth = new ClientOAuth2({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  accessTokenUri: 'https://accounts.spotify.com/api/token',
  authorizationUri: 'https://accounts.spotify.com/authorize',
  scopes: ['user-read-email', 'user-read-private'],
})

const routeHandlers = {
    'GET /login': ({ event }) => {
        return {
            statusCode: 302,
            headers: {
                'location': spotifyAuth.code.getUri({
                    redirectUri: `https://${event.requestContext.domainName}/callback`
                }),
            },
        }
    },
    'GET /callback': ({ event }) => {
        const { rawQueryString } = event;

        return spotifyAuth.code.getToken({
            pathname: '/callback',
            search: `?${rawQueryString}`, 
        })
        .then(user => {
            log({ user });
            return user;
        })
        .then(user => {
            return {
                statusCode: 200,
                body: 'done',
                headers: {
                    'content-type': 'text/plain'
                }
            }    
        });
    }
}

function unknown({ event }) {
    return {
        status: 404,
        body: "Not found"
    }
}

exports.handler = async ({ event }) => {
    const { routeKey } = event;

    return routeHandlers[routeKey] || unknown;
};
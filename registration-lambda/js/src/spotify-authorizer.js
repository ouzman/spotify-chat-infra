const ClientOAuth2 = require('client-oauth2')

const spotifyAuth = new ClientOAuth2({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  accessTokenUri: 'https://accounts.spotify.com/api/token',
  authorizationUri: 'https://accounts.spotify.com/authorize',
  scopes: ['user-read-email', 'user-read-private'],
});

exports.getAuthorizeUrl = async ({ callbackUrl }) => spotifyAuth.code.getUri({ redirectUri: callbackUrl });

exports.getToken = async ({ requestUrl, callbackUrl }) => spotifyAuth.code.getToken(requestUrl, { redirectUri: callbackUrl });
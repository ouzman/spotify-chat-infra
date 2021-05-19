const fetch = require('node-fetch');
const { promisify } = require('util');
const { log } = require('./util');

const UsersDataSource = require('./data-source/users');
const ConnectionsDataSource = require('./data-source/connections');
const SpotifyDataSource = require('./data-source/spotify');

const delay = promisify(setTimeout);

let repeat = true;

const task = async () => {
    log('Task started');

    const connections = await ConnectionsDataSource.findAll({});

    for (const connection of connections) {
        log({ connection });

        const { UserUri: { S: userUri } } = connection;
        
        const user = await UsersDataSource.getBySpotifyUri({ spotifyUri: userUri });
        log({ user });

        if (!user) {
            log('User couldn\'t found, skipping...')
            return;
        }

        const { AccessToken: { S: accessToken }, RefreshToken: { S: refreshToken } } = user;

        const currentlyPlayingResponse = await SpotifyDataSource.getCurrentlyPlaying({ accessToken, refreshToken });
        log({ currentlyPlayingResponse });

        if (currentlyPlayingResponse.status !== 0) {
            log('Couldn\'t get currently playing, skipping...');
        }

        const { context: { currentlyPlaying, updatedTokenData } } = currentlyPlayingResponse;
        
        if (!!updatedTokenData) {
            log('Token information changed, updating...')
            await UsersDataSource.updateUserTokensBySpotifyUri({ spotifyUri: userUri, accessToken: updatedTokenData['access_token'], refreshToken: updatedTokenData['refresh_token'] });
        }

        const nowPlaying = currentlyPlaying?.item?.id && {
            id: currentlyPlaying.item.id, // required
            name: currentlyPlaying.item.name ?? 'Unknown Song',
            artist: currentlyPlaying.item.artists?.map(artist => artist.name)?.join(', ') ?? 'Unknown Artist',
            image: currentlyPlaying.item.album?.images?.[0]?.url ?? '',
        };
        
        const updatedUser = await UsersDataSource.updateUserNowPlayingBySpotifyUri({ spotifyUri: userUri, nowPlaying });
        log({ updatedUser });

        log('Task completed')
    }    
}

const loop = async () => {
    ['SIGHUP', 'SIGINT', 'SIGTERM']
        .forEach((signal) => {
        process.on(signal, () => {
                console.log(`process received a ${signal} signal`);

                repeat = false;
            });
        });

    while (repeat) {
        await task();
        await delay(process.env.INTERVAL || 5000);
    }
}

exports.loop = loop;
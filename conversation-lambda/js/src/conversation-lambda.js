const AWS = require('aws-sdk');

const { log } = require('./util');

const managementApi = new AWS.ApiGatewayManagementApi({ endpoint: process.env.CHAT_API_ENDPOINT });

const UsersDataSource = require('./data-source/users');
const SpotifyDataSource = require('./data-source/spotify');
const ConversatiosnDataSource = require('./data-source/conversations');
const ConnectionsDataSource = require('./data-source/connections');

const eventHandlers = {
    'CreateConversation': async ({ event }) => {
        const { songId, userUris } = event.payload;

        const users = await Promise.all(
            userUris
                .map(userUri => UsersDataSource.getBySpotifyUri({ spotifyUri: userUri }))
        );
        log({ users });

        const apiUser = users[0];

        const { AccessToken: accessToken, RefreshToken: refreshToken } = apiUser;

        const songResponse = await SpotifyDataSource.getSong({
            accessToken,
            refreshToken,
            songId,
        });
        log({ songResponse });

        if (songResponse.status !== 0) {
            log({ message: 'Couldn\'t get song details', songId });

            return eventErrorResponse({
                status: songResponse.status,
                errorMessage: 'Couldn\'t get song details',
                context: {
                    songId
                }
            })
        }

        const { context: { song, updatedTokenData } } = songResponse;

        if (!!updatedTokenData) {
            log('Token information changed, updating...')
            await UsersDataSource.updateUserTokensBySpotifyUri({ spotifyUri: apiUser.userUri, accessToken: updatedTokenData['access_token'], refreshToken: updatedTokenData['refresh_token'] });
        }

        const songAttribute = songModel({
            id: song.id,
            name: song.name ?? 'Unknown Song',
            artist: song.artists?.map(artist => artist.name)?.join(', ') ?? 'Unknown Artist',
            image: song.album?.images?.[0]?.url ?? '',
        });

        const usersAttribute = users
            .map(user => userModel({
                id: user.SpotifyUri,
                name: user.DisplayName,
                profilePhotoUrl: user.ImageUrl,
            }))

        const conversation = await ConversatiosnDataSource.createConversation({
            song: songAttribute,
            users: usersAttribute,
        });

        sendToClients({ userUris, messageContent: { conversation } })

        return {
            status: 0,
            context: {
                conversation
            }
        }
    },
}

const sendToClients = async ({ userUris, messageContent }) => {
    const connections = Promise.all(
        userUris
            .map(userUri => ConnectionsDataSource.findByUseryUri({ userUri }))
    );

    await Promise.all(
        connections
        .map(connection => connection.ConnectionId)
        .map(connectionId =>
            managementApi.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify(messageContent),
            }).promise()
        )
    );
}

const eventErrorResponse = ({ status, errorMessage, context }) => ({ status, errorMessage, context })

const actionHandler = {
    'GetConversations': async ({ event }) => { },
    'GetMessages': async ({ event }) => { },
    'SendMessage': async ({ event }) => { },
    'DismissConversation': async ({ event }) => { },
}

const songModel = ({ id, name, artist, image }) => ({ id, name, artist, image });
const userModel = ({ id, name, profilePhotoUrl }) => ({ id, name, profilePhotoUrl });
const messageModel = ({ id, actorId, content, date }) => ({ id, actorId, content, date });
const conversationModel = ({ id, lastMessage, song, users }) => ({ id, lastMessage, song, users });


function unknownEventTypeError({ event }) {
    return {
        status: 1,
        errorMessage: 'Unknown event type'
    }
}

exports.handler = async (event, context) => {
    log({ event, context });

    if (!!event.eventType) {
        const { eventType } = event;

        const eventHandler = eventHandlers[eventType] || unknownEventTypeError;

        return await eventHandler({ event });
    } else {
        const body = JSON.parse(event.body);
        
        const { action } = body;
    
        const actionHandler = actionHandlers[action];
    
        if (!actionHandler) {
            throw Error(`Unknown action: ${action}`);
        }
    
        await actionHandler({ event: { ...event, body } });
    
        return {};
    }
};

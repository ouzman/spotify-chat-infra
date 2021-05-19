const AWS = require('aws-sdk');

const { log } = require('./util');
const { generateId } = require('./generators');

const managementApi = new AWS.ApiGatewayManagementApi({ endpoint: process.env.CHAT_API_ENDPOINT });

const UsersDataSource = require('./data-source/users');
const SpotifyDataSource = require('./data-source/spotify');
const ConversatiosnDataSource = require('./data-source/conversations');
const ConnectionsDataSource = require('./data-source/connections');

const eventHandlers = {
    'CreateConversation': async ({ event }) => {
        const { songId, userUris } = event.payload;

        const Users = await Promise.all(
            userUris
                .map(userUri => UsersDataSource.getBySpotifyUri({ spotifyUri: userUri }))
        );
        log({ Users });

        const apiUser = Users[0];

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

        const { context: { song: spotifySong, updatedTokenData } } = songResponse;

        if (!!updatedTokenData) {
            log('Token information changed, updating...')
            await UsersDataSource.updateUserTokensBySpotifyUri({ spotifyUri: apiUser.userUri, accessToken: updatedTokenData['access_token'], refreshToken: updatedTokenData['refresh_token'] });
        }

        const song = songModel({ spotifySong });

        const users = Users
            .map(User => userModel({ User }))

        const Conversation = await ConversatiosnDataSource.createConversation({ song, users });
        log({ Conversation })

        await sendToClients({ userUris, messageContent: eventSuccessResponse({ action: 'NewConversation', data: { conversation: conversationModel({ Conversation }) } }) })

        return {
            status: 0,
            context: {
                conversation: Conversation
            }
        }
    },
}

const sendToClients = async ({ userUris, messageContent }) => {
    const connectionsOfUsers = await Promise.all(
        userUris.map((userUri) => ConnectionsDataSource.findByUseryUri({ userUri }))
    );
    log({ connectionsOfUsers });

    const connectionIds = connectionsOfUsers
        .flatMap(userConnections => userConnections)
        .map(connection => connection.ConnectionId);
    log({ connectionIds });

    await Promise.all(
        connectionIds
            .map(connectionId => {
                log({ connectionId })

                const payload = {
                    ConnectionId: connectionId,
                    Data: JSON.stringify(messageContent),
                };
                log({ payload });

                return managementApi.postToConnection(payload).promise();
            })
    );
}

const eventSuccessResponse = ({ action, data }) => ({ eventId: generateId(), date: new Date().toISOString(), action, data });
const eventErrorResponse = ({ status, errorMessage, context }) => ({ status, errorMessage, context })

const actionHandlers = {
    'GetConversations': async ({ event }) => {
        const { requestContext: { authorizer: { principalId: userUri } }, body: { conversation, message } } = event;
        log({ userUri, conversation, message });

        const user = await UsersDataSource.getBySpotifyUri({ spotifyUri: userUri });
        log({ user });

        if (!user) {
            log({ message: 'User cannot be found', userUri })
            return
        }

        const conversation = await ConversatiosnDataSource.getById({ connectionId });
        log({ conversation });

        if (!conversation) {
            log({ message: 'Conversation cannot be found', conversation })
            return
        }

        const userBelongsToConversation = conversation.Users.map(user => user.id).includes(userUri);
        if (!userBelongsToConversation) {
            log({ message: 'User doesn\'t belong to the conversation', userUri, conversation });
            return
        }

        const { id: messageId, content: messageContent } = message;

        const persistedMessage = await ConversatiosnDataSource.addNewMessage({ conversationId, actorId: userUri, messageId, messageContent });

        const userUris = conversation.Users.map(u => u.id);

        await sendToClients({ userUris, messageContent: eventSuccessResponse({ action: 'NewMessage', data: { conversationId, message: persistedMessage } }) })
    },
    'GetMessages': async ({ event }) => { },
    'SendMessage': async ({ event }) => { },
    'DismissConversation': async ({ event }) => { },
}

const songModel = ({ spotifySong }) => ({
    id: spotifySong.id,
    name: spotifySong.name ?? 'Unknown Song',
    artist: spotifySong.artists?.map(artist => artist.name)?.join(', ') ?? 'Unknown Artist',
    image: spotifySong.album?.images?.[0]?.url ?? '',
});

const userModel = ({ User }) => ({
    id: User.SpotifyUri,
    name: User.DisplayName,
    profilePhotoUrl: User.ImageUrl,
});

const conversationModel = ({ Conversation }) => ({
    id: Conversation.Id,
    song: Conversation.Song,
    users: Conversation.Users,
    date: Conversation.Date,
    lastMessage: null, // TODO
});

const messageModel = ({ id, actorId, content, date }) => ({ id, actorId, content, date });


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

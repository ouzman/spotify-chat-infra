const AWS = require('aws-sdk');
const { DateTime } = require('luxon');

const { log } = require('./util');
const UsersDataSource = require('./data-source/users');
const MatchRequestsDataSource = require('./data-source/match-requests');
const ConversationDataSource = require('./data-source/conversation');

const actionHandlers = {
    'MatchRequest': async ({ event }) => {
        const { requestContext: { authorizer: { principalId: userUri } } } = event;
        log({ userUri });
        
        const user = await UsersDataSource.getBySpotifyUri({ spotifyUri: userUri });
        log({ user });

        if (!user) {
            console.log(`User cannot found. UserUri: ${userUri}`)
            return
        }

        if (!user.NowPlaying) {
            console.log("User isn't listening any song right now.")
            return
        }

        const { id: songId } = user.NowPlaying;

        const foundMatchRequest = await MatchRequestsDataSource.popMatchRequest({ songId, prohibitedUserUri: userUri, requestDateRangeFromNowInSeconds: 10 });
        log({ foundMatchRequest });

        if (foundMatchRequest) {
            const createConversationResponse = await ConversationDataSource.createConversation({ songId, userUris: [ userUri, foundMatchRequest.UserUri ] })
            log({ createConversationResponse });            
        } else {
            const requestDate = DateTime.now().setZone('UTC').toISO();

            const newMatchRequest = await MatchRequestsDataSource.upsertMatchRequest({ songId, requestDate, userUri });
            log({ newMatchRequest });    
        }
    }
}

exports.handler = async (event, context) => {
    log({ event, context });

    const { action } = event.body;

    const actionHandler = actionHandlers[action];

    if (!actionHandler) {
        throw Error(`Unknown action: ${action}`);
    }

    await actionHandler({ event });

    return {};
};

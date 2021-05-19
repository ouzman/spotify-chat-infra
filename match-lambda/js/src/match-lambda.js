const AWS = require('aws-sdk');

const { log } = require('./util');
const UsersDataSource = require('./data-source/users');
const MatchRequestsDataSource = require('./data-source/match-requests');

const routeHandlers = {
    'MatchRequest': async ({ event }) => {
        const { requestContext: { authorizer: { principalId: userUri } } } = event;
        
        const user = await UsersDataSource.getBySpotifyUri({ spotifyUri: userUri });

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

        if (foundMatchRequest) {
            // TODO: create a new conversation
            return;
        }

        log({ message, response });
    }
}

exports.handler = async (event, context) => {
    log({ event, context });

    const { routeKey } = event.requestContext;

    const routeHandler = routeHandlers[routeKey];

    if (!routeHandler) {
        throw Error(`Unknown route: ${routeKey}`);
    }

    await routeHandler({ event });

    return {};
};

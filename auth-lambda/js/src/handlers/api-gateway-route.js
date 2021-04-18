const { log } = require('../util');
const { 
    getAuthorizeUrl,
    getToken,
} = require('../spotify-authorizer');

const generateCallbackUrl = ({ event }) => `https://${event.requestContext.domainName}/callback`
const getRequestUrl = ({ event }) => `https://${event.requestContext.domainName}${event.rawPath}?${event.rawQueryString}`

const routeHandlers = {
    'GET /login': async ({ event }) => {
        return {
            statusCode: 302,
            headers: {
                'location': getAuthorizeUrl({ callbackUrl: generateCallbackUrl({ event }) }),
            },
        }
    },
    'GET /callback': async ({ event }) => {
        const { data: tokenInfo } = await getToken({
            requestUrl: getRequestUrl({ event }),
            callbackUri = generateCallbackUrl({ event }),
        });

        log({ tokenInfo });

        return {
            statusCode: 200,
            body: 'done',
            headers: {
                'content-type': 'text/plain'
            }
        }    
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
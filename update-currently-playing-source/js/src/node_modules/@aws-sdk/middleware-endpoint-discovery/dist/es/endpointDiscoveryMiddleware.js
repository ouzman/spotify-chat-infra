import { __assign, __awaiter, __generator } from "tslib";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { getCacheKey } from "./getCacheKey";
import { updateDiscoveredEndpointInCache } from "./updateDiscoveredEndpointInCache";
export var endpointDiscoveryMiddleware = function (config, middlewareConfig) { return function (next, context) { return function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var endpointDiscoveryCommandCtor, isDiscoveredEndpointRequired, identifiers, clientName, commandName, isEndpointDiscoveryEnabled, cacheKey, request, endpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (config.isCustomEndpoint) {
                    if (config.isClientEndpointDiscoveryEnabled) {
                        throw new Error("Custom endpoint is supplied; endpointDiscoveryEnabled must not be true.");
                    }
                    return [2 /*return*/, next(args)];
                }
                endpointDiscoveryCommandCtor = config.endpointDiscoveryCommandCtor;
                isDiscoveredEndpointRequired = middlewareConfig.isDiscoveredEndpointRequired, identifiers = middlewareConfig.identifiers;
                clientName = context.clientName, commandName = context.commandName;
                return [4 /*yield*/, config.endpointDiscoveryEnabled()];
            case 1:
                isEndpointDiscoveryEnabled = _a.sent();
                return [4 /*yield*/, getCacheKey(commandName, config, { identifiers: identifiers })];
            case 2:
                cacheKey = _a.sent();
                if (!isDiscoveredEndpointRequired) return [3 /*break*/, 4];
                // throw error if endpoint discovery is required, and it's explicitly disabled.
                if (isEndpointDiscoveryEnabled === false) {
                    throw new Error("Endpoint Discovery is disabled but " + commandName + " on " + clientName + " requires it." +
                        " Please check your configurations.");
                }
                // call await on Endpoint Discovery API utility so that function blocks
                // till discovered endpoint is updated in cache
                return [4 /*yield*/, updateDiscoveredEndpointInCache(config, __assign(__assign({}, middlewareConfig), { commandName: commandName,
                        cacheKey: cacheKey,
                        endpointDiscoveryCommandCtor: endpointDiscoveryCommandCtor }))];
            case 3:
                // call await on Endpoint Discovery API utility so that function blocks
                // till discovered endpoint is updated in cache
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                if (isEndpointDiscoveryEnabled) {
                    // Discover endpoints only if endpoint discovery is explicitly enabled.
                    // Do not call await await on Endpoint Discovery API utility so that function
                    // does not block, the command will use discovered endpoint, if available.
                    updateDiscoveredEndpointInCache(config, __assign(__assign({}, middlewareConfig), { commandName: commandName,
                        cacheKey: cacheKey,
                        endpointDiscoveryCommandCtor: endpointDiscoveryCommandCtor }));
                }
                _a.label = 5;
            case 5:
                request = args.request;
                if (cacheKey && HttpRequest.isInstance(request)) {
                    endpoint = config.endpointCache.getEndpoint(cacheKey);
                    if (endpoint) {
                        request.hostname = endpoint;
                    }
                }
                return [2 /*return*/, next(args)];
        }
    });
}); }; }; };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5kcG9pbnREaXNjb3ZlcnlNaWRkbGV3YXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2VuZHBvaW50RGlzY292ZXJ5TWlkZGxld2FyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBU3JELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHNUMsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFcEYsTUFBTSxDQUFDLElBQU0sMkJBQTJCLEdBQUcsVUFDekMsTUFBNEQsRUFDNUQsZ0JBQW1ELElBQ2hELE9BQUEsVUFDSCxJQUErQixFQUMvQixPQUFnQyxJQUNGLE9BQUEsVUFBTyxJQUFnQzs7Ozs7Z0JBQ3JFLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO29CQUMzQixJQUFJLE1BQU0sQ0FBQyxnQ0FBZ0MsRUFBRTt3QkFDM0MsTUFBTSxJQUFJLEtBQUssQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO3FCQUM1RjtvQkFDRCxzQkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUM7aUJBQ25CO2dCQUVPLDRCQUE0QixHQUFLLE1BQU0sNkJBQVgsQ0FBWTtnQkFDeEMsNEJBQTRCLEdBQWtCLGdCQUFnQiw2QkFBbEMsRUFBRSxXQUFXLEdBQUssZ0JBQWdCLFlBQXJCLENBQXNCO2dCQUMvRCxVQUFVLEdBQWtCLE9BQU8sV0FBekIsRUFBRSxXQUFXLEdBQUssT0FBTyxZQUFaLENBQWE7Z0JBQ1QscUJBQU0sTUFBTSxDQUFDLHdCQUF3QixFQUFFLEVBQUE7O2dCQUFwRSwwQkFBMEIsR0FBRyxTQUF1QztnQkFDekQscUJBQU0sV0FBVyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsRUFBRSxXQUFXLGFBQUEsRUFBRSxDQUFDLEVBQUE7O2dCQUFsRSxRQUFRLEdBQUcsU0FBdUQ7cUJBRXBFLDRCQUE0QixFQUE1Qix3QkFBNEI7Z0JBQzlCLCtFQUErRTtnQkFDL0UsSUFBSSwwQkFBMEIsS0FBSyxLQUFLLEVBQUU7b0JBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQ2Isd0NBQXNDLFdBQVcsWUFBTyxVQUFVLGtCQUFlO3dCQUMvRSxvQ0FBb0MsQ0FDdkMsQ0FBQztpQkFDSDtnQkFDRCx1RUFBdUU7Z0JBQ3ZFLCtDQUErQztnQkFDL0MscUJBQU0sK0JBQStCLENBQUMsTUFBTSx3QkFDdkMsZ0JBQWdCLEtBQ25CLFdBQVcsYUFBQTt3QkFDWCxRQUFRLFVBQUE7d0JBQ1IsNEJBQTRCLDhCQUFBLElBQzVCLEVBQUE7O2dCQVBGLHVFQUF1RTtnQkFDdkUsK0NBQStDO2dCQUMvQyxTQUtFLENBQUM7OztnQkFDRSxJQUFJLDBCQUEwQixFQUFFO29CQUNyQyx1RUFBdUU7b0JBQ3ZFLDZFQUE2RTtvQkFDN0UsMEVBQTBFO29CQUMxRSwrQkFBK0IsQ0FBQyxNQUFNLHdCQUNqQyxnQkFBZ0IsS0FDbkIsV0FBVyxhQUFBO3dCQUNYLFFBQVEsVUFBQTt3QkFDUiw0QkFBNEIsOEJBQUEsSUFDNUIsQ0FBQztpQkFDSjs7O2dCQUVPLE9BQU8sR0FBSyxJQUFJLFFBQVQsQ0FBVTtnQkFDekIsSUFBSSxRQUFRLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDekMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM1RCxJQUFJLFFBQVEsRUFBRTt3QkFDWixPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztxQkFDN0I7aUJBQ0Y7Z0JBRUQsc0JBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDOzs7S0FDbkIsRUFuRCtCLENBbUQvQixFQXRESSxDQXNESixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cFJlcXVlc3QgfSBmcm9tIFwiQGF3cy1zZGsvcHJvdG9jb2wtaHR0cFwiO1xuaW1wb3J0IHtcbiAgQnVpbGRIYW5kbGVyLFxuICBCdWlsZEhhbmRsZXJBcmd1bWVudHMsXG4gIEJ1aWxkSGFuZGxlck91dHB1dCxcbiAgSGFuZGxlckV4ZWN1dGlvbkNvbnRleHQsXG4gIE1ldGFkYXRhQmVhcmVyLFxufSBmcm9tIFwiQGF3cy1zZGsvdHlwZXNcIjtcblxuaW1wb3J0IHsgZ2V0Q2FjaGVLZXkgfSBmcm9tIFwiLi9nZXRDYWNoZUtleVwiO1xuaW1wb3J0IHsgRW5kcG9pbnREaXNjb3ZlcnlNaWRkbGV3YXJlQ29uZmlnIH0gZnJvbSBcIi4vZ2V0RW5kcG9pbnREaXNjb3ZlcnlQbHVnaW5cIjtcbmltcG9ydCB7IEVuZHBvaW50RGlzY292ZXJ5UmVzb2x2ZWRDb25maWcsIFByZXZpb3VzbHlSZXNvbHZlZCB9IGZyb20gXCIuL3Jlc29sdmVFbmRwb2ludERpc2NvdmVyeUNvbmZpZ1wiO1xuaW1wb3J0IHsgdXBkYXRlRGlzY292ZXJlZEVuZHBvaW50SW5DYWNoZSB9IGZyb20gXCIuL3VwZGF0ZURpc2NvdmVyZWRFbmRwb2ludEluQ2FjaGVcIjtcblxuZXhwb3J0IGNvbnN0IGVuZHBvaW50RGlzY292ZXJ5TWlkZGxld2FyZSA9IChcbiAgY29uZmlnOiBFbmRwb2ludERpc2NvdmVyeVJlc29sdmVkQ29uZmlnICYgUHJldmlvdXNseVJlc29sdmVkLFxuICBtaWRkbGV3YXJlQ29uZmlnOiBFbmRwb2ludERpc2NvdmVyeU1pZGRsZXdhcmVDb25maWdcbikgPT4gPE91dHB1dCBleHRlbmRzIE1ldGFkYXRhQmVhcmVyID0gTWV0YWRhdGFCZWFyZXI+KFxuICBuZXh0OiBCdWlsZEhhbmRsZXI8YW55LCBPdXRwdXQ+LFxuICBjb250ZXh0OiBIYW5kbGVyRXhlY3V0aW9uQ29udGV4dFxuKTogQnVpbGRIYW5kbGVyPGFueSwgT3V0cHV0PiA9PiBhc3luYyAoYXJnczogQnVpbGRIYW5kbGVyQXJndW1lbnRzPGFueT4pOiBQcm9taXNlPEJ1aWxkSGFuZGxlck91dHB1dDxPdXRwdXQ+PiA9PiB7XG4gIGlmIChjb25maWcuaXNDdXN0b21FbmRwb2ludCkge1xuICAgIGlmIChjb25maWcuaXNDbGllbnRFbmRwb2ludERpc2NvdmVyeUVuYWJsZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ3VzdG9tIGVuZHBvaW50IGlzIHN1cHBsaWVkOyBlbmRwb2ludERpc2NvdmVyeUVuYWJsZWQgbXVzdCBub3QgYmUgdHJ1ZS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHQoYXJncyk7XG4gIH1cblxuICBjb25zdCB7IGVuZHBvaW50RGlzY292ZXJ5Q29tbWFuZEN0b3IgfSA9IGNvbmZpZztcbiAgY29uc3QgeyBpc0Rpc2NvdmVyZWRFbmRwb2ludFJlcXVpcmVkLCBpZGVudGlmaWVycyB9ID0gbWlkZGxld2FyZUNvbmZpZztcbiAgY29uc3QgeyBjbGllbnROYW1lLCBjb21tYW5kTmFtZSB9ID0gY29udGV4dDtcbiAgY29uc3QgaXNFbmRwb2ludERpc2NvdmVyeUVuYWJsZWQgPSBhd2FpdCBjb25maWcuZW5kcG9pbnREaXNjb3ZlcnlFbmFibGVkKCk7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYXdhaXQgZ2V0Q2FjaGVLZXkoY29tbWFuZE5hbWUsIGNvbmZpZywgeyBpZGVudGlmaWVycyB9KTtcblxuICBpZiAoaXNEaXNjb3ZlcmVkRW5kcG9pbnRSZXF1aXJlZCkge1xuICAgIC8vIHRocm93IGVycm9yIGlmIGVuZHBvaW50IGRpc2NvdmVyeSBpcyByZXF1aXJlZCwgYW5kIGl0J3MgZXhwbGljaXRseSBkaXNhYmxlZC5cbiAgICBpZiAoaXNFbmRwb2ludERpc2NvdmVyeUVuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBFbmRwb2ludCBEaXNjb3ZlcnkgaXMgZGlzYWJsZWQgYnV0ICR7Y29tbWFuZE5hbWV9IG9uICR7Y2xpZW50TmFtZX0gcmVxdWlyZXMgaXQuYCArXG4gICAgICAgICAgYCBQbGVhc2UgY2hlY2sgeW91ciBjb25maWd1cmF0aW9ucy5gXG4gICAgICApO1xuICAgIH1cbiAgICAvLyBjYWxsIGF3YWl0IG9uIEVuZHBvaW50IERpc2NvdmVyeSBBUEkgdXRpbGl0eSBzbyB0aGF0IGZ1bmN0aW9uIGJsb2Nrc1xuICAgIC8vIHRpbGwgZGlzY292ZXJlZCBlbmRwb2ludCBpcyB1cGRhdGVkIGluIGNhY2hlXG4gICAgYXdhaXQgdXBkYXRlRGlzY292ZXJlZEVuZHBvaW50SW5DYWNoZShjb25maWcsIHtcbiAgICAgIC4uLm1pZGRsZXdhcmVDb25maWcsXG4gICAgICBjb21tYW5kTmFtZSxcbiAgICAgIGNhY2hlS2V5LFxuICAgICAgZW5kcG9pbnREaXNjb3ZlcnlDb21tYW5kQ3RvcixcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChpc0VuZHBvaW50RGlzY292ZXJ5RW5hYmxlZCkge1xuICAgIC8vIERpc2NvdmVyIGVuZHBvaW50cyBvbmx5IGlmIGVuZHBvaW50IGRpc2NvdmVyeSBpcyBleHBsaWNpdGx5IGVuYWJsZWQuXG4gICAgLy8gRG8gbm90IGNhbGwgYXdhaXQgYXdhaXQgb24gRW5kcG9pbnQgRGlzY292ZXJ5IEFQSSB1dGlsaXR5IHNvIHRoYXQgZnVuY3Rpb25cbiAgICAvLyBkb2VzIG5vdCBibG9jaywgdGhlIGNvbW1hbmQgd2lsbCB1c2UgZGlzY292ZXJlZCBlbmRwb2ludCwgaWYgYXZhaWxhYmxlLlxuICAgIHVwZGF0ZURpc2NvdmVyZWRFbmRwb2ludEluQ2FjaGUoY29uZmlnLCB7XG4gICAgICAuLi5taWRkbGV3YXJlQ29uZmlnLFxuICAgICAgY29tbWFuZE5hbWUsXG4gICAgICBjYWNoZUtleSxcbiAgICAgIGVuZHBvaW50RGlzY292ZXJ5Q29tbWFuZEN0b3IsXG4gICAgfSk7XG4gIH1cblxuICBjb25zdCB7IHJlcXVlc3QgfSA9IGFyZ3M7XG4gIGlmIChjYWNoZUtleSAmJiBIdHRwUmVxdWVzdC5pc0luc3RhbmNlKHJlcXVlc3QpKSB7XG4gICAgY29uc3QgZW5kcG9pbnQgPSBjb25maWcuZW5kcG9pbnRDYWNoZS5nZXRFbmRwb2ludChjYWNoZUtleSk7XG4gICAgaWYgKGVuZHBvaW50KSB7XG4gICAgICByZXF1ZXN0Lmhvc3RuYW1lID0gZW5kcG9pbnQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5leHQoYXJncyk7XG59O1xuIl19
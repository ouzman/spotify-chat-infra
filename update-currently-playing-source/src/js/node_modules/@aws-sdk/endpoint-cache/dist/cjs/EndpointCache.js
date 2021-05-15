"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndpointCache = void 0;
const mnemonist_1 = require("mnemonist");
class EndpointCache {
    constructor(capacity) {
        this.cache = new mnemonist_1.LRUCache(capacity);
    }
    /**
     * Returns an un-expired endpoint for the given key.
     *
     * @param endpointsWithExpiry
     * @returns
     */
    getEndpoint(key) {
        const endpointsWithExpiry = this.get(key);
        if (!endpointsWithExpiry || endpointsWithExpiry.length === 0) {
            return undefined;
        }
        const endpoints = endpointsWithExpiry.map((endpoint) => endpoint.Address);
        return endpoints[Math.floor(Math.random() * endpoints.length)];
    }
    /**
     * Returns un-expired endpoints for the given key.
     *
     * @param key
     * @returns
     */
    get(key) {
        if (!this.has(key)) {
            return;
        }
        const value = this.cache.get(key);
        if (!value) {
            return;
        }
        const now = Date.now();
        const endpointsWithExpiry = value.filter((endpoint) => now < endpoint.Expires);
        if (endpointsWithExpiry.length === 0) {
            this.delete(key);
            return undefined;
        }
        return endpointsWithExpiry;
    }
    /**
     * Stores the endpoints passed for the key in cache.
     * If not defined, uses empty string for the Address in endpoint.
     * If not defined, uses one minute for CachePeriodInMinutes in endpoint.
     * Stores milliseconds elapsed since the UNIX epoch in Expires param based
     * on value provided in CachePeriodInMinutes.
     *
     * @param key
     * @param endpoints
     */
    set(key, endpoints) {
        const now = Date.now();
        this.cache.set(key, endpoints.map(({ Address, CachePeriodInMinutes }) => ({
            Address,
            Expires: now + CachePeriodInMinutes * 60 * 1000,
        })));
    }
    /**
     * Deletes the value for the given key in the cache.
     *
     * @param {string} key
     */
    delete(key) {
        // Replace with remove/delete call once support is added upstream
        // Refs: https://github.com/Yomguithereal/mnemonist/issues/143
        this.cache.set(key, []);
    }
    /**
     * Checks whether the key exists in cache.
     *
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        if (!this.cache.has(key)) {
            return false;
        }
        // Remove call for peek, once remove/delete support is added upstream
        // Refs: https://github.com/Yomguithereal/mnemonist/issues/143
        const endpoints = this.cache.peek(key);
        if (!endpoints) {
            return false;
        }
        return endpoints.length > 0;
    }
    /**
     * Clears the cache.
     */
    clear() {
        this.cache.clear();
    }
}
exports.EndpointCache = EndpointCache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW5kcG9pbnRDYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9FbmRwb2ludENhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlDQUFxQztBQVFyQyxNQUFhLGFBQWE7SUFHeEIsWUFBWSxRQUFnQjtRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksb0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxXQUFXLENBQUMsR0FBVztRQUNyQixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLG1CQUFtQixJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDNUQsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFDRCxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRSxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxHQUFHLENBQUMsR0FBVztRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLE9BQU87U0FDUjtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPO1NBQ1I7UUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9FLElBQUksbUJBQW1CLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxtQkFBbUIsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsR0FBRyxDQUFDLEdBQVcsRUFBRSxTQUFxQjtRQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQ1osR0FBRyxFQUNILFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE9BQU87WUFDUCxPQUFPLEVBQUUsR0FBRyxHQUFHLG9CQUFvQixHQUFHLEVBQUUsR0FBRyxJQUFJO1NBQ2hELENBQUMsQ0FBQyxDQUNKLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxHQUFXO1FBQ2hCLGlFQUFpRTtRQUNqRSw4REFBOEQ7UUFDOUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEdBQUcsQ0FBQyxHQUFXO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxxRUFBcUU7UUFDckUsOERBQThEO1FBQzlELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsT0FBTyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQixDQUFDO0NBQ0Y7QUExR0Qsc0NBMEdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTFJVQ2FjaGUgfSBmcm9tIFwibW5lbW9uaXN0XCI7XG5cbmltcG9ydCB7IEVuZHBvaW50IH0gZnJvbSBcIi4vRW5kcG9pbnRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBFbmRwb2ludFdpdGhFeHBpcnkgZXh0ZW5kcyBQaWNrPEVuZHBvaW50LCBcIkFkZHJlc3NcIj4ge1xuICBFeHBpcmVzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBFbmRwb2ludENhY2hlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBjYWNoZTogTFJVQ2FjaGU8c3RyaW5nLCBFbmRwb2ludFdpdGhFeHBpcnlbXT47XG5cbiAgY29uc3RydWN0b3IoY2FwYWNpdHk6IG51bWJlcikge1xuICAgIHRoaXMuY2FjaGUgPSBuZXcgTFJVQ2FjaGUoY2FwYWNpdHkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gdW4tZXhwaXJlZCBlbmRwb2ludCBmb3IgdGhlIGdpdmVuIGtleS5cbiAgICpcbiAgICogQHBhcmFtIGVuZHBvaW50c1dpdGhFeHBpcnlcbiAgICogQHJldHVybnNcbiAgICovXG4gIGdldEVuZHBvaW50KGtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgZW5kcG9pbnRzV2l0aEV4cGlyeSA9IHRoaXMuZ2V0KGtleSk7XG4gICAgaWYgKCFlbmRwb2ludHNXaXRoRXhwaXJ5IHx8IGVuZHBvaW50c1dpdGhFeHBpcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBlbmRwb2ludHMgPSBlbmRwb2ludHNXaXRoRXhwaXJ5Lm1hcCgoZW5kcG9pbnQpID0+IGVuZHBvaW50LkFkZHJlc3MpO1xuICAgIHJldHVybiBlbmRwb2ludHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZW5kcG9pbnRzLmxlbmd0aCldO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdW4tZXhwaXJlZCBlbmRwb2ludHMgZm9yIHRoZSBnaXZlbiBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSBrZXlcbiAgICogQHJldHVybnNcbiAgICovXG4gIGdldChrZXk6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5oYXMoa2V5KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5jYWNoZS5nZXQoa2V5KTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBlbmRwb2ludHNXaXRoRXhwaXJ5ID0gdmFsdWUuZmlsdGVyKChlbmRwb2ludCkgPT4gbm93IDwgZW5kcG9pbnQuRXhwaXJlcyk7XG4gICAgaWYgKGVuZHBvaW50c1dpdGhFeHBpcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmRlbGV0ZShrZXkpO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZW5kcG9pbnRzV2l0aEV4cGlyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9yZXMgdGhlIGVuZHBvaW50cyBwYXNzZWQgZm9yIHRoZSBrZXkgaW4gY2FjaGUuXG4gICAqIElmIG5vdCBkZWZpbmVkLCB1c2VzIGVtcHR5IHN0cmluZyBmb3IgdGhlIEFkZHJlc3MgaW4gZW5kcG9pbnQuXG4gICAqIElmIG5vdCBkZWZpbmVkLCB1c2VzIG9uZSBtaW51dGUgZm9yIENhY2hlUGVyaW9kSW5NaW51dGVzIGluIGVuZHBvaW50LlxuICAgKiBTdG9yZXMgbWlsbGlzZWNvbmRzIGVsYXBzZWQgc2luY2UgdGhlIFVOSVggZXBvY2ggaW4gRXhwaXJlcyBwYXJhbSBiYXNlZFxuICAgKiBvbiB2YWx1ZSBwcm92aWRlZCBpbiBDYWNoZVBlcmlvZEluTWludXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGtleVxuICAgKiBAcGFyYW0gZW5kcG9pbnRzXG4gICAqL1xuICBzZXQoa2V5OiBzdHJpbmcsIGVuZHBvaW50czogRW5kcG9pbnRbXSkge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5jYWNoZS5zZXQoXG4gICAgICBrZXksXG4gICAgICBlbmRwb2ludHMubWFwKCh7IEFkZHJlc3MsIENhY2hlUGVyaW9kSW5NaW51dGVzIH0pID0+ICh7XG4gICAgICAgIEFkZHJlc3MsXG4gICAgICAgIEV4cGlyZXM6IG5vdyArIENhY2hlUGVyaW9kSW5NaW51dGVzICogNjAgKiAxMDAwLFxuICAgICAgfSkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGtleSBpbiB0aGUgY2FjaGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICovXG4gIGRlbGV0ZShrZXk6IHN0cmluZykge1xuICAgIC8vIFJlcGxhY2Ugd2l0aCByZW1vdmUvZGVsZXRlIGNhbGwgb25jZSBzdXBwb3J0IGlzIGFkZGVkIHVwc3RyZWFtXG4gICAgLy8gUmVmczogaHR0cHM6Ly9naXRodWIuY29tL1lvbWd1aXRoZXJlYWwvbW5lbW9uaXN0L2lzc3Vlcy8xNDNcbiAgICB0aGlzLmNhY2hlLnNldChrZXksIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUga2V5IGV4aXN0cyBpbiBjYWNoZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhcyhrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBjYWxsIGZvciBwZWVrLCBvbmNlIHJlbW92ZS9kZWxldGUgc3VwcG9ydCBpcyBhZGRlZCB1cHN0cmVhbVxuICAgIC8vIFJlZnM6IGh0dHBzOi8vZ2l0aHViLmNvbS9Zb21ndWl0aGVyZWFsL21uZW1vbmlzdC9pc3N1ZXMvMTQzXG4gICAgY29uc3QgZW5kcG9pbnRzID0gdGhpcy5jYWNoZS5wZWVrKGtleSk7XG4gICAgaWYgKCFlbmRwb2ludHMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGVuZHBvaW50cy5sZW5ndGggPiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgY2FjaGUuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLmNhY2hlLmNsZWFyKCk7XG4gIH1cbn1cbiJdfQ==
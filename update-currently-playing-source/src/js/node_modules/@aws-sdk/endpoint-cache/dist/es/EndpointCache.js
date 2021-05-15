import { LRUCache } from "mnemonist";
var EndpointCache = /** @class */ (function () {
    function EndpointCache(capacity) {
        this.cache = new LRUCache(capacity);
    }
    /**
     * Returns an un-expired endpoint for the given key.
     *
     * @param endpointsWithExpiry
     * @returns
     */
    EndpointCache.prototype.getEndpoint = function (key) {
        var endpointsWithExpiry = this.get(key);
        if (!endpointsWithExpiry || endpointsWithExpiry.length === 0) {
            return undefined;
        }
        var endpoints = endpointsWithExpiry.map(function (endpoint) { return endpoint.Address; });
        return endpoints[Math.floor(Math.random() * endpoints.length)];
    };
    /**
     * Returns un-expired endpoints for the given key.
     *
     * @param key
     * @returns
     */
    EndpointCache.prototype.get = function (key) {
        if (!this.has(key)) {
            return;
        }
        var value = this.cache.get(key);
        if (!value) {
            return;
        }
        var now = Date.now();
        var endpointsWithExpiry = value.filter(function (endpoint) { return now < endpoint.Expires; });
        if (endpointsWithExpiry.length === 0) {
            this.delete(key);
            return undefined;
        }
        return endpointsWithExpiry;
    };
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
    EndpointCache.prototype.set = function (key, endpoints) {
        var now = Date.now();
        this.cache.set(key, endpoints.map(function (_a) {
            var Address = _a.Address, CachePeriodInMinutes = _a.CachePeriodInMinutes;
            return ({
                Address: Address,
                Expires: now + CachePeriodInMinutes * 60 * 1000,
            });
        }));
    };
    /**
     * Deletes the value for the given key in the cache.
     *
     * @param {string} key
     */
    EndpointCache.prototype.delete = function (key) {
        // Replace with remove/delete call once support is added upstream
        // Refs: https://github.com/Yomguithereal/mnemonist/issues/143
        this.cache.set(key, []);
    };
    /**
     * Checks whether the key exists in cache.
     *
     * @param {string} key
     * @returns {boolean}
     */
    EndpointCache.prototype.has = function (key) {
        if (!this.cache.has(key)) {
            return false;
        }
        // Remove call for peek, once remove/delete support is added upstream
        // Refs: https://github.com/Yomguithereal/mnemonist/issues/143
        var endpoints = this.cache.peek(key);
        if (!endpoints) {
            return false;
        }
        return endpoints.length > 0;
    };
    /**
     * Clears the cache.
     */
    EndpointCache.prototype.clear = function () {
        this.cache.clear();
    };
    return EndpointCache;
}());
export { EndpointCache };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW5kcG9pbnRDYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9FbmRwb2ludENhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFRckM7SUFHRSx1QkFBWSxRQUFnQjtRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILG1DQUFXLEdBQVgsVUFBWSxHQUFXO1FBQ3JCLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsbUJBQW1CLElBQUksbUJBQW1CLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM1RCxPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELElBQU0sU0FBUyxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFDLFFBQVEsSUFBSyxPQUFBLFFBQVEsQ0FBQyxPQUFPLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUMxRSxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCwyQkFBRyxHQUFILFVBQUksR0FBVztRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLE9BQU87U0FDUjtRQUVELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPO1NBQ1I7UUFFRCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUMsUUFBUSxJQUFLLE9BQUEsR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUMvRSxJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQixPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUVELE9BQU8sbUJBQW1CLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILDJCQUFHLEdBQUgsVUFBSSxHQUFXLEVBQUUsU0FBcUI7UUFDcEMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUNaLEdBQUcsRUFDSCxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUMsRUFBaUM7Z0JBQS9CLE9BQU8sYUFBQSxFQUFFLG9CQUFvQiwwQkFBQTtZQUFPLE9BQUEsQ0FBQztnQkFDcEQsT0FBTyxTQUFBO2dCQUNQLE9BQU8sRUFBRSxHQUFHLEdBQUcsb0JBQW9CLEdBQUcsRUFBRSxHQUFHLElBQUk7YUFDaEQsQ0FBQztRQUhtRCxDQUduRCxDQUFDLENBQ0osQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsOEJBQU0sR0FBTixVQUFPLEdBQVc7UUFDaEIsaUVBQWlFO1FBQ2pFLDhEQUE4RDtRQUM5RCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsMkJBQUcsR0FBSCxVQUFJLEdBQVc7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEIsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELHFFQUFxRTtRQUNyRSw4REFBOEQ7UUFDOUQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNkLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7T0FFRztJQUNILDZCQUFLLEdBQUw7UUFDRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUExR0QsSUEwR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMUlVDYWNoZSB9IGZyb20gXCJtbmVtb25pc3RcIjtcblxuaW1wb3J0IHsgRW5kcG9pbnQgfSBmcm9tIFwiLi9FbmRwb2ludFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVuZHBvaW50V2l0aEV4cGlyeSBleHRlbmRzIFBpY2s8RW5kcG9pbnQsIFwiQWRkcmVzc1wiPiB7XG4gIEV4cGlyZXM6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEVuZHBvaW50Q2FjaGUge1xuICBwcml2YXRlIHJlYWRvbmx5IGNhY2hlOiBMUlVDYWNoZTxzdHJpbmcsIEVuZHBvaW50V2l0aEV4cGlyeVtdPjtcblxuICBjb25zdHJ1Y3RvcihjYXBhY2l0eTogbnVtYmVyKSB7XG4gICAgdGhpcy5jYWNoZSA9IG5ldyBMUlVDYWNoZShjYXBhY2l0eSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiB1bi1leHBpcmVkIGVuZHBvaW50IGZvciB0aGUgZ2l2ZW4ga2V5LlxuICAgKlxuICAgKiBAcGFyYW0gZW5kcG9pbnRzV2l0aEV4cGlyeVxuICAgKiBAcmV0dXJuc1xuICAgKi9cbiAgZ2V0RW5kcG9pbnQoa2V5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBlbmRwb2ludHNXaXRoRXhwaXJ5ID0gdGhpcy5nZXQoa2V5KTtcbiAgICBpZiAoIWVuZHBvaW50c1dpdGhFeHBpcnkgfHwgZW5kcG9pbnRzV2l0aEV4cGlyeS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGVuZHBvaW50cyA9IGVuZHBvaW50c1dpdGhFeHBpcnkubWFwKChlbmRwb2ludCkgPT4gZW5kcG9pbnQuQWRkcmVzcyk7XG4gICAgcmV0dXJuIGVuZHBvaW50c1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBlbmRwb2ludHMubGVuZ3RoKV07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB1bi1leHBpcmVkIGVuZHBvaW50cyBmb3IgdGhlIGdpdmVuIGtleS5cbiAgICpcbiAgICogQHBhcmFtIGtleVxuICAgKiBAcmV0dXJuc1xuICAgKi9cbiAgZ2V0KGtleTogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLmhhcyhrZXkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmNhY2hlLmdldChrZXkpO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGVuZHBvaW50c1dpdGhFeHBpcnkgPSB2YWx1ZS5maWx0ZXIoKGVuZHBvaW50KSA9PiBub3cgPCBlbmRwb2ludC5FeHBpcmVzKTtcbiAgICBpZiAoZW5kcG9pbnRzV2l0aEV4cGlyeS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBlbmRwb2ludHNXaXRoRXhwaXJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgZW5kcG9pbnRzIHBhc3NlZCBmb3IgdGhlIGtleSBpbiBjYWNoZS5cbiAgICogSWYgbm90IGRlZmluZWQsIHVzZXMgZW1wdHkgc3RyaW5nIGZvciB0aGUgQWRkcmVzcyBpbiBlbmRwb2ludC5cbiAgICogSWYgbm90IGRlZmluZWQsIHVzZXMgb25lIG1pbnV0ZSBmb3IgQ2FjaGVQZXJpb2RJbk1pbnV0ZXMgaW4gZW5kcG9pbnQuXG4gICAqIFN0b3JlcyBtaWxsaXNlY29uZHMgZWxhcHNlZCBzaW5jZSB0aGUgVU5JWCBlcG9jaCBpbiBFeHBpcmVzIHBhcmFtIGJhc2VkXG4gICAqIG9uIHZhbHVlIHByb3ZpZGVkIGluIENhY2hlUGVyaW9kSW5NaW51dGVzLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5XG4gICAqIEBwYXJhbSBlbmRwb2ludHNcbiAgICovXG4gIHNldChrZXk6IHN0cmluZywgZW5kcG9pbnRzOiBFbmRwb2ludFtdKSB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLmNhY2hlLnNldChcbiAgICAgIGtleSxcbiAgICAgIGVuZHBvaW50cy5tYXAoKHsgQWRkcmVzcywgQ2FjaGVQZXJpb2RJbk1pbnV0ZXMgfSkgPT4gKHtcbiAgICAgICAgQWRkcmVzcyxcbiAgICAgICAgRXhwaXJlczogbm93ICsgQ2FjaGVQZXJpb2RJbk1pbnV0ZXMgKiA2MCAqIDEwMDAsXG4gICAgICB9KSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZXMgdGhlIHZhbHVlIGZvciB0aGUgZ2l2ZW4ga2V5IGluIHRoZSBjYWNoZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKi9cbiAgZGVsZXRlKGtleTogc3RyaW5nKSB7XG4gICAgLy8gUmVwbGFjZSB3aXRoIHJlbW92ZS9kZWxldGUgY2FsbCBvbmNlIHN1cHBvcnQgaXMgYWRkZWQgdXBzdHJlYW1cbiAgICAvLyBSZWZzOiBodHRwczovL2dpdGh1Yi5jb20vWW9tZ3VpdGhlcmVhbC9tbmVtb25pc3QvaXNzdWVzLzE0M1xuICAgIHRoaXMuY2FjaGUuc2V0KGtleSwgW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBrZXkgZXhpc3RzIGluIGNhY2hlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmNhY2hlLmhhcyhrZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGNhbGwgZm9yIHBlZWssIG9uY2UgcmVtb3ZlL2RlbGV0ZSBzdXBwb3J0IGlzIGFkZGVkIHVwc3RyZWFtXG4gICAgLy8gUmVmczogaHR0cHM6Ly9naXRodWIuY29tL1lvbWd1aXRoZXJlYWwvbW5lbW9uaXN0L2lzc3Vlcy8xNDNcbiAgICBjb25zdCBlbmRwb2ludHMgPSB0aGlzLmNhY2hlLnBlZWsoa2V5KTtcbiAgICBpZiAoIWVuZHBvaW50cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZW5kcG9pbnRzLmxlbmd0aCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIHRoZSBjYWNoZS5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuY2FjaGUuY2xlYXIoKTtcbiAgfVxufVxuIl19
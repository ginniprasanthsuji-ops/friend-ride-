/* FRIEND RIDE — Cache Provider Interface
 * No caching behavior is enabled by this scaffold. Cache must never become the
 * source of truth for orders, rides, payments, KYC, or balances.
 */
(function (global) {
  "use strict";

  const provider = {
    name: "cache",
    async get(_key) { return null; },
    async set(_key, _value, _ttlSeconds) { return false; },
    async delete(_key) { return false; },
    async clearNamespace(_namespace) { return false; }
  };

  global.FRCacheProviderScaffold = Object.freeze(provider);
})(window);

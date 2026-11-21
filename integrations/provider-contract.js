/* FRIEND RIDE — Integration Provider Contract
 * Integration 1 scaffold only. This file is not wired into production runtime.
 * Providers must keep durable business records in Supabase and must not expose secrets.
 */
(function (global) {
  "use strict";

  function createProviderContract(name, methods) {
    if (!name || !methods || typeof methods !== "object") {
      throw new TypeError("Provider name and methods are required");
    }
    return Object.freeze({
      name: String(name),
      methods: Object.freeze(Object.keys(methods)),
      validate(provider) {
        return !!provider && Object.keys(methods).every(
          (method) => typeof provider[method] === "function"
        );
      }
    });
  }

  global.FRIntegrationContracts = global.FRIntegrationContracts || {};
  global.FRIntegrationContracts.createProviderContract = createProviderContract;
})(window);

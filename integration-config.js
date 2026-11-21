/* FRIEND RIDE Integration Registry — safe public configuration only.
 * Provider secrets belong in Supabase secrets / provider dashboards, never here.
 * This scaffold is intentionally not wired into production app behavior yet.
 */
(function (root) {
  "use strict";

  const config = Object.freeze({
    mode: "free",
    futureUpgradeMode: "supabase-native",
    providers: Object.freeze({
      database: "supabase",
      notifications: "browser",
      cache: "none",
      maps: "leaflet-osm",
      email: "disabled",
      storage: "supabase",
      payments: "cashfree",
      analytics: "disabled",
      errorMonitoring: "disabled"
    }),
    features: Object.freeze({
      pushNotifications: false,
      scheduledNotifications: false,
      externalCache: false,
      emailNotifications: false,
      analytics: false,
      errorMonitoring: false,
      groceryEmi: false
    })
  });

  const registry = {
    config,
    getProvider(name) {
      return config.providers[name] || "disabled";
    },
    isEnabled(name) {
      return config.features[name] === true;
    }
  };

  root.FRIntegration = root.FRIntegration || registry;
})(window);

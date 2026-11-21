/* FRIEND RIDE — Notification event catalog and opt-in local dispatcher.
 * Business event mapping only. No event listeners or sending at module load.
 */
(function (global) {
  "use strict";

  const catalog = Object.freeze({
    "ride.requested": { roles: ["driver"], title: "కొత్త రైడ్ అభ్యర్థన", body: "మీకు కొత్త రైడ్ అభ్యర్థన వచ్చింది." },
    "ride.accepted": { roles: ["customer"], title: "రైడ్ అంగీకరించబడింది", body: "డ్రైవర్ మీ రైడ్‌ను అంగీకరించారు." },
    "ride.started": { roles: ["customer"], title: "రైడ్ ప్రారంభమైంది", body: "మీ రైడ్ ప్రారంభమైంది. సురక్షితంగా ప్రయాణించండి." },
    "ride.completed": { roles: ["customer", "driver"], title: "రైడ్ పూర్తయింది", body: "మీ రైడ్ విజయవంతంగా పూర్తయింది." },
    "delivery.assigned": { roles: ["customer", "driver"], title: "డెలివరీ కేటాయించబడింది", body: "మీ డెలివరీకి భాగస్వామి కేటాయించబడ్డారు." },
    "delivery.picked_up": { roles: ["customer"], title: "డెలివరీ తీసుకున్నారు", body: "మీ పార్సెల్/ఆర్డర్ pickup అయింది." },
    "delivery.completed": { roles: ["customer", "driver"], title: "డెలివరీ పూర్తయింది", body: "మీ డెలివరీ పూర్తయింది." },
    "order.received": { roles: ["customer", "partner"], title: "ఆర్డర్ అందింది", body: "కొత్త ఆర్డర్ నమోదు అయింది." },
    "order.accepted": { roles: ["customer"], title: "ఆర్డర్ అంగీకరించారు", body: "పార్ట్నర్ మీ ఆర్డర్‌ను అంగీకరించారు." },
    "order.ready": { roles: ["customer", "driver"], title: "ఆర్డర్ సిద్ధంగా ఉంది", body: "మీ ఆర్డర్ pickup/delivery కోసం సిద్ధంగా ఉంది." },
    "order.completed": { roles: ["customer", "partner"], title: "ఆర్డర్ పూర్తయింది", body: "ఆర్డర్ పూర్తి అయినట్లు నమోదు అయింది." },
    "partner.approved": { roles: ["partner"], title: "పార్ట్నర్ ఆమోదం", body: "మీ పార్ట్నర్ రిజిస్ట్రేషన్ ఆమోదించబడింది." },
    "partner.rejected": { roles: ["partner"], title: "పార్ట్నర్ అప్డేట్", body: "మీ రిజిస్ట్రేషన్‌పై అప్డేట్ ఉంది. వివరాలు చూడండి." },
    "admin.new_registration": { roles: ["admin"], title: "కొత్త రిజిస్ట్రేషన్", body: "కొత్త డ్రైవర్/పార్ట్నర్ రిజిస్ట్రేషన్ సమీక్షకు వచ్చింది." },
    "admin.complaint": { roles: ["admin"], title: "కొత్త ఫిర్యాదు", body: "కొత్త ఫిర్యాదు/ఫీడ్‌బ్యాక్ సమీక్షకు వచ్చింది." }
  });

  function build(eventName, context = {}) {
    const entry = catalog[eventName];
    if (!entry) return null;
    const title = context.title ? String(context.title) : entry.title;
    const body = context.body ? String(context.body) : entry.body;
    return Object.freeze({
      event: eventName,
      roles: entry.roles.slice(),
      title,
      body,
      tag: context.tag || eventName,
      url: context.url || "./"
    });
  }

  async function dispatchLocal(provider, eventName, context = {}) {
    if (!provider || typeof provider.sendLocal !== "function") return { sent: false, reason: "provider-unavailable" };
    if (context.optIn !== true) return { sent: false, reason: "user-opt-in-required" };
    const payload = build(eventName, context);
    if (!payload) return { sent: false, reason: "unknown-event" };
    return provider.sendLocal(payload);
  }

  global.FRNotificationEvents = Object.freeze({
    catalog,
    build,
    dispatchLocal,
    getRoles(eventName) { return catalog[eventName] ? catalog[eventName].roles.slice() : []; }
  });
})(window);

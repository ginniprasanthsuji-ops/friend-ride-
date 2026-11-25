/**
 * FRIEND RIDE Train Alternative Route — booking handoff helpers.
 * Does not automate IRCTC fields or booking. Deep-link/prefill support must be
 * separately verified against official/authorized documentation before use.
 */
export function formatTrainJourneyClipboard(journey) {
  const legs = Array.isArray(journey?.legs) ? journey.legs : [];
  const lines = [
    `Journey: ${journey?.fromStation || ""} → ${journey?.toStation || ""}`,
    `Date: ${journey?.journeyDate || ""}`,
    `Class: ${journey?.travelClass || ""}`,
    `Selected route: ${journey?.routeSummary || ""}`
  ];
  legs.forEach((leg, i) => {
    lines.push(
      `Leg ${i + 1}: ${leg.trainNumber || ""} ${leg.trainName || ""}`,
      `  ${leg.fromStation || ""} ${leg.departure || ""} → ${leg.toStation || ""} ${leg.arrival || ""}`
    );
    if (leg.transferAt) lines.push(`  Transfer at: ${leg.transferAt}`);
    if (leg.transferDuration) lines.push(`  Transfer duration: ${leg.transferDuration}`);
  });
  lines.push("Verify live schedule, fare, and availability on IRCTC before booking.");
  return lines.join("\\n");
}

export async function copyTrainJourneyDetails(journey) {
  const text = formatTrainJourneyClipboard(journey);
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { copied: true, text };
    }
  } catch (_) {}
  return { copied: false, text, message: "Copy the displayed summary manually." };
}

export function getOfficialIRCTCBookingUrl() {
  return "https://www.irctc.co.in/nget/train-search";
}

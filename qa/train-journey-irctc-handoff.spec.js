import { test, expect } from '@playwright/test';

// Unit/UI integration test spec for the train journey clipboard helper.
// Run once helper is wired into the app UI and test harness.
test.describe('FR Train Journey IRCTC handoff', () => {
  test('formats selected connecting itinerary with all legs and transfer info', async () => {
    const { formatTrainJourneyClipboard } = await import('../assets/train-journey-irctc-handoff.js');
    const text = formatTrainJourneyClipboard({
      fromStation: 'Secunderabad (SC)',
      toStation: 'Bengaluru (SBC)',
      journeyDate: '2026-12-01',
      travelClass: '3A',
      routeSummary: 'SC → Vijayawada → SBC',
      legs: [
        { trainNumber: '12796', trainName: 'Intercity', fromStation: 'SC', departure: '06:00', toStation: 'BZA', arrival: '12:00', transferAt: 'BZA', transferDuration: '1h 30m' },
        { trainNumber: '12863', trainName: 'SF Express', fromStation: 'BZA', departure: '13:30', toStation: 'SBC', arrival: '22:00' }
      ]
    });
    expect(text).toContain('Journey: Secunderabad (SC) → Bengaluru (SBC)');
    expect(text).toContain('Class: 3A');
    expect(text).toContain('Leg 1: 12796 Intercity');
    expect(text).toContain('Transfer duration: 1h 30m');
    expect(text).toContain('Leg 2: 12863 SF Express');
    expect(text).toContain('Verify live schedule, fare, and availability on IRCTC');
  });

  test('returns official IRCTC search URL, not a guessed prefill deep link', async () => {
    const { getOfficialIRCTCBookingUrl } = await import('../assets/train-journey-irctc-handoff.js');
    expect(getOfficialIRCTCBookingUrl()).toBe('https://www.irctc.co.in/nget/train-search');
  });
});

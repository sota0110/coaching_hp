import test from 'node:test';
import assert from 'node:assert/strict';
import { preferenceError, submitApplication, tokyoDateTime } from '../src/booking-api.js';

test('demo submission stays local and is explicitly identified as a demo', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Demo must not send personal data over the network'); };
  try {
    const application = {name:'デモ確認',email:'demo@example.invalid',firstPreference:'2027-01-10T10:00',method:'対面（渋谷区代々木）'};
    const before = structuredClone(application);
    const receipt = await submitApplication(application);
    assert.equal(receipt.mode,'demo');
    assert.match(receipt.reference,/^DEMO-[A-F0-9]{8}$/);
    assert.deepEqual(application,before);
    assert.equal('emailSent' in receipt,false);
    assert.equal('reservationConfirmed' in receipt,false);
  } finally { globalThis.fetch = originalFetch; }
});
test('a missing name or email cannot produce a demo receipt', async () => {
  await assert.rejects(submitApplication({name:'デモ確認'}));
  await assert.rejects(submitApplication({email:'demo@example.invalid'}));
  await assert.rejects(submitApplication({name:'　 ',email:'demo@example.invalid'}));
});

test('booking preferences use Japan time across midnight and allow a blank second choice', () => {
  const now = new Date('2026-11-06T15:07:00Z');
  assert.equal(tokyoDateTime(now), '2026-11-07T00:07');
  assert.equal(preferenceError({firstPreference:'2026-11-07T00:06'}, now)?.field, 'firstPreference');
  assert.equal(preferenceError({firstPreference:'2026-11-07T10:00', secondPreference:''}, now), null);
  assert.equal(preferenceError({firstPreference:'2026-11-07T10:00', secondPreference:'2026-11-07T00:06'}, now)?.field, 'secondPreference');
  assert.equal(preferenceError({firstPreference:'2026-11-07T10:00', secondPreference:'2026-11-07T10:00'}, now)?.field, 'secondPreference');
  assert.equal(preferenceError({firstPreference:'2026-11-07T10:00', secondPreference:'2026-11-08T10:00'}, now), null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { submitApplication } from '../src/booking-api.js';

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
});

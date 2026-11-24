'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseVoiceIntent, isAllowedIntent } = require('../qa/voice-intent-contract.cjs');

test('safe navigation commands map to allowlisted screens', () => {
  for (const [command,target] of [['home','home'],['my orders','orders'],['services','services'],['profile','profile'],['సహాయం','help']]) {
    const intent = parseVoiceIntent(command);
    assert.deepEqual(intent, { type:'navigate', target });
    assert.equal(isAllowedIntent(intent), true);
  }
});

test('English and Telugu ride choices map without booking side effects', () => {
  for (const [command,rideType] of [['bike','bike'],['auto','auto'],['car','car'],['బైక్','bike'],['ఆటో','auto'],['కారు','car']]) {
    assert.deepEqual(parseVoiceIntent(command), {type:'select_ride', rideType});
  }
});

test('booking voice commands only open review state and never execute', () => {
  assert.deepEqual(parseVoiceIntent('confirm booking'), {type:'review_booking',requiresConfirmation:true,execution:'none'});
});

test('payment and ride cancellation commands are blocked from voice-only execution', () => {
  assert.equal(parseVoiceIntent('pay now').type, 'blocked_action');
  assert.equal(parseVoiceIntent('cancel ride').type, 'blocked_action');
});

test('unknown and empty commands fail closed', () => {
  assert.deepEqual(parseVoiceIntent(''), {type:'unknown',reason:'empty'});
  assert.deepEqual(parseVoiceIntent('send my location to everyone'), {type:'unknown',reason:'not_allowlisted'});
});

test('allowlist rejects malformed or injected action objects', () => {
  assert.equal(isAllowedIntent({type:'navigate',target:'admin'}), false);
  assert.equal(isAllowedIntent({type:'select_ride',rideType:'truck'}), false);
  assert.equal(isAllowedIntent({type:'review_booking',requiresConfirmation:true,execution:'book_now'}), false);
});

test('normalization handles case, punctuation and invisible characters safely', () => {
  assert.deepEqual(parseVoiceIntent('  MY ORDERS!!  '), {type:'navigate',target:'orders'});
  assert.deepEqual(parseVoiceIntent('home\\u200B'), {type:'navigate',target:'home'});
});

test('voice booking words remain review-only across variants', () => {
  for (const command of ['book','booking','confirm','confirm booking','బుకింగ్','కన్ఫర్మ్']) {
    const intent = parseVoiceIntent(command);
    assert.equal(intent.type, 'review_booking', command);
    assert.equal(intent.execution, 'none', command);
    assert.equal(isAllowedIntent(intent), true, command);
  }
});

test('voice never triggers payment, cancellation, or unknown admin actions', () => {
  for (const command of ['pay','payment','pay now','చెల్లించు','cancel ride','cancel booking','రైడ్ రద్దు','open admin','delete account','send otp']) {
    const intent = parseVoiceIntent(command);
    assert.ok(['blocked_action','unknown'].includes(intent.type), command);
    assert.equal(isAllowedIntent(intent), true, command);
  }
});

test('location sharing or arbitrary address injection is not interpreted as an action', () => {
  for (const command of ['send my location to everyone','share gps','set pickup to 12 Main Street','drop at home']) {
    assert.deepEqual(parseVoiceIntent(command), {type:'unknown',reason:'not_allowlisted'});
  }
});

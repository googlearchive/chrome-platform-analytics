// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit test for UserSamplingChannel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.HitTypes');
goog.require('analytics.ParameterMap');
goog.require('analytics.internal.Identifier');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.UserSamplingChannel');
goog.require('analytics.testing.TestChannel');
goog.require('analytics.testing.TestSettings');
goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


/**
 * @param {number|undefined} sampleRate
 * @param {string} clientIdPart A four hex digit string.
 * @param {boolean} expectHitSent
 * @param {number=} opt_sampleRateOverride
 */
function assertSampled(
    sampleRate, clientIdPart, expectHitSent, opt_sampleRateOverride) {
  var settings = new analytics.testing.TestSettings();
  if (goog.isDef(sampleRate)) {
    settings.setSampleRate(sampleRate);
  }
  var delegate = new analytics.testing.TestChannel();
  var channel = new analytics.internal.UserSamplingChannel(settings, delegate);

  var params = new analytics.ParameterMap(
      analytics.internal.Parameters.CLIENT_ID,
      '04D25678-' + clientIdPart + '-4321-y123-04D256789012');

  var hitType = analytics.HitTypes.APPVIEW;
  if (opt_sampleRateOverride) {
    hitType = analytics.HitTypes.TIMING;
    params.set(
        analytics.internal.Parameters.SAMPLE_RATE_OVERRIDE,
        opt_sampleRateOverride);
  }

  channel.send(hitType, params);
  assertEquals('Failed with sample rate ' + sampleRate +
      ' and client id code ' + clientIdPart,
      expectHitSent, delegate.hitWasSent(params));
}

function testSend_sampleRateDefault() {
  // Default sample rate 100% (scaled rate = 0xFFFF)
  assertSampled(undefined, '0000', true);
  assertSampled(undefined, '270F', true);
  assertSampled(undefined, '04D2', true);
  assertSampled(undefined, '13BA', true);
  assertSampled(undefined, 'FFFF', true);
}

function testSend_sampleRate100() {
  // Sample rate 100% (scaled rate = 0xFFFF)
  assertSampled(100, '0000', true);
  assertSampled(100, '270F', true);
  assertSampled(100, '04D2', true);
  assertSampled(100, '13BA', true);
  assertSampled(100, 'FFFF', true);
}

function testSend_sampleRate50() {
  // Sample rate 50% (scaled rate = 0x8000)
  assertSampled(50, '0000', true);
  assertSampled(50, '1011', true);
  assertSampled(50, '7FFF', true);
  // --- cutoff point ---
  assertSampled(50, '8000', false);
  assertSampled(50, '95BA', false);
  assertSampled(50, 'FFFF', false);
}

function testSend_sampleRate5() {
  // Sample rate 5% (scaled rate = 0x0CCC)
  assertSampled(5, '0000', true);
  assertSampled(5, '099A', true);
  assertSampled(5, '0CCC', true);
  // --- cutoff point ---
  assertSampled(5, '0CCD', false);
  assertSampled(5, '59AB', false);
  assertSampled(5, '909F', false);
  assertSampled(5, 'FFFF', false);
}

function testSend_sampleRateOhPoint5() {
  // Sample rate 0.5% (scaled rate = 0x0147)
  assertSampled(0.5, '0000', true);
  assertSampled(0.5, '0147', true);
  // --- cutoff point ---
  assertSampled(0.5, '0148', false);
  assertSampled(0.5, '0499', false);
  assertSampled(0.5, '1111', false);
  assertSampled(0.5, '270F', false);
  assertSampled(0.5, 'FFFF', false);
}

function testSend_sampleRate0() {
  assertSampled(0, '0000', false);
  assertSampled(0, '270F', false);
  assertSampled(0, '04D2', false);
  assertSampled(0, '13BA', false);
  assertSampled(0, 'FFFF', false);
}

function testSend_sampleRateOverride() {
  assertSampled(5, '0000', true);
  assertSampled(5, '0000', true, 50);
  assertSampled(5, '0CCC', true);
  assertSampled(5, '0CCC', true, 50);
  // --- cutoff point w/o overrides ---
  assertSampled(5, '0CCD', false);
  assertSampled(5, '0CCD', true, 50);
  assertSampled(5, '7FFF', false);
  assertSampled(5, '7FFF', true, 50);
  // --- cutoff point with overrides ---
  assertSampled(5, '8000', false);
  assertSampled(5, '8000', false, 50);
  assertSampled(5, 'FFFF', false);
  assertSampled(5, 'FFFF', false, 50);
}


/**
 * Randomly generate 1,000 client ids (using the actual id generator) and
 * verify that the UserSamplingChannel, with sample rate configured to 25%, only
 * accepts (roughly) 25% of the ids.
 */
function testSend_withRandomIds_sampleRate25() {
  var sampleRate = 25;
  var settings = new analytics.testing.TestSettings();
  settings.setSampleRate(sampleRate);
  var hitsAttempted = 0;
  var hitsSent = 0;
  for (var i = 0; i < 1000; i++) {
    var cid = analytics.internal.Identifier.generateUuid();
    var params = new analytics.ParameterMap();
    params.set(analytics.internal.Parameters.CLIENT_ID, cid);
    var delegate = new analytics.testing.TestChannel();
    var channel =
        new analytics.internal.UserSamplingChannel(settings, delegate);
    channel.send(analytics.HitTypes.APPVIEW, params);
    if (delegate.hitWasSent(params)) hitsSent++;
    hitsAttempted++;
  }
  var sentRate = hitsSent / hitsAttempted * 100;
  assertTrue('Expected ' + sampleRate + '% (+/- 5%) of randomly generated ' +
      'client ids to be sent but actual acceptance rate was ' + sentRate,
      sentRate >= (sampleRate - 5) && sentRate <= (sampleRate + 5));
}


/**
 * Generate 1,000 random ids and verify that they're all accepted when the
 * sample rate is not set (which defaults to 100%.)
 */
function testSend_withRandomIds_sampleRate100() {
  var settings = new analytics.testing.TestSettings();
  for (var i = 0; i < 1000; i++) {
    var cid = analytics.internal.Identifier.generateUuid();
    var params = new analytics.ParameterMap();
    params.set(analytics.internal.Parameters.CLIENT_ID, cid);
    var delegate = new analytics.testing.TestChannel();
    var channel =
        new analytics.internal.UserSamplingChannel(settings, delegate);
    channel.send(analytics.HitTypes.APPVIEW, params);
    assertTrue('All hits should be sent when sample rate is 100',
        delegate.hitWasSent(params));
  }
}


/**
 * Generate 1,000 random ids and verify that they're all rejected when the
 * sample rate is set to 0.
 */
function testSend_withRandomIds_sampleRate0() {
  var settings = new analytics.testing.TestSettings();
  settings.setSampleRate(0);
  for (var i = 0; i < 1000; i++) {
    var cid = analytics.internal.Identifier.generateUuid();
    var params = new analytics.ParameterMap();
    params.set(analytics.internal.Parameters.CLIENT_ID, cid);
    var delegate = new analytics.testing.TestChannel();
    var channel =
        new analytics.internal.UserSamplingChannel(settings, delegate);
    channel.send(analytics.HitTypes.APPVIEW, params);
    assertFalse('All hits should be reject when sample rate is 100',
        delegate.hitWasSent(params));
  }
}

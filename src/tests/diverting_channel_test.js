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
 * @fileoverview Tests for DivertingChannel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.HitTypes');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.internal.DivertingChannel');
goog.require('analytics.internal.Parameters');
goog.require('goog.array');
goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


/** @const {!analytics.ParameterMap} */
var HIT_0 = new analytics.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
    analytics.Parameters.CAMPAIGN_ID, '789'
    );


/** @const {!analytics.ParameterMap} */
var HIT_1 = new analytics.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '11x14',
    analytics.Parameters.CAMPAIGN_ID, '11'
    );


/** @type {!Array.<analytics.internal.DivertingChannel.Capture>} */
var diverted;


/** @type {analytics.internal.Channel} */
var channel;

function setUp() {
  diverted = [];
  channel = new analytics.internal.DivertingChannel(diverted);
}

function testDiverts_Single() {
  channel.send(analytics.HitTypes.EVENT, HIT_0);
  assertEquals(1, diverted.length);
  assertCaptureEquals(diverted[0], analytics.HitTypes.EVENT, HIT_0);
}

function testDiverts_Duplicate() {
  channel.send(analytics.HitTypes.EVENT, HIT_0);
  channel.send(analytics.HitTypes.EVENT, HIT_0);
  assertEquals(2, diverted.length);
  assertCaptureEquals(diverted[0], analytics.HitTypes.EVENT, HIT_0);
  assertCaptureEquals(
      goog.array.peek(diverted), analytics.HitTypes.EVENT, HIT_0);
}

function testDiverts_Different() {
  channel.send(analytics.HitTypes.APPVIEW, HIT_1);
  channel.send(analytics.HitTypes.EVENT, HIT_0);
  assertEquals(2, diverted.length);
  assertCaptureEquals(diverted[0], analytics.HitTypes.APPVIEW, HIT_1);
  assertCaptureEquals(
      goog.array.peek(diverted), analytics.HitTypes.EVENT, HIT_0);
}

function assertCaptureEquals(capture, hitType, parameters) {
  assertEquals(hitType, capture.hitType);
  assertTrue(parameters.equals(capture.parameters));
}

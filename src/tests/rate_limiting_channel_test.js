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
 * @fileoverview Unit test for RateLimitingChannel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.HitTypes');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.RateLimitingChannel');
goog.require('analytics.testing.TestChannel');
goog.require('analytics.testing.TestTokenBucket');
goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


/** @const {!analytics.ParameterMap} */
var HIT_0 = new analytics.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
    analytics.Parameters.CAMPAIGN_ID, '789'
    );


/** @type {analytics.testing.TestChannel} */
var delegate;


/** @type {analytics.testing.TestTokenBucket} */
var tokens;


/** @type {analytics.internal.Channel} */
var channel;

function setUp() {
  delegate = new analytics.testing.TestChannel();
  tokens = new analytics.testing.TestTokenBucket();
  channel = new analytics.internal.RateLimitingChannel(tokens, delegate);
}

function testSendsWithSufficientTokens() {
  tokens.addTokens(1);
  channel.send(analytics.HitTypes.EVENT, HIT_0);
  assertTrue(delegate.hitWasSent(HIT_0));
}

function testDropsHitWithInsufficientTokens() {
  channel.send(analytics.HitTypes.EVENT, HIT_0);
  assertFalse(delegate.hitWasSent(HIT_0));
}

function testDoesNotLimitItemHits() {
  channel.send(analytics.HitTypes.ITEM, HIT_0);
  assertTrue(delegate.hitWasSent(HIT_0));
}

function testDoesNotLimitTransactionHits() {
  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  assertTrue(delegate.hitWasSent(HIT_0));
}

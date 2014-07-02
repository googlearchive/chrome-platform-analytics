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
 * @fileoverview Tests for TokenBucket.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.internal.TokenBucket');

goog.require('goog.testing.jsunit');


/** @const {number} */
var INITIAL_TOKENS = 1;


/** @const {number} */
var MAX_TOKENS = 5;


/** @type {analytics.internal.TokenBucket} */
var bucket;


/** @type {number} */
var time;


/** @type {function(): number} */
var timer =
    /** @return {number} The test time. */
    function() { return time };

function setUp() {
  time = (new Date()).getTime();
  bucket = new analytics.internal.TokenBucket(
      INITIAL_TOKENS,
      MAX_TOKENS,
      analytics.internal.TokenBucket.FillRate.ONE_EVERY_SECOND,
      timer);
}

function testConsumesInitialTokens() {
  assertTrue(bucket.consumeTokens(INITIAL_TOKENS));
}

function testFailsWhenAllTokensConsumed() {
  assertTrue(bucket.consumeTokens(INITIAL_TOKENS));
  assertFalse(bucket.consumeTokens(1));
}

function testNoParitalTokens() {
  assertTrue(bucket.consumeTokens(INITIAL_TOKENS));
  assertFalse(bucket.consumeTokens(1));
  time += 999;
  assertFalse(bucket.consumeTokens(1));
}

function testTokensRefilled() {
  assertTrue(bucket.consumeTokens(INITIAL_TOKENS));
  assertFalse(bucket.consumeTokens(1));
  time += 1000;
  assertTrue(bucket.consumeTokens(1));
  time += 2000;
  assertTrue(bucket.consumeTokens(2));
  assertFalse(bucket.consumeTokens(1));
}

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
 * @fileoverview Simple single aspect "token bucket" implementation.
 * See http://en.wikipedia.org/wiki/Token_bucket for details of the pattern.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.TokenBucket');

goog.require('goog.asserts');



/**
 * @param {number} initialTokens The initial number of tokens in the bucket.
 * @param {number} maxTokens The max number of tokens that can be accumulated.
 * @param {analytics.internal.TokenBucket.FillRate|number} fillRate The number
 *     of tokens to be added per millisecond. Only whole tokens are added.
 * @param {function(): number=} opt_timeSource A function that returns
 *     the current time in milliseconds. Useful for testing or warping
 *     the reality of time. Stick with the former case.
 * @constructor
 * @struct
 */
analytics.internal.TokenBucket = function(
    initialTokens, maxTokens, fillRate, opt_timeSource) {

  goog.asserts.assert(initialTokens >= 0);
  goog.asserts.assert(maxTokens > 0);
  goog.asserts.assert(fillRate >= 0);

  /** @private {number} */
  this.availableTokens_ = initialTokens;

  /** @private {number} */
  this.maxTokens_ = maxTokens;

  /** @private {number} */
  this.fillRate_ = fillRate;

  /** @private {!function(): number} */
  this.timeSource_ =
      opt_timeSource ||
      /** @return {number} */
      function() {
        return (new Date()).getTime();
      };

  /**
   * Timestamp when we last filled the bucket.
   * @private {number}
   */
  this.lastFilled_ = this.timeSource_();
};


/**
 * @param {number} tokens
 * @return {boolean} True if the tokens were available and thusly consumed.
 */
analytics.internal.TokenBucket.prototype.consumeTokens = function(tokens) {
  this.fillTokens_();

  if (tokens > this.availableTokens_) {
    return false;
  }

  this.availableTokens_ -= tokens;
  return true;
};


/**
 * Adds as many tokens to the bucket as are allowed by the configuration.
 * @private
 */
analytics.internal.TokenBucket.prototype.fillTokens_ = function() {
  var now = this.timeSource_();
  var elapsedMillis = (now - this.lastFilled_);
  var tokens = Math.floor(elapsedMillis * this.fillRate_);

  if (tokens > 0) {
    this.availableTokens_ =
        Math.min(this.availableTokens_ + tokens, this.maxTokens_);

    this.lastFilled_ = now;
  }
};


/**
 * @enum {number}
 */
analytics.internal.TokenBucket.FillRate = {
  ONE_EVERY_SECOND: .001,
  ONE_EVERY_TWO_SECONDS: .0005
};

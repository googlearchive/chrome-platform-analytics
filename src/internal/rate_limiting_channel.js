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
 * @fileoverview A Channel that limits the rate at which hits are delegated
 * to a delegate Channel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.RateLimitingChannel');

goog.require('analytics.HitType');
goog.require('analytics.HitTypes');
goog.require('analytics.Results');
goog.require('analytics.internal.Channel');

goog.require('goog.async.Deferred');



/**
 * @constructor
 * @param {!analytics.internal.TokenBucket} tokens
 * @param {!analytics.internal.Channel} delegate
 * @implements {analytics.internal.Channel}
 * @struct
 */
analytics.internal.RateLimitingChannel = function(tokens, delegate) {

  /** @private {!analytics.internal.TokenBucket} */
  this.tokens_ = tokens;

  /** @private {!analytics.internal.Channel} */
  this.delegate_ = delegate;
};


/** @override */
analytics.internal.RateLimitingChannel.prototype.send =
    function(hitType, parameters) {
  return this.canDelegate_(hitType) ?
      this.delegate_.send(hitType, parameters) :
      goog.async.Deferred.succeed(analytics.Results.RATE_LIMITED);
};


/**
 * @param {!analytics.HitType} hitType
 * @return {boolean} True if we can delegate the hit.
 * @private
 */
analytics.internal.RateLimitingChannel.prototype.canDelegate_ =
    function(hitType) {
  return this.tokens_.consumeTokens(1) ||
      hitType == analytics.HitTypes.ITEM ||
      hitType == analytics.HitTypes.TRANSACTION;
};

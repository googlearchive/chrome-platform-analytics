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
 * @fileoverview Test communication channel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.testing.TestChannel');

goog.require('analytics.EventBuilder');
goog.require('analytics.ParameterMap');
goog.require('analytics.internal.DivertingChannel');
goog.require('analytics.internal.HasChannel');
goog.require('analytics.internal.parameters');
goog.require('goog.array');
goog.require('goog.async.Deferred');
goog.require('goog.string.format');
goog.require('goog.testing.asserts');



/**
 * @constructor
 * @param {string=} opt_name A name useful for identifying the channel during
 *     testing.
 * @extends {analytics.internal.DivertingChannel}
 * @implements {analytics.internal.HasChannel}
 * @struct
 */
analytics.testing.TestChannel = function(opt_name) {

  /**
   * @private {string}
   */
  this.name_ = opt_name || 'Unnamed TestChannel';

  /**
   * @private {!Array.<!analytics.internal.DivertingChannel.Capture>}
   */
  this.sent_ = [];

  analytics.testing.TestChannel.base(this, 'constructor', this.sent_);
};
goog.inherits(analytics.testing.TestChannel,
    analytics.internal.DivertingChannel);


/** @typedef {!analytics.Parameter|string} */
analytics.testing.TestChannel.Key_;


/** @override */
analytics.testing.TestChannel.prototype.getChannel = function() {
  return this;
};


/**
 * @param {!analytics.ParameterMap} expected
 * @return {boolean} True if the hit was previously sent.
 */
analytics.testing.TestChannel.prototype.hitWasSent = function(expected) {
  return goog.array.some(
      this.sent_,
      /** @return {boolean} */
      function(capture) {
        return expected.equals(capture.parameters);
      });
};


/**
 * @param {!analytics.HitType} hitType
 * @param {!analytics.ParameterMap} params
 *
 * @return {boolean} True if such a hit was sent.
 * @private
 */
analytics.testing.TestChannel.prototype.hasHit_ = function(hitType, params) {
  return goog.array.some(
      this.sent_,
      /** @return {boolean} */
      function(capture) {
        return hitType == capture.hitType && params.equals(capture.parameters);
      });
};


/**
 * Finds the the entry in the last hit and returns the value.
 * @param {!analytics.testing.TestChannel.Key_} key
 * @return {analytics.Value} Undefined if it is not present.
 */
analytics.testing.TestChannel.prototype.findValue = function(key) {
  var param = analytics.internal.parameters.asParameter(key);

  /** @type {analytics.Value} */
  var found;

  if (this.sent_.length > 0) {
    var capture = /** @type {!analytics.internal.DivertingChannel.Capture} */ (
        goog.array.peek(this.sent_));

    capture.parameters.forEachEntry(
        /**
         * @param {!analytics.Parameter} k
         * @param {!analytics.Value} v
         */
        function(k, v) {
          if (k.name == param.name) {
            found = v;
          }
        });
  }

  return found;
};


/**
 * @param {!analytics.testing.TestChannel.Key_} key
 * @param {!analytics.Value} value
 * @return {boolean} True if the last hit has a param with the supplied
 *     key and value.
 */
analytics.testing.TestChannel.prototype.lastHitHasEntry =
    function(key, value) {
  return this.findValue(key) == value;
};


/**
 * @param {!analytics.ParameterMap} expected
 */
analytics.testing.TestChannel.prototype.assertHitSent = function(expected) {
  if (!this.hitWasSent(expected)) {
    goog.testing.asserts.raiseException(
        'Call to assertHitSent failed.',
        goog.string.format('Hit %s was not sent.', expected.toString()));
  }
};


/**
 * @param {!analytics.EventBuilder} expected
 */
analytics.testing.TestChannel.prototype.assertEventSent = function(expected) {
  var expectedParams = new analytics.ParameterMap();
  expected.collect(expectedParams);
  assertTrue(this.hasHit_(analytics.HitTypes.EVENT, expectedParams));
};


/**
 * @param {!analytics.testing.TestChannel.Key_} key
 * @param {!analytics.Value} value
 */
analytics.testing.TestChannel.prototype.assertLastHitHasEntry =
    function(key, value) {
  if (!this.lastHitHasEntry(key, value)) {
    /** @type {!analytics.Parameter} */
    var param = analytics.internal.parameters.asParameter(key);
    var msg = 'Last hit %s does not contain entry {%s: %s}.';
    var last = goog.array.peek(this.sent_);
    assertTrue('Failed. No hits available to test.', this.sent_.length > 0);
    goog.testing.asserts.raiseException(
        'Call to assertLastHitHasEntry failed.',
        goog.string.format(msg,
            last['parameters'].toString(),
            param.name, (value).toString()));
  }
};


/**
 * @param {number} numHits
 */
analytics.testing.TestChannel.prototype.assertNumHitsSent =
    function(numHits) {
  if (this.sent_.length != numHits) {
    var msg = 'Expected %s hits sent, but was %s.';
    goog.testing.asserts.raiseException(
        'Call to assertNumHitsSent failed.',
        goog.string.format(msg, numHits, this.sent_.length));
  }
};


/**
 * Reset test channel back to a shiney new like state.
 */
analytics.testing.TestChannel.prototype.reset = function() {
  goog.array.clear(this.sent_);
};


/** @override */
analytics.testing.TestChannel.prototype.toString = function() {
  return goog.string.format(
      'analytics.TestChannel{name=%s, numHits=%s}',
      this.name_,
      this.sent_.length);
};

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
 * @fileoverview Simplified, test centered, typesafe call recording. Similar
 * to {@code goog.testing.recordFunction} but assertion based as opposed to
 * spy style.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.testing.SingleArgRecorder');

goog.require('goog.string.format');



/**
 * @constructor
 * @template T
 * @struct
 */
analytics.testing.SingleArgRecorder = function() {

  /** @private {!Array.<T>} */
  this.recorded_ = [];

  /** @private {!function(T)} */
  this.recorder_ = goog.bind(
      /** @param {T} arg */
      function(arg) {
        this.recorded_.push(arg);
      }, this);
};


/**
 * Returns the recorder function.
 * @return {!function(T)}
 */
analytics.testing.SingleArgRecorder.prototype.get = function() {
  return this.recorder_;
};


/**
 * Asserts that the recorder was called with the expected value.
 * @param {T} expected Expected value.
 * @param {number=} opt_index Optional call index. Defaults to 0.
 */
analytics.testing.SingleArgRecorder.prototype.assertRecorded =
    function(expected, opt_index) {
  var index = opt_index || 0;
  if (index > this.recorded_.length - 1) {
    var msg = goog.string.format(
        'No matching call. %s calls recorded, requested index was %s.',
        this.recorded_.length,
        index);
    goog.testing.asserts.raiseException('Call to assertRecorded failed.', msg);
  }

  var actual = this.recorded_[index];
  if (actual != expected) {
    var msg = goog.string.format(
        'Expected %s, but was %s.', expected, actual);
    goog.testing.asserts.raiseException('Call to assertRecorded failed.', msg);
  }
};


/**
 * Asserts that the recorder was called n times.
 * @param {number} expected Expected times called.
 */
analytics.testing.SingleArgRecorder.prototype.assertTimesCalled =
    function(expected) {
  if (expected != this.recorded_.length) {
    var msg = goog.string.format(
        'Unexpected number of calls. Expected %s calls, was %s.',
        expected,
        this.recorded_.length);
    goog.testing.asserts.raiseException(
        'Call to assertTimesCalled failed.', msg);
  }
};

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
 * @fileoverview A channel that diverts {@code send} calls to a supplied
 * {@code Array} in the form of a
 * {@code analytics.internal.DivertingChannel.Capture}.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.DivertingChannel');

goog.require('analytics.internal.Channel');

goog.require('goog.async.Deferred');



/**
 * @constructor
 * @param {!Array.<!analytics.internal.DivertingChannel.Capture>} destination
 * @implements {analytics.internal.Channel}
 * @struct
 */
analytics.internal.DivertingChannel = function(destination) {

  /** @private {!Array.<!analytics.internal.DivertingChannel.Capture>} */
  this.destination_ = destination;
};


/**
 * @typedef {{
 *   hitType: !analytics.HitType,
 *   parameters: !analytics.ParameterMap
 * }}
 */
analytics.internal.DivertingChannel.Capture;


/** @override */
analytics.internal.DivertingChannel.prototype.send =
    function(hitType, parameters) {
  this.destination_.push({
    hitType: hitType,
    parameters: parameters
  });
  return goog.async.Deferred.succeed();
};

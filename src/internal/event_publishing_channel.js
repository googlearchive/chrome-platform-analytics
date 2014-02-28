// Copyright 2014 Google Inc. All Rights Reserved.
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
 * @fileoverview Channel that publishes an event when a hit is sent.
 *
 * @author smckay@google.com (Steve McKay)
 * @author kenobi@google.com (Ben Kwa)
 */

goog.provide('analytics.internal.EventPublishingChannel');

goog.require('analytics.Tracker.HitEvent');
goog.require('analytics.internal.Channel');

goog.require('goog.async.Deferred');



/**
 * @constructor
 * @implements {analytics.internal.Channel}
 * @struct
 *
 * @param {!goog.events.EventTarget} eventTarget
 * @param {!analytics.internal.Channel} delegate
 */
analytics.internal.EventPublishingChannel = function(eventTarget, delegate) {

  /** @private {!goog.events.EventTarget} */
  this.eventTarget_ = eventTarget;

  /** @private {!analytics.internal.Channel} */
  this.delegate_ = delegate;
};


/** @override */
analytics.internal.EventPublishingChannel.prototype.send =
    function(hitType, parameters) {
  this.eventTarget_.dispatchEvent(
      new analytics.Tracker.HitEvent(hitType, parameters));
  return this.delegate_.send(hitType, parameters);
};

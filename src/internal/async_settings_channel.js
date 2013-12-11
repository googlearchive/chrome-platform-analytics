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
 * @fileoverview A channel that adds missing or useful attributes needed
 * to complete the sending of a hit. This allows the addition of information
 * not available at the time the tracker was initialized such as user id.
 * For this reason it should be ahead of any channels in the channel pipeline
 * depending on the user id.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.AsyncSettingsChannel');

goog.require('analytics.internal.Channel');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.Settings');



/**
 * @constructor
 * @param {!analytics.internal.Settings} settings A "ready" settings object.
 * @param {!analytics.internal.Channel} delegate
 * @implements {analytics.internal.Channel}
 * @struct
 */
analytics.internal.AsyncSettingsChannel = function(settings, delegate) {

  /** @private {!analytics.internal.Settings} */
  this.settings_ = settings;

  /** @private {!analytics.internal.Channel} */
  this.delegate_ = delegate;
};


/** @override */
analytics.internal.AsyncSettingsChannel.prototype.send =
    function(hitType, parameters) {
  parameters.set(
      analytics.internal.Parameters.CLIENT_ID, this.settings_.getUserId());
  return this.delegate_.send(hitType, parameters);
};

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
 * @fileoverview Test implementation of
 *     {@code analytics.internal.ChannelManager}.
 *
 * @author smckay@google.com (Steve McKay)
 */

goog.provide('analytics.testing.TestChannelManager');

goog.require('analytics.internal.ChannelManager');
goog.require('analytics.testing.TestChannel');



/**
 * @constructor
 * @implements {analytics.internal.ChannelManager}
 * @struct
 */
analytics.testing.TestChannelManager = function() {
  /** @private {!analytics.testing.TestChannel} */
  this.channel_ = new analytics.testing.TestChannel();
};


/** @return {!analytics.testing.TestChannel} */
analytics.testing.TestChannelManager.prototype.getTestChannel =
    function() {
  return this.channel_;
};


/** @override */
analytics.testing.TestChannelManager.prototype.createServiceChannel =
    function(settings, eventTarget) {
  return this.getTestChannel();
};

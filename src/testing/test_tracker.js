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
 * @fileoverview Test tracker implementation. Use this to test your
 * code that interacts w/ a tracker (which should be most of your GA aware
 * code).
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.testing.TestTracker');

goog.require('analytics.internal.ServiceTracker');
goog.require('analytics.testing.TestChannelManager');
goog.require('analytics.testing.TestSettings');



/**
 * @constructor
 * @extends {analytics.internal.ServiceTracker}
 * @struct
 */
analytics.testing.TestTracker = function() {
  var channelManager = new analytics.testing.TestChannelManager();
  /** @private {!analytics.testing.TestChannel} */
  this.testChannel_ = channelManager.getTestChannel();

  analytics.testing.TestTracker.base(
      this,
      'constructor',
      new analytics.testing.TestSettings(),
      channelManager);
};
goog.inherits(
    analytics.testing.TestTracker,
    analytics.internal.ServiceTracker);


/**
 * @return {!analytics.testing.TestChannel}
 *     the test channel owned by this TestTracker.
 */
analytics.testing.TestTracker.prototype.getTestChannel = function() {
  return this.testChannel_;
};

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
 * @fileoverview Dummy communication channel does not not report hits or
 * other information back to Google Analytics. This should be used when
 * the user is either opted out or sampled out of reporting.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.DummyChannel');

goog.require('analytics.internal.Channel');

goog.require('goog.async.Deferred');



/**
 * @constructor
 * @implements {analytics.internal.Channel}
 * @struct
 */
analytics.internal.DummyChannel = function() {
};
goog.addSingletonGetter(analytics.internal.DummyChannel);


/** @override */
analytics.internal.DummyChannel.prototype.send = function(hitType, parameters) {
  // Don't report the hit. Just let the caller know it was handled.
  return goog.async.Deferred.succeed();
};

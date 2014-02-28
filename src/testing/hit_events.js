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
 * @fileoverview Code for test clients to easily create HitEvents for testing.
 *
 * @author kenobi@google.com (Ben Kwa)
 */

goog.provide('analytics.testing.HitEvents');

goog.require('analytics.Tracker.HitEvent');
goog.require('analytics.internal.ParameterMap');


/**
 * Returns a HitEvent representing an appView.
 * @param {string} description
 * @return {!analytics.Tracker.HitEvent}
 */
analytics.testing.HitEvents.createHitEvent = function(description) {
  var hit = new analytics.internal.ParameterMap(
      analytics.Parameters.DESCRIPTION, description);
  return new analytics.Tracker.HitEvent(analytics.HitTypes.APPVIEW, hit);
};

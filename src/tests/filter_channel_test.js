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
 * @fileoverview Tests for EventPublishingChannel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author kenobi@google.com (Ben Kwa)
 */

goog.setTestOnly();

goog.require('analytics.HitTypes');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.Tracker');
goog.require('analytics.internal.FilterChannel');
goog.require('analytics.internal.Parameters');
goog.require('analytics.testing.TestChannel');

goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/** @const {!analytics.ParameterMap} */
var PARAMS = new analytics.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
    analytics.Parameters.CAMPAIGN_ID, '789'
    );

var recorder;


/** @type {analytics.testing.TestChannel} */
var delegateChannel;


/** @type {analytics.internal.Channel} */
var channel;


function setUp() {
  recorder = goog.testing.recordFunction();
  delegateChannel = new analytics.testing.TestChannel();
  channel = new analytics.internal.FilterChannel(delegateChannel);
}

function testDelegates_NoFilters() {
  channel.send(analytics.HitTypes.EVENT, PARAMS);
  delegateChannel.assertHitSent(PARAMS);
}

function testDelegates_PostFilter() {
  channel.addFilter(recorder);
  channel.send(analytics.HitTypes.EVENT, PARAMS);
  delegateChannel.assertHitSent(PARAMS);
}

function testDelegates_ConveysMutation() {
  var expected = PARAMS.clone();
  expected.remove(analytics.internal.Parameters.SCREEN_RESOLUTION);
  channel.addFilter(
      /** @param {!analytics.Tracker.Hit} hit */
      function(hit) {
        hit.getParameters().remove(
            analytics.internal.Parameters.SCREEN_RESOLUTION);
      });
  channel.send(analytics.HitTypes.EVENT, PARAMS);
  delegateChannel.assertHitSent(expected);
}

function testDoesNotDelegate_WhenHitCanceled() {
  channel.addFilter(
      /** @param {!analytics.Tracker.Hit} hit */
      function(hit) {
        hit.cancel();
      });
  channel.send(analytics.HitTypes.EVENT, PARAMS);
  delegateChannel.assertNumHitsSent(0);
}

function testDoesNotApplyNextFilter_WhenHitCanceled() {
  channel.addFilter(
      /** @param {!analytics.Tracker.Hit} hit */
      function(hit) {
        hit.cancel();
      });
  channel.addFilter(recorder);
  channel.send(analytics.HitTypes.EVENT, PARAMS);
  recorder.assertCallCount(0);
}

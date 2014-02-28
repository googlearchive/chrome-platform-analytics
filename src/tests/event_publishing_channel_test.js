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

goog.require('analytics.HitTypes');
goog.require('analytics.Parameters');
goog.require('analytics.internal.EventPublishingChannel');
goog.require('analytics.internal.ParameterMap');
goog.require('analytics.internal.Parameters');

goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


/** @const {!analytics.internal.ParameterMap} */
var HIT_0 = new analytics.internal.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
    analytics.Parameters.CAMPAIGN_ID, '789'
    );


/** @type {!Array.<!analytics.Tracker.HitEvent>} */
var events;


/** @type {analytics.internal.Channel} */
var channel;

function setUp() {
  events = [];
  var target = new goog.events.EventTarget();
  channel = new analytics.internal.EventPublishingChannel(
      target, analytics.internal.DummyChannel.getInstance());
  target.listen(
      analytics.Tracker.HitEvent.EVENT_TYPE,
      function(event) {
        events.push(event);
      });
}

function testPublishesEvent() {
  channel.send(analytics.HitTypes.EVENT, HIT_0);
  assertEquals(1, events.length);
  var event = events[0];
  assertEquals(analytics.HitTypes.EVENT, event.getHitType());
  assertEquals(
      JSON.stringify(HIT_0.toObject()),
      JSON.stringify(event.getHit()));
}

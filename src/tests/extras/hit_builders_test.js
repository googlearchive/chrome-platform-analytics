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
 * @fileoverview Tests for classes in {@code hit_builders.js}.
 *
 * @author smckay@google.com (Steve McKay)
 */

goog.setTestOnly();

goog.require('analytics.EventBuilder');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.testing.TestTracker');
goog.require('goog.testing.jsunit');


/** @type {!analytics.testing.TestTracker} */
var tracker;


/** @type {!analytics.testing.TestChannel} */
var channel;


function setUp() {
  tracker = new analytics.testing.TestTracker();
  channel = tracker.getTestChannel();
}


function testEventBuilder() {
  analytics.EventBuilder.builder().
      category('mycategory').
      action('myaction').
      value(11).
      dimension({index: 11, value: 'abc'}).
      metric({index: 11, value: 123}).
      send(tracker);

  channel.assertHitSent(
      new analytics.ParameterMap(
          analytics.Parameters.EVENT_CATEGORY, 'mycategory',
          analytics.Parameters.EVENT_ACTION, 'myaction',
          analytics.Parameters.EVENT_VALUE, 11,
          analytics.createDimensionParam(11), 'abc',
          analytics.createMetricParam(11), 123));
}

function testEventBuilder_NoDuplicateParameters() {
  analytics.EventBuilder.builder().
      category('mycategory').
      category('hiscategory').
      category('yourcategory').
      send(tracker);

  channel.assertHitSent(
      new analytics.ParameterMap(
          analytics.Parameters.EVENT_CATEGORY, 'yourcategory'));
}

function testEventBuilder_InstancesImmutable() {
  var builder = analytics.EventBuilder.builder();

  builder.category('mycategory').send(tracker);

  channel.assertHitSent(
      new analytics.ParameterMap(
          analytics.Parameters.EVENT_CATEGORY, 'mycategory'));

  channel.reset();

  builder.action('myaction').send(tracker);

  channel.assertHitSent(
      new analytics.ParameterMap(
          analytics.Parameters.EVENT_ACTION, 'myaction'));
}

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
 * @fileoverview Tests for ParameterFilterChannel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.HitTypes');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.internal.DummyChannel');
goog.require('analytics.internal.ParameterFilterChannel');
goog.require('analytics.internal.Parameters');
goog.require('goog.testing.jsunit');


/** @type {analytics.internal.Channel} */
var channel;


/** @const {!analytics.ParameterMap} */
var params;


function setUp() {
  params = new analytics.ParameterMap();
  channel = new analytics.internal.ParameterFilterChannel(
      analytics.internal.DummyChannel.getInstance());
}

function testSend_TruncatesGreedyStrings() {
  var value = Array(analytics.Parameters.SOCIAL_ACTION.maxLength + 2).join('a');
  assertTrue(value.length > analytics.Parameters.SOCIAL_ACTION.maxLength);
  params.set(analytics.Parameters.SOCIAL_ACTION, value);
  channel.send(analytics.HitTypes.SOCIAL, params);
  var actual = params.get(analytics.Parameters.SOCIAL_ACTION);
  assertEquals(analytics.Parameters.SOCIAL_ACTION.maxLength, actual.length);
}

function testSend_RemovesParametersWithDefaultValues() {
  params.set(analytics.Parameters.EX_FATAL, '1');
  channel.send(analytics.HitTypes.TRANSACTION, params);
  assertNull(params.get(analytics.Parameters.EX_FATAL));
}

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
 * @fileoverview Test for AsyncSettingsChannel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.HitTypes');
goog.require('analytics.ParameterMap');
goog.require('analytics.internal.AsyncSettingsChannel');
goog.require('analytics.internal.Parameters');
goog.require('analytics.testing.TestChannel');
goog.require('analytics.testing.TestSettings');
goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


/** @const {!analytics.testing.TestSettings} */
var settings;


/** @type {analytics.testing.TestChannel} */
var tester;


/** @type {analytics.internal.Channel} */
var channel;


/** @type {!analytics.ParameterMap} */
var params;

function setUp() {
  settings = new analytics.testing.TestSettings();
  tester = new analytics.testing.TestChannel();
  channel = new analytics.internal.AsyncSettingsChannel(settings, tester);
  params = new analytics.ParameterMap();
}

function testSend_AddsClientId() {
  channel.send(analytics.HitTypes.EVENT, params);
  tester.assertLastHitHasEntry(
      analytics.internal.Parameters.CLIENT_ID, settings.getUserId());
}

function testSend_ReplacesExistingClientId() {
  params.set(analytics.internal.Parameters.CLIENT_ID,
      analytics.internal.Identifier.generateUuid());
  channel.send(analytics.HitTypes.EVENT, params);
  tester.assertLastHitHasEntry(
      analytics.internal.Parameters.CLIENT_ID, settings.getUserId());
}

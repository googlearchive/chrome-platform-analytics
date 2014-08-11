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
 * @fileoverview Unit test for ServiceChannelManager.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.internal.ServiceChannelManager');
goog.require('analytics.testing.TestChannel');
goog.require('analytics.testing.TestSettings');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/** @const {!analytics.ParameterMap} */
var HIT_0 = new analytics.ParameterMap(
    analytics.Parameters.CAMPAIGN_ID, '789');


/** @type {!analytics.testing.TestSettings} */
var settings;


/** @type {!analytics.testing.TestChannel} */
var testChannel;


/** @type {!analytics.internal.ChannelManager} */
var manager;


var recorder;


function setUp() {
  recorder = goog.testing.recordFunction();
  settings = new analytics.testing.TestSettings();
  settings.setTrackingPermitted(true);
  testChannel = new analytics.testing.TestChannel('DummyChannel');
  manager = new analytics.internal.ServiceChannelManager(settings, testChannel);
}

function testProducesNonNullChannel() {
  assertNotNull(manager.getChannel());
}

function testInstallsFilters_BeforeSettingsReady() {
  manager.addFilter(recorder);
  settings.becomeReady();
  manager.getChannel().send(analytics.HitTypes.TRANSACTION, HIT_0);
  recorder.assertCallCount(1);
}

function testInstallsFilters_AfterSettingsReady() {
  settings.becomeReady();
  manager.addFilter(recorder);
  manager.getChannel().send(analytics.HitTypes.TRANSACTION, HIT_0);
  recorder.assertCallCount(1);
}

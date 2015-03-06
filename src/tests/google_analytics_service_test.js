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
 * @fileoverview Unit test for GoogleAnalyticsService.
 *
 * @author kenobi@google.com (Ben Kwa)
 */

goog.setTestOnly();

goog.require('analytics.GoogleAnalytics');
goog.require('analytics.HitTypes');
goog.require('analytics.LIBRARY_VERSION');
goog.require('analytics.Tracker');
goog.require('analytics.internal.GoogleAnalyticsService');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.ServiceChannel');
goog.require('analytics.testing.TestChannel');
goog.require('analytics.testing.TestChannelManager');
goog.require('analytics.testing.TestSettings');

goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


/** @const {string} */
var LIB_VERSION = 'ca1.6.0';


/** @const {string} */
var APP_NAME = 'TestApp';


/** @const {string} */
var APP_VERSION = '1.2.3';


/** @const {string} */
var TRACKING_ID = 'UA-12344-56779';


/** @type {!analytics.testing.TestSettings} */
var settings;


/** @type {!analytics.internal.GoogleAnalyticsService} */
var service;


/** @type {!analytics.testing.TestChannelManager} */
var channelManager;


/** @type {!analytics.testing.TestChannel} */
var enabledChannel;


/** @type {!analytics.testing.TestChannel} */
var disabledChannel;


/** @type {!analytics.Tracker} */
var tracker;


function setUp() {
  channelManager = new analytics.testing.TestChannelManager();
  enabledChannel = channelManager.getTestChannel();
  disabledChannel = new analytics.testing.TestChannel('DisabledTestChannel');
}


function testAppliesSettingsChangesMadePriorToReady() {
  initSettings(false, false);
  initService();
  service.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(true);
      });
  assertFalse(settings.isTrackingPermitted());
  settings.becomeReady();
  assertTrue(settings.isTrackingPermitted());
}

function testDisableTracking_PersistsSetting() {
  initSettings(true, true);
  initService();
  service.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(false);
      });
  assertFalse(settings.isTrackingPermitted());
}

function testEnableTracking_PersistsSetting() {
  initSettings(true, false);
  initService();
  service.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(true);
      });
  assertTrue(settings.isTrackingPermitted());
}

function testGetTracker_InstallsLibraryAndAppAndTrackingFields() {
  initSettings(true, true);
  initService();
  tracker = service.getTracker(TRACKING_ID);
  tracker.send(analytics.HitTypes.EVENT);

  enabledChannel.assertLastHitHasEntry(
      analytics.internal.Parameters.LIBRARY_VERSION, LIB_VERSION);
  enabledChannel.assertLastHitHasEntry(
      analytics.internal.Parameters.API_VERSION, 1);
  enabledChannel.assertLastHitHasEntry(
      analytics.internal.Parameters.API_VERSION, 1);
  enabledChannel.assertLastHitHasEntry(
      analytics.internal.Parameters.TRACKING_ID, TRACKING_ID);
  enabledChannel.assertLastHitHasEntry(
      analytics.internal.Parameters.APP_NAME, APP_NAME);
  enabledChannel.assertLastHitHasEntry(
      analytics.internal.Parameters.APP_VERSION, APP_VERSION);
}

function testGetTracker_AutofillsEnvironmentalParams() {
  initSettings(true, true);
  initService();
  tracker = service.getTracker(TRACKING_ID);
  tracker.send(analytics.HitTypes.EVENT);

  assertTrue(/^[a-z]+-[A-Za-z]+$/.test(
      enabledChannel.findValue(analytics.internal.Parameters.LANGUAGE)));
  assertTrue(/^[0-9]+-bit$/.test(
      enabledChannel.findValue(analytics.internal.Parameters.SCREEN_COLORS)));
  assertTrue(/^[0-9]+x[0-9]+$/.test(
      enabledChannel.findValue(
          analytics.internal.Parameters.SCREEN_RESOLUTION)));
  assertTrue(/^[0-9]+x[0-9]+$/.test(
      enabledChannel.findValue(analytics.internal.Parameters.VIEWPORT_SIZE)));
}


/**
 * @param {boolean} ready
 * @param {boolean} trackingEnabled
 */
function initSettings(ready, trackingEnabled) {
  settings = new analytics.testing.TestSettings();
  if (ready) {
    settings.becomeReady();
  }
  settings.setTrackingPermitted(trackingEnabled);
}


function initService() {
  service = new analytics.internal.GoogleAnalyticsService(
      analytics.LIBRARY_VERSION,
      APP_NAME,
      APP_VERSION,
      settings,
      channelManager);
}

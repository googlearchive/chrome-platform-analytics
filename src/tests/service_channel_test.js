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
 * @fileoverview Unit test for ServiceChannel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.require('analytics.Config');
goog.require('analytics.HitTypes');
goog.require('analytics.Parameters');
goog.require('analytics.internal.ParameterMap');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.ServiceChannel');
goog.require('analytics.testing.TestChannel');
goog.require('analytics.testing.TestSettings');

goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


/** @const {string} */
var LIB_VERSION = 'ca1';


/** @const {string} */
var APP_NAME = 'TestApp';


/** @const {string} */
var APP_VERSION = 'egpcciddnadbknkjpmdoaiqnbcoeplja';


/** @const {string} */
var TRACKING_ID = 'UA-12344-56779';


/** @const {!analytics.internal.ParameterMap} */
var HIT_0 = new analytics.internal.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
    analytics.Parameters.CAMPAIGN_ID, '789');


/** @const {!analytics.internal.ParameterMap} */
var HIT_1 = new analytics.internal.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '22x44',
    analytics.Parameters.CAMPAIGN_ID, '11');


/** @type {!analytics.testing.TestSettings} */
var settings;


/** @type {!analytics.testing.TestChannel} */
var enabledChannel;


/** @type {!analytics.testing.TestChannel} */
var disabledChannel;


/** @type {!analytics.internal.Channel} */
var channel;


/** @type {!analytics.Tracker} */
var tracker;


function setUp() {
  enabledChannel = new analytics.testing.TestChannel('EnabledTestChannel');
  disabledChannel = new analytics.testing.TestChannel('DisabledTestChannel');

  initSettings(true, true);
  initChannel();
}

function testSettingsReady_ConstructsChannelPipeline() {
  initSettings(false, true);

  var channelConstructed = false;
  initChannel(
      function(settings) {
        channelConstructed = true;
        return enabledChannel;
      });

  assertFalse(channelConstructed);
  settings.becomeReady();
  assertTrue(channelConstructed);
}


/**
 * Guarantees that the service channel buffers hits until the
 * settings object becomes ready, AND drains those hits into the
 * ready-and-waiting system after settings became ready.
 */
function testSettingsReady_SendsDivertedHits() {
  initSettings(false, true);
  initChannel();

  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  channel.send(analytics.HitTypes.APPVIEW, HIT_1);
  enabledChannel.assertNumHitsSent(0);
  settings.becomeReady();
  enabledChannel.assertNumHitsSent(2);
  enabledChannel.assertHitSent(HIT_0);
  enabledChannel.assertHitSent(HIT_1);
}

function testHonorsInitialSettings_TrackingPermitted() {
  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  enabledChannel.assertHitSent(HIT_0);
}

function testHonorsInitialSettings_TrackingNotPermitted() {
  initSettings(true, false);
  initChannel();
  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  disabledChannel.assertHitSent(HIT_0);
}

function testAppliesSettingsChangesMadePriorToReady() {
  initSettings(false, false);
  initChannel();
  channel.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(true);
      });
  assertFalse(settings.isTrackingPermitted());
  settings.becomeReady();
  assertTrue(settings.isTrackingPermitted());
}

function testDisableTracking_RoutesHitsToDisabledChannel() {
  channel.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(false);
      });
  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  disabledChannel.assertHitSent(HIT_0);
}

function testEnableTracking_RoutesHitsToEnabledChannel() {
  initSettings(true, false);
  initChannel();
  channel.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(true);
      });
  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  enabledChannel.assertHitSent(HIT_0);
}

function testDisableTracking_PersistsSetting() {
  channel.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(false);
      });
  assertFalse(settings.isTrackingPermitted());
}

function testEnableTracking_PersistsSetting() {
  initSettings(true, false);
  initChannel();
  channel.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(true);
      });
  assertTrue(settings.isTrackingPermitted());
}

function testGetTracker_ReturnsNonNull() {
  tracker = channel.getTracker(TRACKING_ID);
  assertNotNull(tracker);
}

// TODO(smckay): In a future CL default value init
// will be moved to another Channel. This test will move
// elsewhere.
function testGetTracker_InstallsLibrarayAndAppAndTrackingFields() {
  tracker = channel.getTracker(TRACKING_ID);
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


// TODO(smckay): In a future CL default value init
// will be moved to another Channel. This test will move
// elsewhere.
function testGetTracker_AutofillsEnvironmentalParams() {
  tracker = channel.getTracker(TRACKING_ID);
  tracker.send(analytics.HitTypes.EVENT);

  assertTrue(/^[a-z]+-[A-Z]+$/.test(
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


/**
 * @param {(function(!analytics.internal.Settings):
 *     !analytics.internal.Channel)=} opt_channelFactory
 */
function initChannel(opt_channelFactory) {
  var channelFactory = opt_channelFactory ||
      function(settings) {
        return enabledChannel;
      };
  channel = new analytics.internal.ServiceChannel(
      LIB_VERSION, APP_NAME, APP_VERSION,
      settings,
      channelFactory,
      disabledChannel);
}

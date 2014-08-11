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

goog.setTestOnly();

goog.require('analytics.Config');
goog.require('analytics.HitTypes');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.ServiceChannel');
goog.require('analytics.testing.TestChannel');
goog.require('analytics.testing.TestSettings');
goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


/** @const {!analytics.ParameterMap} */
var HIT_0 = new analytics.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
    analytics.Parameters.CAMPAIGN_ID, '789');


/** @const {!analytics.ParameterMap} */
var HIT_1 = new analytics.ParameterMap(
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
  initSettings(true, true);
  initChannel();
  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  enabledChannel.assertHitSent(HIT_0);
}

function testHonorsInitialSettings_TrackingNotPermitted() {
  initSettings(true, false);
  initChannel();
  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  disabledChannel.assertHitSent(HIT_0);
}

function testDisableTracking_RoutesHitsToDisabledChannel() {
  initSettings(true, true);
  initChannel();
  settings.whenReady().addCallback(
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
  settings.whenReady().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(true);
      });
  channel.send(analytics.HitTypes.TRANSACTION, HIT_0);
  enabledChannel.assertHitSent(HIT_0);
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
      settings,
      channelFactory,
      disabledChannel);
}

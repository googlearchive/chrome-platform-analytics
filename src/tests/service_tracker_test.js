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
 * @fileoverview Tests for Tracker.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.require('analytics.HitTypes');
goog.require('analytics.Parameters');
goog.require('analytics.internal.ParameterMap');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.ServiceTracker');
goog.require('analytics.internal.parameters');
goog.require('analytics.testing.TestChannel');

goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');


/** @const {!analytics.internal.ParameterMap} */
var HIT_0 = new analytics.internal.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
    analytics.Parameters.CAMPAIGN_ID, '789'
    );


/** @const {!analytics.AppViewHit} */
var APPVIEW_HIT = {
  description: 'MainScreen'};


/** @const {!analytics.EventHit} */
var EVENT_HIT = {
  eventCategory: 'poodles',
  eventAction: 'wrangle',
  eventLabel: '',
  eventValue: 0};


/** @const {!analytics.SocialHit} */
var SOCIAL_HIT = {
  socialNetwork: 'Google Plus',
  socialAction: 'Share',
  socialTarget: 'Marcia Brady'};


/** @const {!analytics.ExceptionHit} */
var EXCEPTION_HIT = {
  exDescription: 'angry birds',
  exFatal: true};


/** @const {!analytics.TimingHit} */
var TIMING_HIT = {
  timingCategory: 'Performance',
  timingVar: 'Busy Loop',
  timingLabel: 'bzzz',
  timingValue: 11};


/** @type {goog.testing.PropertyReplacer} */
var replacer;


/** @type {!analytics.testing.TestChannel} */
var channel;


/** @type {!analytics.internal.ServiceTracker} */
var tracker;


/** @type {!Object} */
var extraParams;

function setUp() {
  replacer = new goog.testing.PropertyReplacer();
  channel = new analytics.testing.TestChannel();
  tracker = new analytics.internal.ServiceTracker(
      channel,
      new goog.events.EventTarget());
  extraParams = {};
}

function tearDown() {
  replacer.reset();
}

function testSend() {
  tracker.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  tracker.set(analytics.Parameters.CAMPAIGN_ID, '789');
  tracker.send(analytics.HitTypes.EVENT);

  channel.assertHitSent(HIT_0);
}


function testSend_ExtraParamsById() {
  tracker.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  tracker.set(analytics.Parameters.CAMPAIGN_ID, '789');
  tracker.send(analytics.HitTypes.EVENT, {'language': 'en-US'});

  channel.assertLastHitHasEntry(
      analytics.internal.Parameters.LANGUAGE, 'en-US');
}


/** @suppress {checkTypes} */
function testSend_OmitsNullAndUndefinedValues() {
  var screenName = 'MyMainView';
  tracker.set(analytics.Parameters.EVENT_LABEL, null);
  tracker.set(analytics.Parameters.EVENT_VALUE, undefined);
  tracker.set(analytics.Parameters.DESCRIPTION, screenName);
  tracker.send(analytics.HitTypes.EVENT);

  var expected = new analytics.internal.ParameterMap(
      analytics.Parameters.DESCRIPTION, screenName
      );
  channel.assertHitSent(expected);
}


function testSend_CustomParameters() {
  tracker.set('metric11', 1234);
  tracker.set('dimension33', 'beta');
  tracker.send(analytics.HitTypes.EVENT);

  channel.assertLastHitHasEntry('metric11', 1234);
  channel.assertLastHitHasEntry('dimension33', 'beta');
}

function testStartNewSession() {
  tracker.send(analytics.HitTypes.EVENT);
  assertUndefined(channel.findValue('sessionControl'));

  tracker.forceSessionStart();
  tracker.send(analytics.HitTypes.EVENT);
  channel.assertLastHitHasEntry('sessionControl', 'start');

  tracker.send(analytics.HitTypes.EVENT);
  assertUndefined(channel.findValue('sessionControl'));
}

function testSendAppView() {
  tracker.sendAppView(APPVIEW_HIT.description);
  assertTypedHitSent(APPVIEW_HIT);
}

function testSendAppView_PersistsDescriptionParameter() {
  tracker.sendAppView(APPVIEW_HIT.description);
  tracker.sendEvent(
      EVENT_HIT.eventCategory,
      EVENT_HIT.eventAction,
      EVENT_HIT.eventLabel,
      EVENT_HIT.eventValue);
  channel.assertLastHitHasEntry(
      analytics.Parameters.DESCRIPTION, APPVIEW_HIT.description);
}

function testSendEvent() {
  tracker.sendEvent(
      EVENT_HIT.eventCategory,
      EVENT_HIT.eventAction,
      EVENT_HIT.eventLabel,
      EVENT_HIT.eventValue);
  assertTypedHitSent(EVENT_HIT);
}

function testSendEvent_DisallowsNegativeValues() {
  try {
    tracker.sendEvent(
        EVENT_HIT.eventCategory,
        EVENT_HIT.eventAction,
        EVENT_HIT.eventLabel,
        -1);
    fail('Should have thrown exception.');
  } catch (expected) {}
}

function testSendException() {
  tracker.sendException(EXCEPTION_HIT.exDescription, EXCEPTION_HIT.exFatal);
  assertTypedHitSent(EXCEPTION_HIT);
}

function testSendSocial() {
  tracker.sendSocial(
      SOCIAL_HIT.socialNetwork,
      SOCIAL_HIT.socialAction,
      SOCIAL_HIT.socialTarget);
  assertTypedHitSent(SOCIAL_HIT);
}

function testSendTiming() {
  tracker.sendTiming(
      TIMING_HIT.timingCategory,
      TIMING_HIT.timingVar,
      TIMING_HIT.timingValue,
      TIMING_HIT.timingLabel);

  assertTypedHitSent(TIMING_HIT);
}

function testTiming() {
  replacer.set(goog, 'now',
      function() {
        return 0;
      });

  var timing = tracker.startTiming(
      TIMING_HIT.timingCategory,
      TIMING_HIT.timingVar,
      TIMING_HIT.timingLabel);

  replacer.set(goog, 'now',
      function() {
        return TIMING_HIT.timingValue;
      });
  timing.send();

  assertTypedHitSent(TIMING_HIT);
}


function testTiming_InstancesNotReusable() {
  var timing = tracker.startTiming(
      TIMING_HIT.timingCategory,
      TIMING_HIT.timingVar,
      TIMING_HIT.timingLabel);
  timing.send();

  assertThrows(timing.send);
}


/**
 * @param {!Object} hit
 * @param {!Object=} opt_extraParams
 */
function assertTypedHitSent(hit, opt_extraParams) {
  var params = {};
  goog.object.extend(params, hit);
  opt_extraParams && goog.object.extend(params, opt_extraParams);
  goog.object.forEach(params,
      function(value, key) {
        var param = analytics.internal.parameters.asParameter(key);
        channel.assertLastHitHasEntry(param, value);
      });
}

function testThrowsErrorForUnknownParameters() {
  // A bunch of parameter names which are not valid.
  var invalidParams = [
    '',
    'dim11',
    'metrics11',
    '11',
    'dimension-',
    'dimension 9',
    'metric',
    '84metric',
    '&metric2',
    '%dimension5'
  ];

  goog.array.forEach(invalidParams,
      /** @param {string} param */
      function(param) {
        assertThrows('Did not throw for invalid param: ' + param, function() {
          tracker.set(param, 1234);
        });
      });
}

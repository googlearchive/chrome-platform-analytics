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
 * @fileoverview Integration tests for analytics.GoogleAnalytics.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.HitTypes');
goog.require('analytics.Tracker');
goog.require('analytics.getService');
goog.require('analytics.resetForTesting');
goog.require('analytics.testing.TestChromeStorageArea');

goog.require('goog.array');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/** @type {!goog.testing.AsyncTestCase} */
var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall(
    'GoogleAnalytics');


/** @const {!analytics.EventHit} */
var EVENT_HIT = {
  eventCategory: 'IceCream',
  eventAction: 'Melt',
  eventLabel: 'Strawberry',
  eventValue: 100
};


/** @const {!Object} */
var CHROME_MANIFEST = {
  name: 'TestApp',
  version: '1.2.3'
};


/** @const {string} */
var TRACKING_ID0 = 'abbabbabba';


/** @const {string} */
var TRACKING_ID1 = 'xzzxzzxzzx';


/** @const {!Object} */
var EMPTY_XHR = {};


/** @type {!goog.testing.PropertyReplacer} */
var replacer;


/** @type {!analytics.testing.TestChromeStorageArea} */
var chromeStorage;


/** @type {!analytics.GoogleAnalytics} */
var service;


/** @type {!analytics.Tracker} */
var tracker;


/** @type {!Object} */
var sent;

var recorder;


function setUp() {
  recorder = goog.testing.recordFunction();
  analytics.resetForTesting();
  chromeStorage = new analytics.testing.TestChromeStorageArea();

  replacer = new goog.testing.PropertyReplacer();
  setUpChromeEnv();

  service = analytics.getService(CHROME_MANIFEST.name);
  tracker = service.getTracker(TRACKING_ID0);

  sent = EMPTY_XHR;
  replacer.set(goog.net.XhrIo, 'send',
      function(url, callback, method, content) {
        sent = {
          url: url,
          method: method,
          content: content
        };
        callback();
      });
}


/** @suppress {const|checkTypes} */
function setUpChromeEnv() {
  chrome.runtime = {};
  replacer.set(chrome.runtime, 'getManifest',
      function() {
        return CHROME_MANIFEST;
      });

  chrome.storage = {};
  replacer.set(chrome.storage, 'local', chromeStorage);

  chrome.storage.onChanged = {};
  replacer.set(
      chrome.storage.onChanged,
      'addListener',
      function(listener) {
        chromeStorage.addListener(listener);
      });
}

function tearDown() {
  replacer.reset();
}

function testTrackerCreated() {
  assertNotNull(tracker);
}

function testGetConfig() {
  // Test code is currently fully synchronous so this call must be made
  // before our call to continueTesting.
  asyncTestCase.waitForAsync();
  service.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        assertNotNull(config);
        asyncTestCase.continueTesting();
      });
}

function testOptOut_SubsequentHitsNotSent() {
  // Test code is currently fully synchronous so this call must be made
  // before our call to continueTesting.
  asyncTestCase.waitForAsync();
  service.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(false);
        asyncTestCase.continueTesting();
      });
  tracker.sendEvent(
      EVENT_HIT.eventCategory,
      EVENT_HIT.eventAction,
      EVENT_HIT.eventLabel,
      EVENT_HIT.eventValue);

  assertEquals(sent, EMPTY_XHR);
}


/**
 * Tests that HitEvents are not dispatched for hits that are sent when the
 * Google Analytics service is disabled.
 */
function testOptOut_SubsequentEventsNotSent() {

  // Test code is currently fully synchronous so this call must be made
  // before our call to continueTesting.
  asyncTestCase.waitForAsync();

  tracker.addFilter(recorder);

  // Send one event first, to make sure things are working.
  tracker.sendAppView('foo');

  // Check that we got the expected event.
  recorder.assertCallCount(1);
  recorder.reset();

  // Disable the analytics service, then send another hit.
  service.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.addChangeListener(
            function() {
              tracker.sendAppView('foo');

              recorder.assertCallCount(0);
              asyncTestCase.continueTesting();
            });

        config.setTrackingPermitted(false);
      });
}

function testSend_DeferredFires_TrackingEnabled() {
  var succeeded = false;
  asyncTestCase.waitForAsync();
  service.getConfig().addCallback(
      function(config) {
        config.setTrackingPermitted(true);
        tracker.sendEvent(
            EVENT_HIT.eventCategory,
            EVENT_HIT.eventAction,
            EVENT_HIT.eventLabel,
            EVENT_HIT.eventValue).addCallbacks(
            function() {
              succeeded = true;
              asyncTestCase.continueTesting();
            },
            function() {
              fail('Received error trying to send event.');
            });
      });
  assertTrue(succeeded);
}

function testSend_DeferredFires_TrackingDisabled() {
  var succeeded = false;
  asyncTestCase.waitForAsync();
  service.getConfig().addCallback(
      function(config) {
        config.setTrackingPermitted(false);
        tracker.sendEvent(
            EVENT_HIT.eventCategory,
            EVENT_HIT.eventAction,
            EVENT_HIT.eventLabel,
            EVENT_HIT.eventValue).addCallbacks(
            function() {
              succeeded = true;
              asyncTestCase.continueTesting();
            },
            function() {
              fail('Received error trying to send event.');
            });
      });
  assertTrue(succeeded);
}

function testSend_DeliversPayload() {
  asyncTestCase.waitForAsync();
  service.getConfig().addCallback(
      function(config) {
        config.setTrackingPermitted(true);
        tracker.sendEvent(
            EVENT_HIT.eventCategory,
            EVENT_HIT.eventAction,
            EVENT_HIT.eventLabel,
            EVENT_HIT.eventValue);
        var entries = sent.content.split('&');
        assertTrue(entries.length > 0);
        assertTrue(sent.content, goog.array.contains(entries, 'ec=IceCream'));
        assertTrue(sent.content, goog.array.contains(entries, 'ea=Melt'));
        assertTrue(sent.content, goog.array.contains(entries, 'el=Strawberry'));
        assertTrue(sent.content, goog.array.contains(entries, 'ev=100'));
        assertTrue(sent.content, goog.array.contains(entries, '_v=ca1.4.0'));
        asyncTestCase.continueTesting();
      });
}

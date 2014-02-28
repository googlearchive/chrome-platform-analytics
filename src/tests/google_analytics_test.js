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
 * @fileoverview Tests for analytics.GoogleAnalytics.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.require('analytics.HitTypes');
goog.require('analytics.Tracker');
goog.require('analytics.getService');
goog.require('analytics.resetForTesting');
goog.require('analytics.testing.TestChromeStorageArea');

goog.require('goog.array');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');


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
var storage;


/** @type {!analytics.GoogleAnalytics} */
var service;


/** @type {!analytics.Tracker} */
var tracker;


/** @type {!Object} */
var sent;


function setUp() {
  analytics.resetForTesting();
  storage = new analytics.testing.TestChromeStorageArea();

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

  asyncTestCase.waitForAsync();
  service.getConfig().addCallback(
      function(config) {
        asyncTestCase.continueTesting();
      });
}


/** @suppress {checkTypes} */
function setUpChromeEnv() {
  // define global chrome objects
  chrome.runtime = {};
  chrome.storage = {};
  replacer.set(chrome.storage, 'local', storage);
  replacer.set(chrome.runtime, 'getManifest',
      function() {
        return CHROME_MANIFEST;
      });
}

function tearDown() {
  goog.events.removeAll(tracker.getEventTarget());
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

function testOptOut_HitsNotSent() {
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
function testOptOut_EventsNotSent() {

  // Test code is currently fully synchronous so this call must be made
  // before our call to continueTesting.
  asyncTestCase.waitForAsync();

  // Set up an event listener.
  var hitEventCount = 0;
  goog.events.listen(tracker.getEventTarget(),
      analytics.Tracker.HitEvent.EVENT_TYPE,
      function(event) {
        hitEventCount++;
      });

  // Send one event first, to make sure things are working.
  tracker.sendAppView('foo');

  // Check that we got the expected event.
  assertEquals(1, hitEventCount);

  // Disable the analytics service, then send another hit.
  service.getConfig().addCallback(
      /** @param {!analytics.Config} config */
      function(config) {
        config.setTrackingPermitted(false);
        tracker.sendAppView('foo');

        // Make sure we didn't send another event.
        assertEquals(1, hitEventCount);
        asyncTestCase.continueTesting();
      });
}

function testSend_DeferredFires() {
  var succeeded = false;
  asyncTestCase.waitForAsync();
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
  assertTrue(succeeded);
}

function testSend_DeliversPayload() {
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
  assertTrue(sent.content, goog.array.contains(entries, '_v=ca3'));
}

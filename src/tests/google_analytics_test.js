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
goog.require('analytics.testing.TestChromeRuntime');
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


/** @type {!analytics.GoogleAnalytics} */
var service;


/** @type {!analytics.Config} */
var config;


/** @type {!analytics.Tracker} */
var tracker;


/** @type {!Object} */
var sent;


/** @type {function()} */
var onTeardown = goog.nullFunction;


/** @type {!Function} */
var recorder;


/** @suppress {const|checkTypes} */
function setUpPage() {
  if (!goog.isObject(chrome.runtime)) {
    chrome.runtime = {};
  }
}


/** @suppress {const|checkTypes} */
function setUp() {
  goog.asserts.assert(chrome.runtime, '`chrome.runtime` is missing');

  replacer = new goog.testing.PropertyReplacer();
  recorder = goog.testing.recordFunction();

  analytics.resetForTesting();
  setupEnv();

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
      function(readyConfig) {
        config = readyConfig;
        asyncTestCase.continueTesting();
      });
}


function tearDown() {
  onTeardown();
}


/** @suppress {const|checkTypes} */
function setupEnv() {
  var chromeRuntime = new analytics.testing.TestChromeRuntime(
      CHROME_MANIFEST.name,
      CHROME_MANIFEST.version);
  var chromeStorage = new analytics.testing.TestChromeStorageArea();

  chromeRuntime.install();
  chromeStorage.install();

  // NOTE: This'll become conditional in the next iteration of this test.
  // That's why define this in a function. So we can just call this
  // on-teardown without having to replicate the logic.
  onTeardown = function() {
    chromeRuntime.uninstall();
    chromeStorage.uninstall();
  };
}


function testTrackerCreated() {
  assertNotNull(service.getTracker('UA-1234-5'));
}

function testGetConfig() {
  // This duplicates something in setup,
  // be better to SEE what is being covered here in the test
  // than having to go chase down where config is defined.
  asyncTestCase.waitForAsync();
  service.getConfig().addCallback(
      function(config) {
        assertNotNull(config);
        asyncTestCase.continueTesting();
      });
}

function testOptOut_HitsNotSent() {
  asyncTestCase.waitForAsync();
  config.setTrackingPermitted(false);

  tracker.sendAppView('foo').addCallback(
      function() {
        assertEquals(sent, EMPTY_XHR);
        asyncTestCase.continueTesting();
      });
}

function testOptOut_HitsNotFiltered() {
  asyncTestCase.waitForAsync();

  tracker.addFilter(recorder);

  config.setTrackingPermitted(false);

  tracker.sendAppView('foo').addCallback(
      function() {
        recorder.assertCallCount(0);
        asyncTestCase.continueTesting();
      });
}


function testOptIn_HitsFiltered() {
  asyncTestCase.waitForAsync();
  tracker.addFilter(recorder);
  config.setTrackingPermitted(true);

  tracker.sendAppView('foo').addCallback(
      function() {
        recorder.assertCallCount(1);
        asyncTestCase.continueTesting();
      });
}


function testSend_DeferredFires_TrackingEnabled() {
  asyncTestCase.waitForAsync();
  config.setTrackingPermitted(true);

  tracker.sendEvent(
      EVENT_HIT.eventCategory,
      EVENT_HIT.eventAction,
      EVENT_HIT.eventLabel,
      EVENT_HIT.eventValue).addCallback(
      function() {
        asyncTestCase.continueTesting();
      });
}

function testSend_DeferredFires_TrackingDisabled() {
  asyncTestCase.waitForAsync();
  config.setTrackingPermitted(false);

  tracker.sendEvent(
      EVENT_HIT.eventCategory,
      EVENT_HIT.eventAction,
      EVENT_HIT.eventLabel,
      EVENT_HIT.eventValue).addCallback(
      function() {
        asyncTestCase.continueTesting();
      });
}

function testSend_SendsHits() {
  asyncTestCase.waitForAsync();
  config.setTrackingPermitted(true);

  tracker.set('dimension11', 'Poodles');
  tracker.set('metric72', 17);
  tracker.sendEvent(
      EVENT_HIT.eventCategory,
      EVENT_HIT.eventAction,
      EVENT_HIT.eventLabel,
      EVENT_HIT.eventValue).addCallback(
      function() {
        var entries = sent.content.split('&');
        assertTrue(entries.length > 0);
        assertContains(sent.content, 'cd11=Poodles', entries);
        assertContains(sent.content, 'cm72=17', entries);
        assertContains(sent.content, 'ec=IceCream', entries);
        assertContains(sent.content, 'ea=Melt', entries);
        assertContains(sent.content, 'el=Strawberry', entries);
        assertContains(sent.content, 'ev=100', entries);
        assertContains(sent.content, '_v=ca1.5.2', entries);
        asyncTestCase.continueTesting();
      });
}

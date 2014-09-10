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
 * @fileoverview Tests for ServiceSettings.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.internal.Html5Storage');
goog.require('analytics.internal.ServiceSettings');
goog.require('analytics.internal.Settings.Properties');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/** @type {!goog.testing.AsyncTestCase} */
var asyncTest = goog.testing.AsyncTestCase.createAndInstall();


/** @type {!analytics.internal.Html5Storage} */
var storage;


/** @type {!analytics.internal.ServiceSettings} */
var settings;

var recorder;


function setUp() {
  asyncTest.waitForAsync();

  window.localStorage.clear();  // An abundance of caution...
  recorder = goog.testing.recordFunction();
  storage = new analytics.internal.Html5Storage('whoooosh!');
  settings = new analytics.internal.ServiceSettings(storage);
  settings.whenReady().addCallback(
      function() {
        asyncTest.continueTesting();
      });
}

function tearDown() {
  window.localStorage.clear();
}

function testCreatesValidUserId() {
  assertTrue(analytics.internal.Identifier.isValidUuid(
      /** @type {string} */ (settings.getUserId())));
}

function testPersistsUserId() {
  asyncTest.waitForAsync();

  var id = settings.getUserId();
  settings = new analytics.internal.ServiceSettings(storage);
  settings.whenReady().addCallback(
      function() {
        assertEquals(id, settings.getUserId());
        asyncTest.continueTesting();
      });
}

function testPersistsIsTrackingPermitted() {
  asyncTest.waitForAsync();

  settings.setTrackingPermitted(false);
  settings = new analytics.internal.ServiceSettings(storage);
  settings.whenReady().addCallback(
      function() {
        assertFalse(settings.isTrackingPermitted());
        asyncTest.continueTesting();
      });
}

function testTrackingPermittingByDefault() {
  assertTrue(settings.isTrackingPermitted());
}

function testNotifiesListener_WhenTrackingPermittedPropertyChanges() {
  asyncTest.waitForAsync();

  settings.whenReady().addCallback(
      function() {
        settings.addChangeListener(
          function(prop) {
            assertEquals(
                analytics.internal.Settings.Properties.TRACKING_PERMITTED,
                prop);
            asyncTest.continueTesting();
          });
        settings.setTrackingPermitted(false);
      });
}

function testTrackingNotPermittedIfPluginInstalled() {
  goog.global._gaUserPrefs = {
    ioo: function() { return true; }
  };

  assertFalse(settings.isTrackingPermitted());

  delete goog.global._gaUserPrefs;
}

function testTrackingPermitting_UpdatedWhenUnderlyingStorageChanges() {
  asyncTest.waitForAsync();

  settings.addChangeListener(
      function() {
        assertFalse(settings.isTrackingPermitted());
        asyncTest.continueTesting();
      });

  var naughtySettings = new analytics.internal.ServiceSettings(storage);
  naughtySettings.setTrackingPermitted(false);
}

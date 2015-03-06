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

goog.require('analytics.internal.ServiceSettings');
goog.require('analytics.internal.Settings.Properties');
goog.require('analytics.testing.TestStorage');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/** @type {!analytics.testing.TestStorage} */
var storage;


/** @type {!analytics.internal.ServiceSettings} */
var settings;


var recorder;


function setUp() {
  recorder = goog.testing.recordFunction();
  storage = new analytics.testing.TestStorage();
  settings = new analytics.internal.ServiceSettings(storage);
  return settings.whenReady();
}

function testCreatesValidUserId() {
  assertTrue(analytics.internal.Identifier.isValidUuid(
      /** @type {string} */ (settings.getUserId())));
}

function testPersistsUserId() {
  var id = settings.getUserId();
  settings = new analytics.internal.ServiceSettings(storage);
  return settings.whenReady().addCallback(
      function() {
        assertEquals(id, settings.getUserId());
      });
}

function testResetUserId() {
  var id = settings.getUserId();
  return settings.resetUserId().addCallback(
      function() {
        var newId = settings.getUserId();
        assertTrue(goog.isString(newId));
        assertNotEquals(id, newId);
      });
}

function testPersistsIsTrackingPermitted() {
  settings.setTrackingPermitted(false);
  settings = new analytics.internal.ServiceSettings(storage);
  return settings.whenReady().addCallback(
      function() {
        assertFalse(settings.isTrackingPermitted());
      });
}

function testTrackingPermittingByDefault() {
  assertTrue(settings.isTrackingPermitted());
}

function testNotifiesListener_WhenTrackingPermittedPropertyChanges() {
  return settings.whenReady().addCallback(
      function() {
        settings.addChangeListener(
            function(prop) {
              assertEquals(
                  analytics.internal.Settings.Properties.TRACKING_PERMITTED,
                  prop);
            });
        settings.setTrackingPermitted(false);
      });
}

function testTrackingNotPermittedIfPluginInstalled() {
  goog.global['_gaUserPrefs'] = {
    'ioo': function() { return true; }
  };

  assertFalse(settings.isTrackingPermitted());

  delete goog.global['_gaUserPrefs'];
}

function testTrackingPermitting_UpdatedWhenUnderlyingStorageChanges() {
  var deferred = settings.addChangeListener(
      function() {
        assertFalse(settings.isTrackingPermitted());
      });

  var naughtySettings = new analytics.internal.ServiceSettings(storage);
  naughtySettings.whenReady().addCallback(
      function() {
        naughtySettings.setTrackingPermitted(false);
      });

  return deferred;
}

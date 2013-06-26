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

goog.require('analytics.internal.ServiceSettings');
goog.require('analytics.internal.Settings.Properties');
goog.require('analytics.testing.SingleArgRecorder');
goog.require('analytics.testing.TestStorage');

goog.require('goog.testing.jsunit');


/** @type {!analytics.internal.AsyncStorage} */
var storage;


/** @type {!analytics.internal.ServiceSettings} */
var settings;


function setUp() {
  // NOTE(tbreisacher): Many of these tests only work correctly because this
  // Storage is synchronous.
  storage = new analytics.testing.TestStorage();
}


function testCreatesIdIfNoneExists() {
  settings = new analytics.internal.ServiceSettings(storage);
  assertTrue(analytics.internal.Identifier.isValidUuid(
      /** @type {string} */ (settings.getUserId())));
}

function testPersistsNewlyCreatedId() {
  settings = new analytics.internal.ServiceSettings(storage);
  storage.get('analytics.user-id').addCallbacks(
      function() {
        assertTrue(analytics.internal.Identifier.isValidUuid(
            /** @type {string} */ (settings.getUserId())));
      },
      fail);
}

function testLoadsExistingIdFromStorage() {
  var id = analytics.internal.Identifier.generateUuid();
  storage.set('analytics.user-id', id);
  settings = new analytics.internal.ServiceSettings(storage);
  assertEquals(id, settings.getUserId());
}

function testTrackingPermittingByDefault() {
  settings = new analytics.internal.ServiceSettings(storage);
  assertTrue(settings.isTrackingPermitted());
}

function testNotifiesListener_WhenTrackingPermittedPropertyChanges() {
  var recorder = new analytics.testing.SingleArgRecorder();
  settings = new analytics.internal.ServiceSettings(storage);
  settings.addChangeListener(recorder.get());
  settings.setTrackingPermitted(false);
  recorder.assertRecorded(
      analytics.internal.Settings.Properties.TRACKING_PERMITTED);
  recorder.assertTimesCalled(1);
}

function testTrackingNotPermittedIfPluginInstalled() {
  goog.global._gaUserPrefs = {
    ioo: function() { return true; }
  };

  settings = new analytics.internal.ServiceSettings(storage);
  assertFalse(settings.isTrackingPermitted());

  delete goog.global._gaUserPrefs;
}

function testPersistsTrackingPermittingValue() {
  settings = new analytics.internal.ServiceSettings(storage);
  settings.setTrackingPermitted(false);
  settings = new analytics.internal.ServiceSettings(storage);
  assertFalse(settings.isTrackingPermitted());
}

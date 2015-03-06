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
 * @fileoverview Tests of analytics.internal.ChromeStorage.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.internal.AsyncStorage');
goog.require('analytics.internal.ChromeStorage');
goog.require('analytics.testing.TestChromeRuntime');
goog.require('analytics.testing.TestChromeStorageArea');
goog.require('goog.events');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/** @type {!goog.testing.AsyncTestCase} */
var async = goog.testing.AsyncTestCase.createAndInstall();


/** @type {!analytics.testing.TestChromeRuntime} */
var runtime;


/** @type {!analytics.testing.TestChromeStorageArea} */
var storageArea;


/** @type {!analytics.internal.ChromeStorage} */
var chromeStorage;


/** @suppress {const|checkTypes} */
function setUpPage() {
  if (!goog.isObject(chrome.runtime)) {
    chrome.runtime = {};
  }
}

function setUp() {
  window.localStorage.clear();

  runtime = new analytics.testing.TestChromeRuntime('TestApp', '1.2.3.4');
  runtime.install();

  storageArea = new analytics.testing.TestChromeStorageArea();
  storageArea.install();
  chromeStorage = new analytics.internal.ChromeStorage();
}

function tearDown() {
  storageArea.uninstall();
  runtime.uninstall();
}

function testSetAndGet() {
  assertSetsAndGets(chromeStorage);
}

function testNotifiesListeners() {
  assertNotifiesChangeListeners(chromeStorage);
}

function testDoesNotNotifyListenersOnNoopChange() {
  assertDoesNotNotifyListenersOnNoopChange(chromeStorage);
}

/** @param {!analytics.internal.AsyncStorage} storage */
function assertSetsAndGets(storage) {
  async.waitForAsync();
  storage.set('a', 'b').addCallback(
      function() {
        storage.get('a').addCallback(
            function(value) {
              assertEquals('b', value);
              async.continueTesting();
            });
      });
}


/** @param {!analytics.internal.AsyncStorage} storage */
function assertNotifiesChangeListeners(storage) {
  async.waitForAsync();

  var recorder = goog.testing.recordFunction();
  goog.events.listen(
      storage,
      analytics.internal.AsyncStorage.Event.STORAGE_CHANGED,
      recorder);

  storage.set('a', 'b').addCallback(
      function() {
        recorder.assertCallCount(1);
        async.continueTesting();
      });
}


/** @param {!analytics.internal.AsyncStorage} storage */
function assertDoesNotNotifyListenersOnNoopChange(storage) {
  async.waitForAsync();

  var recorder = goog.testing.recordFunction();
  goog.events.listen(
      storage,
      analytics.internal.AsyncStorage.Event.STORAGE_CHANGED,
      recorder);

  storage.set('a', 'b').addCallback(
      function() {
        recorder.reset();
        storage.set('a', 'b').addCallback(
            function() {
              recorder.assertCallCount(0);
              async.continueTesting();
            });
      });
}

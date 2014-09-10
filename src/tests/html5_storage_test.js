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
 * @fileoverview Tests for analytics.internal.Html5Storage.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.internal.AsyncStorage');
goog.require('analytics.internal.Html5Storage');
goog.require('goog.events');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/** @type {!goog.testing.AsyncTestCase} */
var async = goog.testing.AsyncTestCase.createAndInstall();

/** @const {string} */
var NS = 'test';

/** @type {!analytics.internal.Html5Storage} */
var storage;

var recorder;

function setUp() {
  recorder = goog.testing.recordFunction();
  storage = new analytics.internal.Html5Storage(NS);
}


function testSetAndGet() {
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

function testNotifiesListeners() {
  async.waitForAsync();
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

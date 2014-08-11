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
 * @fileoverview Unit test for XhrChannel.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.HitType');
goog.require('analytics.HitTypes');
goog.require('analytics.Parameter');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.Result');
goog.require('analytics.Status');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.XhrChannel');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events.OnlineHandler');
goog.require('goog.testing.jsunit');


/** @const {!Object} */
var EMPTY = {};


/** @const {!analytics.ParameterMap} */
var HIT_0 = new analytics.ParameterMap(
    analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
    analytics.Parameters.CAMPAIGN_ID, '789'
    );


/** @const {string} */
var EXAMPLE_URL = 'http://poodles.woowoo';


/** @const {number} */
var MAX_POST_LENGTH = 50;


/** @type {goog.testing.PropertyReplacer} */
var replacer;


/** @type {goog.testing.events.OnlineHandler} */
var netMonitor;


/** @type {analytics.internal.XhrChannel} */
var channel;

function setUp() {
  replacer = new goog.testing.PropertyReplacer();
  netMonitor = new goog.testing.events.OnlineHandler(true);
  channel = new analytics.internal.XhrChannel(
      EXAMPLE_URL, MAX_POST_LENGTH, netMonitor);
}

function tearDown() {
  replacer.reset();
}

function testSendsHit() {
  var sent = send(analytics.HitTypes.EVENT, HIT_0);
  assertEquals(EXAMPLE_URL, sent.url);
  assertEquals('POST', sent.method);
  assertSameElements(['t=event', 'ci=789', 'sr=1024x768'],
      sent.content.split('&'));
}

function testEnforcedPostSizeLimit() {
  var deferred = channel.send(analytics.HitTypes.EVENT,
      new analytics.ParameterMap(
          /** @type {analytics.Parameter} */ (
              {name: 'abcdabcdabcdabcdabcd'}), '12341234123412341234',
          /** @type {analytics.Parameter} */ (
              {name: 'wxyzwxyzwxyzwxyzwxyz'}), '67896789678967896789'));

  /** @type {analytics.Result} */
  var result;

  deferred.addErrback(
      /** @param {analytics.Result} r */
      function(r) {
        result = r;
      });
  assertEquals(analytics.Status.PAYLOAD_TOO_BIG, result.status);
  assertEquals(
      'Encoded hit length == 91, but should be <= 50.', result.details);
}

function testDoesNotSendHitsWhenOffline() {
  netMonitor.setOnline(false);
  var sent = send(analytics.HitTypes.EVENT, HIT_0);
  assertEquals(EMPTY, sent);
}

// TODO(smckay): Add unicode test coverage.
function testEncodesValues() {

  /** @type {!analytics.ParameterMap} */
  var params = new analytics.ParameterMap(
      /** @type {!analytics.Parameter} */ ({name: 'gee whiz'}),
      'a b&c%d\\eee'
      );
  var sent = send(analytics.HitTypes.EVENT, params);
  assertEquals('t=event&gee%20whiz=a%20b%26c%25d%5Ceee', sent.content);
}

function testDeferredFires() {
  replacer.set(goog.net.XhrIo, 'send',
      function(url, callback) {
        callback();
      });
  var fired = false;
  channel.send(
      analytics.HitTypes.EVENT,
      new analytics.ParameterMap()).addCallback(
      function() {
        fired = true;
      });
  assertTrue(fired);
}

function testDeferredFiresErrorWhenOffline() {
  netMonitor.setOnline(false);
  replacer.set(goog.net.XhrIo, 'send',
      function(url, callback) {
        callback();
      });
  var fired = false;
  channel.send(
      analytics.HitTypes.EVENT,
      new analytics.ParameterMap()).addErrback(
      function() {
        fired = true;
      });
  assertTrue(fired);
}


/**
 * @param {!analytics.HitType} hitType
 * @param {!analytics.ParameterMap} parameters
 * @return {!Object} The data sent to the server.
 */
function send(hitType, parameters) {
  var sent = EMPTY;
  replacer.set(goog.net.XhrIo, 'send',
      function(url, callback, method, content) {
        sent = {
          url: url,
          method: method,
          content: content
        };
        callback();
      });
  channel.send(hitType, parameters);
  return sent;
}

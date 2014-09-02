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
 * @fileoverview Unit test for ParameterMap.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.HitType');
goog.require('analytics.Parameter');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.internal.Parameters');
goog.require('goog.testing.jsunit');


/** @type {!analytics.ParameterMap} */
var map;


function setUp() {
  map = new analytics.ParameterMap();
}

function testSetGetSingleValue() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  assertEquals('1024x768',
      map.get(analytics.internal.Parameters.SCREEN_RESOLUTION));
}

function testMultipleValuesDoNotInterfere() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');
  assertEquals('1024x768',
      map.get(analytics.internal.Parameters.SCREEN_RESOLUTION));
  assertEquals('789', map.get(analytics.Parameters.CAMPAIGN_ID));
}

function testDuplicateKeyReplacesValue() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, 'Bedazzler');
  assertEquals('Bedazzler',
      map.get(analytics.internal.Parameters.SCREEN_RESOLUTION));
}

function testEquality() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');

  /** @type {!analytics.ParameterMap} */
  var other = new analytics.ParameterMap(
      analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
      analytics.Parameters.CAMPAIGN_ID, '789');
  assertTrue(map.equals(other));
}

function testContains() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');

  var other = new analytics.ParameterMap(
      analytics.Parameters.CAMPAIGN_ID, '789');
  assertTrue(map.contains(other));
}

function testContains_Failure() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');

  var other = new analytics.ParameterMap(
      analytics.Parameters.CACHE_BUSTER, '11');
  assertFalse(map.contains(other));
}

function testHasParameter() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  assertTrue(map.hasParameter(analytics.internal.Parameters.SCREEN_RESOLUTION));
}

function testHasParameter_Failure() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  assertFalse(map.hasParameter(analytics.Parameters.CACHE_BUSTER));
}

function testInequality() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, 'Bedazzler');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');

  /** @type {!analytics.ParameterMap} */
  var other = new analytics.ParameterMap(
      analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
      analytics.Parameters.CAMPAIGN_ID, '789');
  assertFalse(map.equals(other));
}

function testAddAll() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, 'Bedazzler');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');

  /** @type {!analytics.ParameterMap} */
  var other = new analytics.ParameterMap();
  other.addAll(map);
  assertTrue(map.equals(other));
}

function testConstructorDisallowsUnevenNumberOfArguments() {
  try {
    new analytics.ParameterMap(
        analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
        analytics.Parameters.CAMPAIGN_ID);
    fail('Should have thrown exception.');
  } catch (expected) {}
}

function testForEachElementIteratesOverAllElements() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');

  /** @type {!Array.<string>} */
  var entries = [];

  map.forEachEntry(
      /**
       * @param {!analytics.Parameter} key
       * @param {!analytics.Value} value
       */
      function(key, value) {
        entries.push([key.name, value].join('='));
      });

  assertSameElements(['ci=789', 'sr=1024x768'], entries);
}

function testAddsConstructorValues() {
  map = new analytics.ParameterMap(
      analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768',
      analytics.Parameters.CAMPAIGN_ID, '789');
  assertEquals('1024x768',
      map.get(analytics.internal.Parameters.SCREEN_RESOLUTION));
  assertEquals('789', map.get(analytics.Parameters.CAMPAIGN_ID));
}

function testClone() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');

  var clone = map.clone();
  assertTrue(map.equals(clone));
}

function testClone_ChangesNotShared() {
  map.set(analytics.internal.Parameters.SCREEN_RESOLUTION, '1024x768');
  map.set(analytics.Parameters.CAMPAIGN_ID, '789');

  var clone = map.clone();
  map.set(analytics.internal.Parameters.APP_NAME, 'Tahiti');
  clone.set(analytics.internal.Parameters.LANGUAGE, 'en-US');
  assertFalse(map.equals(clone));
  assertNull(clone.get(analytics.internal.Parameters.APP_NAME));
  assertNull(map.get(analytics.internal.Parameters.LANGUAGE));
}

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
 * @fileoverview {@code analytics.filters.EventLabelerBuilder} tests.
 * @author orenb@google.com (Oren Blasberg)
 */

goog.setTestOnly();

goog.require('analytics.filters.EventLabelerBuilder');
goog.require('analytics.testing.Hits');
goog.require('goog.testing.jsunit');


/**
 * Tests that an powers-of-two labeler produces the correct range labels for
 * the given hit value.
 */
function testPowersOfTwoLabeler() {
  var labeler = new analytics.filters.EventLabelerBuilder().
      powersOfTwo().
      build();

  checkLabelerHit(labeler, '0', -5);  // GA illegal, whuteva
  checkLabelerHit(labeler, '0', 0);
  checkLabelerHit(labeler, '1-2', 1.5);
  checkLabelerHit(labeler, '1-2', 2);
  checkLabelerHit(labeler, '3-4', 3.14159);  // GA illegal, whutevas
  checkLabelerHit(labeler, '5-8', 6);
  checkLabelerHit(labeler, '9-16', 16.1);
  checkLabelerHit(labeler, '33-64', 50);
  checkLabelerHit(labeler, '129-256', 250);
  checkLabelerHit(labeler, '8193-16384', 12500);
}


/**
 * Verifies that a non-EVENT hit just passes through the powers-of-two labeler
 * filter without its params being modified.
 */
function testPowersOfTwoLabeler_NonEventHit() {
  var hit = analytics.testing.Hits.createAppViewHit('asdf');
  var origParams = hit.getParameters().clone();
  var labeler = new analytics.filters.EventLabelerBuilder().
      powersOfTwo().
      build();

  labeler(hit);
  assertTrue(origParams.equals(hit.getParameters()));
}


/**
 * Verifies that a hit whose event value is non-numeric just passes through the
 * powers-of-two labeler filter without its label being modified.
 */
function testPowersOfTwoLabeler_NonNumericValue() {
  var hit = analytics.testing.Hits.createEventHit('asdf');
  var origParams = hit.getParameters().clone();
  var labeler = new analytics.filters.EventLabelerBuilder().
      powersOfTwo().
      build();

  labeler(hit);
  assertTrue(origParams.equals(hit.getParameters()));
}

function testPowersOfTwoLabeler_WithStrippedValue() {
  var labeler = new analytics.filters.EventLabelerBuilder().
      powersOfTwo().
      stripValue().
      build();

  // Verify labeling still works.
  checkLabelerHit(labeler, '33-64', 50);

  // Verify the value got stripped out.
  var hit = analytics.testing.Hits.createEventHit(100);
  labeler(hit);
  assertNull(hit.getParameters().get(analytics.Parameters.EVENT_VALUE));
}


/**
 * Verifies that if an event hit has an existing label, the powers-of-two
 * labeler will replace it w/ the new one.
 */
function testPowersOfTwoLabeler_WithExistingLabel() {
  var hit = analytics.testing.Hits.createEventHit(100);
  hit.getParameters().set(analytics.Parameters.EVENT_LABEL, 'asdf');

  var labeler = new analytics.filters.EventLabelerBuilder().
      powersOfTwo().
      build();
  labeler(hit);
  assertEquals('65-128',
      hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
}


/**
 * Verifies that if an event hit has an existing label, the powers-of-two
 * labeler will append the new label to the existing one if the append feature
 * is specified.
 */
function testPowersOfTwoLabeler_WithExistingLabel_WithAppend() {
  var hit = analytics.testing.Hits.createEventHit(100);
  hit.getParameters().set(analytics.Parameters.EVENT_LABEL, 'asdf');

  var labeler = new analytics.filters.EventLabelerBuilder().
      powersOfTwo().
      appendToExistingLabel().
      build();
  labeler(hit);
  assertEquals('asdf - 65-128',
      hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
}


/**
 * Verifies that if an event hit has an existing label, the powers-of-two
 * labeler will append the new label to the existing one, and strips the value
 * if that is configured.
 */
function testPowersOfTwoLabeler_WithExistingLabel_WithAppendAndStrippedValue() {
  var hit = analytics.testing.Hits.createEventHit(100);
  hit.getParameters().set(analytics.Parameters.EVENT_LABEL, 'asdf');

  var labeler = new analytics.filters.EventLabelerBuilder().
      powersOfTwo().
      appendToExistingLabel().
      stripValue().
      build();
  labeler(hit);
  assertEquals('asdf - 65-128',
      hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
  assertNull(hit.getParameters().get(analytics.Parameters.EVENT_VALUE));
}


/**
 * Verifies that if an event hit has an existing label, the powers-of-two
 * labeler will append the new label to the existing one using the given
 * separator if the append feature is specified.
 */
function testPowersOfTwoLabeler_WithExistingLabel_WithAppend_Separator() {
  var hit = analytics.testing.Hits.createEventHit(100);
  hit.getParameters().set(analytics.Parameters.EVENT_LABEL, 'asdf');

  var labeler = new analytics.filters.EventLabelerBuilder().
      powersOfTwo().
      appendToExistingLabel(' ~~ ').
      build();
  labeler(hit);
  assertEquals('asdf ~~ 65-128',
      hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
}


/**
 * Tests that a range bounds labeler produces the correct range labels for
 * the given hit value.
 */
function testRangeBoundsLabeler() {
  var rightBounds = [10, 50, 100, 250, 500, 1000];
  var labeler = new analytics.filters.EventLabelerBuilder().
      rangeBounds(rightBounds).
      build();

  checkLabelerHit(labeler, '<= 0', -230);

  checkLabelerHit(labeler, '<= 0', -230);
  checkLabelerHit(labeler, '<= 0', 0);

  checkLabelerHit(labeler, '1-10', 1);
  checkLabelerHit(labeler, '1-10', 3);
  checkLabelerHit(labeler, '1-10', 10);

  checkLabelerHit(labeler, '11-50', 11);
  checkLabelerHit(labeler, '11-50', 33);
  checkLabelerHit(labeler, '11-50', 50);

  checkLabelerHit(labeler, '51-100', 51);
  checkLabelerHit(labeler, '51-100', 75);
  checkLabelerHit(labeler, '51-100', 100);

  checkLabelerHit(labeler, '101-250', 101);
  checkLabelerHit(labeler, '101-250', 186);
  checkLabelerHit(labeler, '101-250', 250);

  checkLabelerHit(labeler, '251-500', 251);
  checkLabelerHit(labeler, '251-500', 386);
  checkLabelerHit(labeler, '251-500', 500);

  checkLabelerHit(labeler, '501-1000', 501);
  checkLabelerHit(labeler, '501-1000', 750);
  checkLabelerHit(labeler, '501-1000', 1000);

  checkLabelerHit(labeler, '1001+', 1001);
  checkLabelerHit(labeler, '1001+', 1500);
  checkLabelerHit(labeler, '1001+', 2000);
}


/**
 * Verifies that a non-EVENT hit just passes through the range bounds labeler
 * filter without its params being modified.
 */
function testRangeBoundsLabeler_NonEventHit() {
  var hit = analytics.testing.Hits.createAppViewHit('asdf');
  var origParams = hit.getParameters().clone();
  var labeler = new analytics.filters.EventLabelerBuilder().
      rangeBounds([10, 50]).
      build();

  labeler(hit);
  assertTrue(origParams.equals(hit.getParameters()));
}


/**
 * Verifies that a hit whose event value is non-numeric just passes through the
 * powers-of-two labeler filter without its label being modified.
 */
function testRangeBoundsLabeler_NonNumericValue() {
  var hit = analytics.testing.Hits.createEventHit('asdf');
  var origParams = hit.getParameters().clone();
  var labeler = new analytics.filters.EventLabelerBuilder().
      rangeBounds([10, 50]).
      build();

  labeler(hit);
  assertTrue(origParams.equals(hit.getParameters()));
}

function testRangeBoundsLabeler_WithStrippedValue() {
  var labeler = new analytics.filters.EventLabelerBuilder().
      rangeBounds([10, 50]).
      stripValue().
      build();

  // Verify labeling still works.
  checkLabelerHit(labeler, '11-50', 20);

  // Verify the value got stripped out.
  var hit = analytics.testing.Hits.createEventHit(100);
  labeler(hit);
  assertNull(hit.getParameters().get(analytics.Parameters.EVENT_VALUE));
}


/**
 * Verifies that if an event hit has an existing label, the range bounds labeler
 * will replace it w/ the new one.
 */
function testRangeBoundsLabeler_WithExistingLabel() {
  var hit = analytics.testing.Hits.createEventHit(100);
  hit.getParameters().set(analytics.Parameters.EVENT_LABEL, 'asdf');

  var labeler = new analytics.filters.EventLabelerBuilder().
      rangeBounds([10, 50]).
      build();
  labeler(hit);
  assertEquals('51+',
      hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
}


/**
 * Verifies that if an event hit has an existing label, the range bounds labeler
 * will append the new label to the existing one if the append feature is
 * specified.
 */
function testRangeBoundsLabeler_WithExistingLabel_WithAppend() {
  var hit = analytics.testing.Hits.createEventHit(100);
  hit.getParameters().set(analytics.Parameters.EVENT_LABEL, 'asdf');

  var labeler = new analytics.filters.EventLabelerBuilder().
      rangeBounds([10, 50]).
      appendToExistingLabel().
      build();
  labeler(hit);
  assertEquals('asdf - 51+',
      hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
}


/**
 * Verifies that if an event hit has an existing label, the powers-of-two
 * labeler will append the new label to the existing one, and strips the value
 * if that is configured.
 */
function testRangeBoundsLabeler_WithExistingLabel_WithAppendAndStrippedValue() {
  var hit = analytics.testing.Hits.createEventHit(100);
  hit.getParameters().set(analytics.Parameters.EVENT_LABEL, 'asdf');

  var labeler = new analytics.filters.EventLabelerBuilder().
      rangeBounds([10, 50]).
      appendToExistingLabel().
      stripValue().
      build();
  labeler(hit);
  assertEquals('asdf - 51+',
      hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
  assertNull(hit.getParameters().get(analytics.Parameters.EVENT_VALUE));
}


/**
 * Verifies that if an event hit has an existing label, the powers-of-two
 * labeler will append the new label to the existing one using the given
 * separator if the append feature is specified..
 */
function testRangeBoundsLabeler_WithExistingLabel_WithAppend_Separator() {
  var hit = analytics.testing.Hits.createEventHit(100);
  hit.getParameters().set(analytics.Parameters.EVENT_LABEL, 'asdf');

  var labeler = new analytics.filters.EventLabelerBuilder().
      rangeBounds([10, 50]).
      appendToExistingLabel(' ~~ ').
      build();
  labeler(hit);
  assertEquals('asdf ~~ 51+',
      hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
}


/**
 * Tests that if a client tries to apply multiple labeling strategies to the
 * builder, this throws an error.
 */
function testMultipleStrategiesThrowsError() {
  assertThrows(function() {
    var labeler = new analytics.filters.EventLabelerBuilder().
        rangeBounds([10, 50]).
        powersOfTwo().
        build();
  });
}


function testNoStrategyThrowsError() {
  assertThrows(function() {
    var labeler = new analytics.filters.EventLabelerBuilder().
        build();
  });
}


/**
 * Asserts that when passed through the given labeler (filter), the given value
 * has the given expected value.
 *
 * @param {!analytics.Tracker.Filter} labeler
 * @param {string} expectedLabel
 * @param {!analytics.Value} val
 */
function checkLabelerHit(labeler, expectedLabel, val) {
  var hit = analytics.testing.Hits.createEventHit(val);
  labeler(hit);
  assertEquals(
      expectedLabel, hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
}

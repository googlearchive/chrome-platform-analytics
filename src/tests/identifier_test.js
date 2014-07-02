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
 * @fileoverview Tests for Identifier.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.setTestOnly();

goog.require('analytics.internal.Identifier');

goog.require('goog.testing.jsunit');


// Even though the test subject has a method the verifies that an
// id is valid, we want to provide independent validation.
/**
 * @const {RegExp}
 * @private
 */
var UUID_MATCHER_ =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;


function testGeneratedDistinctIds() {
  var id0 = analytics.internal.Identifier.generateUuid();
  var id1 = analytics.internal.Identifier.generateUuid();
  assertNotEquals(id0, id1);
}

function testIdFormatConformsToStandards() {
  var id = analytics.internal.Identifier.generateUuid();
  assertTrue(UUID_MATCHER_.test(id));
  // and it should consider it's generated id valid.
  assertTrue(analytics.internal.Identifier.isValidUuid(id));
}

function testIsValidUuid() {
  assertTrue(analytics.internal.Identifier.isValidUuid(
      '985ef133-5ef1-4efa-b331-123454321efb'));
  assertTrue(analytics.internal.Identifier.isValidUuid(
      'af54e52d-95c8-47ad-b9d1-1fe5a22cd7fa'));
}

function testNotValidUuid() {
  assertFalse(analytics.internal.Identifier.isValidUuid(
      'hello, dude.'));
  assertFalse(analytics.internal.Identifier.isValidUuid(
      'af54e52d95c847adb9d11fe5a22cd7fa'));
}


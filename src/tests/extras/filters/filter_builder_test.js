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
 * @fileoverview {@code analytics.filters.FilterBuilder} tests.
 * @author smckay@google.com (Steve McKay)
 */

goog.setTestOnly();

goog.require('analytics.EventBuilder');
goog.require('analytics.Parameters');
goog.require('analytics.filters.FilterBuilder');
goog.require('analytics.testing.Hits');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/** @type {!analytics.Tracker.Hit} */
var hit;


var recorder;


function setUp() {
  hit = analytics.testing.Hits.createEventHit(11);
  recorder = goog.testing.recordFunction();
}

function testWhen() {
  var filter = analytics.filters.FilterBuilder.builder().
      when(function(hit) { return true; }).
      applyFilter(recorder).
      build();
  filter(hit);
  recorder.assertCallCount(1);
}

function testWhen_Unmatched() {
  var filter = analytics.filters.FilterBuilder.builder().
      when(function(hit) { return false; }).
      applyFilter(recorder).
      build();
  filter(hit);
  recorder.assertCallCount(0);
}

function testWhenHitType() {
  var filter = analytics.filters.FilterBuilder.builder().
      whenHitType(
          analytics.HitTypes.APPVIEW,
          analytics.HitTypes.EVENT).
      applyFilter(recorder).
      build();
  filter(hit);
  recorder.assertCallCount(1);
}

function testWhenHitType_Unmatched() {
  var filter = analytics.filters.FilterBuilder.builder().
      whenHitType(
          analytics.HitTypes.SOCIAL,
          analytics.HitTypes.TIMING).
      applyFilter(recorder).
      build();
  filter(hit);
  recorder.assertCallCount(0);
}

function testWhenValue() {
  hit.getParameters().set(analytics.Parameters.TRANSACTION_ID, 'X');
  var filter = analytics.filters.FilterBuilder.builder().
      whenValue(
          analytics.Parameters.TRANSACTION_ID,
          'X',
          'Y',
          'Z').
      applyFilter(recorder).
      build();
  filter(hit);
  recorder.assertCallCount(1);
}

function testWhenValue_Unmatched() {
  hit.getParameters().set(analytics.Parameters.TRANSACTION_ID, 'L');
  var filter = analytics.filters.FilterBuilder.builder().
      whenValue(
          analytics.Parameters.TRANSACTION_ID,
          'X',
          'Y',
          'Z').
      applyFilter(recorder).
      build();
  filter(hit);
  recorder.assertCallCount(0);
}

function testCallsDelegateFilter() {
  var filter = analytics.filters.FilterBuilder.builder().
      when(function(hit) { return true; }).
      applyFilter(recorder).
      build();
  filter(hit);
  recorder.assertCallCount(1);
}

function testCallsDelegateFilter_Scoped() {

  /**
   * Test class so we can verify scoping of filters.
   * @constructor
   */
  var ScopeTester = function() {
    this.callCount = 0;
    this.filter = function(hit) {
      this.callCount++;
    };
  };

  var tester = new ScopeTester();
  var filter = analytics.filters.FilterBuilder.builder().
      when(function(hit) { return true; }).
      applyFilter(tester.filter, tester).
      build();
  filter(hit);
  assertEquals(1, tester.callCount);
}

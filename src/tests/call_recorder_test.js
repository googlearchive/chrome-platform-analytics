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
 * @fileoverview Tests for SingleArgRecorder from call_recorder.js.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.require('analytics.testing.SingleArgRecorder');

goog.require('goog.testing.jsunit');


/**
 * @type {!analytics.testing.SingleArgRecorder}
 */
var recorder;


function setUp() {
  recorder = new analytics.testing.SingleArgRecorder();
}

function testRecords() {
  recorder.get()('a');
  recorder.assertRecorded('a');
}

function testRecords_byIndex() {
  recorder.get()('a');
  recorder.get()('b');
  recorder.get()('c');
  recorder.assertRecorded('b', 1);
}

function testRecords_Fails() {
  recorder.get()('a');
  try {
    recorder.assertRecorded('b');
    fail('Should have failed.');
  } catch (expected) {}
}

function testTimesCalled() {
  recorder.get()('a');
  recorder.assertTimesCalled(1);
  recorder.get()('a');
  recorder.assertTimesCalled(2);
}

function testTimesCalled_Fails() {
  recorder.get()('a');
  recorder.get()('a');
  recorder.get()('b');
  recorder.get()('c');
  try {
    recorder.assertTimesCalled(1);
    fail('Should have failed.');
  } catch (expected) {}
}

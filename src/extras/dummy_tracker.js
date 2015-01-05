// Copyright 2014 Google Inc. All Rights Reserved.
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
 * @author tbreisacher@google.com (Tyler Breisacher)
 */
goog.provide('analytics.extras.DummyTracker');

goog.require('analytics.Tracker');
goog.require('analytics.internal.ServiceTracker');
goog.require('goog.async.Deferred');
goog.require('goog.events.EventTarget');



/**
 * A Tracker which no-ops for all methods. Not intended for testing; use
 * {@code analytics.testing.TestTracker} for tests.
 *
 * @constructor
 * @implements {analytics.Tracker}
 * @struct
 */
analytics.extras.DummyTracker = function() {};


/** @override */
analytics.extras.DummyTracker.prototype.set = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.send =
    function(hitType, opt_extraParams) {
  return goog.async.Deferred.succeed();
};


/** @override */
analytics.extras.DummyTracker.prototype.sendAppView = function(description) {
  return goog.async.Deferred.succeed();
};


/** @override */
analytics.extras.DummyTracker.prototype.sendEvent =
    function(category, action, opt_label, opt_value) {
  return goog.async.Deferred.succeed();
};


/** @override */
analytics.extras.DummyTracker.prototype.sendSocial =
    function(network, action, target) {
  return goog.async.Deferred.succeed();
};


/** @override */
analytics.extras.DummyTracker.prototype.sendException =
    function(opt_description) {
  return goog.async.Deferred.succeed();
};


/** @override */
analytics.extras.DummyTracker.prototype.sendTiming =
    function(category, variable, value, opt_label, opt_sampleRate) {
  return goog.async.Deferred.succeed();
};


/** @override */
analytics.extras.DummyTracker.prototype.forceSessionStart = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.startTiming =
    function(category, variable, opt_label, opt_sampleRate) {
  return new analytics.internal.ServiceTracker.Timing(
      this, category, variable, opt_label, opt_sampleRate);
};


/** @override */
analytics.extras.DummyTracker.prototype.addFilter = goog.nullFunction;

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
analytics.extras.DummyTracker.prototype.send = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.sendAppView = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.sendEvent = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.sendSocial = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.sendException = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.sendTiming = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.forceSessionStart = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.startTiming = goog.nullFunction;


/** @override */
analytics.extras.DummyTracker.prototype.getEventTarget = goog.nullFunction;

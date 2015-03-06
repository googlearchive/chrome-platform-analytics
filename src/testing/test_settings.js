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
 * @fileoverview Test instance of service settings.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.testing.TestSettings');

goog.require('analytics.internal.Identifier');
goog.require('analytics.internal.Settings');
goog.require('analytics.internal.Settings.Properties');

goog.require('goog.asserts');
goog.require('goog.async.Deferred');



/**
 * @constructor
 * @implements {analytics.internal.Settings}
 * @struct
 */
analytics.testing.TestSettings = function() {

  /** @private {boolean} */
  this.permitted_ = false;

  /** @private {number} */
  this.sampleRate_ = 100;

  /** @private {string} */
  this.userId_ = analytics.internal.Identifier.generateUuid();

  this.ready_ = new goog.async.Deferred();

  /**
   * Callbacks to trigger when settings change.
   * @private {!Array.<!function(!analytics.internal.Settings.Property)>}
   */
  this.changeListeners_ = [];
};


/**
 * Moves the settings class into the ready state.
 */
analytics.testing.TestSettings.prototype.becomeReady = function() {
  this.ready_.callback(this);
};


/** @override */
analytics.testing.TestSettings.prototype.whenReady = function() {
  return this.ready_.branch();
};


/** @override */
analytics.testing.TestSettings.prototype.addChangeListener =
    function(listener) {
  goog.asserts.assert(this.ready_.hasFired());
  this.changeListeners_.push(listener);
};


/** @override */
analytics.testing.TestSettings.prototype.setTrackingPermitted =
    function(permitted) {
  this.permitted_ = permitted;
  this.dispatchPropertyChangedEvent_(
      analytics.internal.Settings.Properties.TRACKING_PERMITTED);
};


/** @override */
analytics.testing.TestSettings.prototype.isTrackingPermitted =
    function() {
  return this.permitted_;
};


/** @override */
analytics.testing.TestSettings.prototype.setSampleRate = function(sampleRate) {
  this.sampleRate_ = sampleRate;
};


/** @override */
analytics.testing.TestSettings.prototype.getSampleRate = function() {
  return this.sampleRate_;
};


/** @override */
analytics.testing.TestSettings.prototype.getUserId = function() {
  return this.userId_;
};


/** @override */
analytics.testing.TestSettings.prototype.resetUserId = function() {
  this.userId_ = analytics.internal.Identifier.generateUuid();
  return goog.async.Deferred.succeed().addCallback(
      function() {
        this.dispatchPropertyChangedEvent_(
            analytics.internal.Settings.Properties.USER_ID);
      },
      this);
};


/** @override */
analytics.testing.TestSettings.prototype.dispose = goog.nullFunction;


/**
 * Dispatched a change event.
 * @param {!analytics.internal.Settings.Property} property
 * @private
 */
analytics.testing.TestSettings.prototype.dispatchPropertyChangedEvent_ =
    function(property) {
  goog.array.forEach(this.changeListeners_,
      function(listener) {
        listener(property);
      });
};

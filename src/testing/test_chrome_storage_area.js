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
 * @fileoverview Test version of chrome.storage.local.
 *
 * @see http://developer.chrome.com/extensions/storage.html#type-StorageArea
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.testing.TestChromeStorageArea');

goog.require('goog.object');



/**
 * @constructor
 * @extends {StorageArea}
 */
analytics.testing.TestChromeStorageArea = function() {

  /**
   * An object used to store key/value pairs in memory.
   * @type {!Object}
   * @private
   */
  this.storage_ = {};

  /**
   * Event listener for settings change events.
   * @type {?function(Object.<string, {oldValue, newValue}>)}
   * @private
   */
  this.listenCallback_ = null;
};


/** @override */
analytics.testing.TestChromeStorageArea.prototype.set = function(keys,
    opt_callback) {
  var diff = {};
  goog.object.forEach(keys, function(element, index, obj) {
    diff[index] = {oldValue: this.storage_[index], newValue: element};
  }, this);
  goog.object.extend(this.storage_, keys);

  if (opt_callback) {
    opt_callback();
  }

  if (this.listenCallback_) {
    this.listenCallback_(diff);
  }
};


/** @override */
analytics.testing.TestChromeStorageArea.prototype.get =
    function(keys, callback) {
  callback(this.storage_);
};


/**
 * Adds an event listener for settings change events.
 * @param {!function(Object.<string, {oldValue, newValue}>)} callback Callback.
 */
analytics.testing.TestChromeStorageArea.prototype.addListener =
    function(callback) {
  this.listenCallback_ = callback;
};

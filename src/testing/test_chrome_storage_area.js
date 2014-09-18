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

goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');



/**
 * @constructor
 * @final
 *
 * @extends {StorageArea}
 */
analytics.testing.TestChromeStorageArea = function() {
  /**
   * An object used to store key/value pairs in memory.
   * @private {!Object}
   */
  this.storage_ = {};

  /**
   * Event listener for settings change events.
   *
   * @private {?function(Object.<string, {oldValue, newValue}>, string)}
   */
  this.listenCallback_ = null;

  /** @private {!goog.testing.PropertyReplacer} */
  this.replacer_ = new goog.testing.PropertyReplacer();

  /** @private {function()} */
  this.uninstall_ = goog.nullFunction;
};


/** @override */
analytics.testing.TestChromeStorageArea.prototype.set =
    function(keys, opt_callback) {
  var diff = {};

  goog.object.forEach(
      keys,
      function(value, key, obj) {
        if (this.storage_[key] != value) {
          diff[key] = {oldValue: this.storage_[key], newValue: value};
        }
      }, this);

  if (!goog.object.isEmpty(diff)) {
    goog.object.extend(this.storage_, keys);
    if (this.listenCallback_) {
      this.listenCallback_(diff, 'local');
    }
  }

  goog.Timer.callOnce(
      function() {
        if (opt_callback) {
          opt_callback();
        }
      });
};


/** @override */
analytics.testing.TestChromeStorageArea.prototype.get =
    function(key, callback) {

  goog.asserts.assert(goog.isString(key),
      'key argument must be a string.');

  var result = goog.object.filter(
      this.storage_,
      function(value, entryKey) {
        return entryKey == key;
      }, this);

  goog.Timer.callOnce(
      function() {
        callback(result);
      });
};


/**
 * Adds an event listener for settings change events.
 * @param {!function(Object.<string, {oldValue, newValue}>)} callback Callback.
 */
analytics.testing.TestChromeStorageArea.prototype.addListener =
    function(callback) {
  this.listenCallback_ = callback;
};


/**
 * Installs the test chrome storage area in the chrome.storage.local area.
 *
 * @suppress {const|checkTypes}
 */
analytics.testing.TestChromeStorageArea.prototype.install = function() {
  goog.asserts.assert(
      !goog.isDef(chrome.storage),
      'chrome.storage is already defined.');

  chrome.storage = {};
  this.replacer_.set(chrome.storage, 'local', this);

  chrome.storage.onChanged = {};
  this.replacer_.set(
      chrome.storage.onChanged,
      'addListener',
      goog.bind(
          function(listener) {
            this.addListener(listener);
          },
          this));

  this.uninstall_ = goog.bind(
      function() {
        goog.asserts.assert(goog.isObject(chrome.storage));
        this.replacer_.reset();
        delete chrome.storage.onChanged;
        delete chrome.storage;
        goog.asserts.assert(!goog.isDef(chrome.storage));
      },
      this);
};


/** Uninstalls test instrumentation. */
analytics.testing.TestChromeStorageArea.prototype.uninstall = function() {
  this.uninstall_();
};

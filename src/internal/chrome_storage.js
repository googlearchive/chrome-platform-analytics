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
 * @fileoverview Simple wappers for chrome.storage.{sync|local} which produces
 * Deferreds instead of taking callbacks.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.ChromeStorage');

goog.require('analytics.internal.AsyncStorage');
goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.string');



/**
 * A thin wrapper around chrome.storage.local which produces Deferreds
 * instead of taking callbacks. The storage is shared between all the
 * code (in the same app) that requests it necessitating a namespace.
 *
 * @constructor
 * @implements {analytics.internal.AsyncStorage}
 * @extends {goog.events.EventTarget}
 * @struct @suppress {checkStructDictInheritance}
 */
analytics.internal.ChromeStorage = function() {
  analytics.internal.ChromeStorage.base(this, 'constructor');

  /** @private {string} */
  this.namespace_ = 'google-analytics';

  /** @private {!StorageArea} */
  this.storage_ = chrome.storage.local;

  // Get notified when our underlying storage changes.
  chrome.storage.onChanged.addListener(
      goog.bind(this.onStorageChanged_, this));
};
goog.inherits(
    analytics.internal.ChromeStorage,
    goog.events.EventTarget);


/**
 * Notifies listeners when underlying storage changes.
 *
 * @see https://developer.chrome.com/extensions/storage#type-StorageArea
 *
 * @param {!Object} changes
 * @param {string} areaName "sync", "local" or "managed"
 * @private
 */
analytics.internal.ChromeStorage.prototype.onStorageChanged_ =
    function(changes, areaName) {
  goog.asserts.assert(areaName == 'local');
  if (this.hasChangesInNamespace_(changes)) {
    this.dispatchEvent(analytics.internal.AsyncStorage.Event.STORAGE_CHANGED);
  }
};


/**
 * Returns true if any of the given changes is in our namespace.
 * Namespaces, mind you, aren't protected, so take this answer
 * with a grain of salt.
 *
 * @param {!Object} changes
 * @return {boolean}
 * @private
 */
analytics.internal.ChromeStorage.prototype.hasChangesInNamespace_ =
    function(changes) {
  return goog.array.some(
      goog.object.getKeys(changes),
      /**
       * @param {string} key
       * @this {analytics.internal.ChromeStorage}
       */
      function(key) {
        return goog.string.startsWith(key, this.namespace_);
      },
      this);
};


/** @override */
analytics.internal.ChromeStorage.prototype.get = function(key) {
  var d = new goog.async.Deferred();
  var fullKey = this.namespace_ + '.' + key;
  this.storage_.get(
      fullKey,
      /** @param {Object} items */
      function(items) {
        if (chrome.runtime.lastError) {
          d.errback(chrome.runtime.lastError);
        } else {
          var value = items[fullKey];
          d.callback(
              goog.isDefAndNotNull(value) ?
              value.toString() : undefined);
        }
      });

  return d;
};


/** @override */
analytics.internal.ChromeStorage.prototype.set = function(key, value) {
  var d = new goog.async.Deferred();

  var data = {};
  data[this.namespace_ + '.' + key] = value;
  this.storage_.set(
      data,
      function() {
        if (chrome.runtime.lastError) {
          d.errback(chrome.runtime.lastError);
        } else {
          d.callback();
        }
      });

  return d;
};

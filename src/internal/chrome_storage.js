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

goog.require('goog.async.Deferred');



/**
 * A thin wrapper around chrome.storage.{sync|local} which produces Deferreds
 * instead of taking callbacks. Inspired by
 * //photos/chromeapp/src/data/storage_area_utilities.js
 * The storage is shared between all the code (in the same app) that requests
 * it, so using an optional namespace is recommended. This provides separation
 * and makes key collisions unlikely.
 * @param {!StorageArea} storage The storage: chrome.storage.{sync|local}.
 * @param {string=} opt_namespace Namespace to prevent key collisions.
 * @constructor
 * @implements {analytics.internal.AsyncStorage}
 * @struct
 */
analytics.internal.ChromeStorage = function(storage, opt_namespace) {
  if (!goog.isObject(storage)) {
    throw new Error("'storage' argument must be defined and not null.");
  }

  /** @private {!StorageArea} */
  this.storage_ = storage;

  this.namespace_ = opt_namespace || '';
};


/** @override */
analytics.internal.ChromeStorage.prototype.get = function(key) {
  var d = new goog.async.Deferred();
  var fullKey = this.namespace_ + '.' + key;
  this.storage_.get(
      fullKey,
      /** @param {Object} items */
      function(items) {
        var error = chrome.runtime.lastError;
        if (error) {
          d.errback(error);
        } else {
          var value = items[fullKey];
          d.callback(value);
        }
      });

  return d;
};


/** @override */
analytics.internal.ChromeStorage.prototype.set = function(key, value) {
  var d = new goog.async.Deferred();

  var data = {};
  data[this.namespace_ + '.' + key] = value;
  this.storage_.set(data, function() {
    var error = chrome.runtime.lastError;
    if (error) {
      d.errback(error);
    } else {
      d.callback();
    }
  });

  return d;
};

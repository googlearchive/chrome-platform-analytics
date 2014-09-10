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

goog.provide('analytics.internal.Html5Storage');

goog.require('analytics.internal.AsyncStorage');

goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.string');



/**
 * An semi-asynchronous wrapper around HTML5 local storage. Storage is shared
 * between all instances. Avoid collisions by supplying a namespace.
 *
 * @constructor
 * @implements {analytics.internal.AsyncStorage}
 * @extends {goog.events.EventTarget}
 * @struct @suppress {checkStructDictInheritance}
 *
 * @param {string} namespace Namespace to prevent key collisions.
 */
analytics.internal.Html5Storage = function(namespace) {
  goog.base(this);

  /** @private {string} */
  this.namespace_ = namespace;

  /** @private {!Storage} */
  this.storage_ = /** @type {!Storage} */ (window.localStorage);

  // Get notified when our underlying storage changes.
  // NOTE: Unlike Chrome storage, this only fires when
  // storage is changed in a different script context.
  window.addEventListener(
      'storage',
      goog.bind(
          function(event) {
            goog.asserts.assert(event instanceof StorageEvent);
            this.onStorageChanged_(event);
          },
          this),
      false);
};
goog.inherits(
    analytics.internal.Html5Storage,
    goog.events.EventTarget);


/**
 * Notifies listeners when underlying storage changes.
 * NOTE: Unlike Chrome storage, this only fires when
 * storage is changed in a different script context.
 *
 * @param {!StorageEvent} event
 * @private
 */
analytics.internal.Html5Storage.prototype.onStorageChanged_ =
    function(event) {
  if (event.storageArea == this.storage_ &&
      goog.string.startsWith(event.key, this.namespace_)) {
    this.dispatchEvent(analytics.internal.AsyncStorage.Event.STORAGE_CHANGED);
  }
};


/** @override */
analytics.internal.Html5Storage.prototype.get = function(key) {
  var value = this.storage_.getItem(this.namespace_ + '.' + key);
  return goog.async.Deferred.succeed(
      goog.isDefAndNotNull(value) ? value : undefined);
};


/** @override */
analytics.internal.Html5Storage.prototype.set = function(key, value) {
  this.storage_.setItem(this.namespace_ + '.' + key, value);
  var d = goog.async.Deferred.succeed();
  d.branch().addCallback(
      function() {
          this.dispatchEvent(
              analytics.internal.AsyncStorage.Event.STORAGE_CHANGED);
      },
      this);
  return d;
};

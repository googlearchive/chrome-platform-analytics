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
goog.require('goog.Timer');
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
 */
analytics.internal.Html5Storage = function() {
  goog.base(this);

  /** @private {string} */
  this.namespace_ = 'google-analytics';

  /** @private {!Storage} */
  this.storage_ = /** @type {!Storage} */ (window.localStorage);

  // Get notified when our underlying storage changes.
  // NOTE: Unlike Chrome storage, this only fires when
  // storage is changed in a different script context.
  goog.events.listen(
      window,
      'storage',
      goog.bind(this.onStorageChanged_, this),
      false);
};
goog.inherits(
    analytics.internal.Html5Storage,
    goog.events.EventTarget);


/** @override */
analytics.internal.Html5Storage.prototype.get = function(key) {
  var value = this.get_(key);

  var d = new goog.async.Deferred();
  goog.Timer.callOnce(
      function() {
        d.callback(value);
      });
  return d;
};


/** @override */
analytics.internal.Html5Storage.prototype.set = function(key, value) {
  var changed = (value != this.get_(key));
  if (changed) {
    this.storage_.setItem(this.namespace_ + '.' + key, value);
    this.dispatchEvent(
        analytics.internal.AsyncStorage.Event.STORAGE_CHANGED);
  }

  var d = new goog.async.Deferred();
  goog.Timer.callOnce(
      function() {
        d.callback();
      });
  return d;
};


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
  // IE, duh.
  if (!(event instanceof StorageEvent) && event.type == 'storage') {
    event = window.event;
  }
  if (!('storageArea' in event)) {
    throw new Error(
        '"storageArea" property missing from event type: ' + event.type);
  }
  if (!('key' in event)) {
    throw new Error('"key" property missing from event type: ' + event.type);
  }
  if (event.storageArea == this.storage_ &&
      goog.string.startsWith(event.key, this.namespace_)) {
    this.dispatchEvent(analytics.internal.AsyncStorage.Event.STORAGE_CHANGED);
  }
};


/**
 * @param {string} key
 *
 * @return {string|undefined} value or undefined if not set.
 * @private
 */
analytics.internal.Html5Storage.prototype.get_ = function(key) {
  var value = this.storage_.getItem(this.namespace_ + '.' + key);
  return goog.isDefAndNotNull(value) ? value : undefined;
};

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
 * @fileoverview Interface for async storage of simple values.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.AsyncStorage');

goog.require('goog.async.Deferred');
goog.require('goog.events');



/**
 * Interface for asynchronous persistent storage.
 *
 * @interface
 * @extends {goog.events.Listenable}
 */
analytics.internal.AsyncStorage = function() {};


/**
 * @param {string} key Key to retrieve -- must be non-empty.
 * @return {!goog.async.Deferred.<string>} A deferred firing
 *     with the loaded value, or undefined if the value is not set.
 */
analytics.internal.AsyncStorage.prototype.get;


/**
 * @param {string} key
 * @param {!string} value Must not be null or undefined.
 * @return {!goog.async.Deferred} A deferred firing when the value is set.
 */
analytics.internal.AsyncStorage.prototype.set;


/**
 * Event supported by AsyncStorage instances.
 * @enum {string}
 */
analytics.internal.AsyncStorage.Event = {
  STORAGE_CHANGED: goog.events.getUniqueId('storage-changed')
};

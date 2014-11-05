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
 * @fileoverview Interface for persistent settings.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.Settings');
goog.provide('analytics.internal.Settings.Properties');
goog.provide('analytics.internal.Settings.Property');

goog.require('analytics.Config');



/**
 * @interface
 * @extends {analytics.Config}
 */
analytics.internal.Settings = function() {};


/**
 * @return {!goog.async.Deferred<?>} A deferred
 *     firing when the settings object is ready to handle method calls.
 */
analytics.internal.Settings.prototype.whenReady;


/**
 * Adds a listener to be notified of changes. This may only be called if the
 * Deferred from whenReady() has succeeded.
 * @param {function(!analytics.internal.Settings.Property)} listener
 */
analytics.internal.Settings.prototype.addChangeListener;


/**
 * Throws an error if the value has not yet been read from storage.
 * @return {string} User id for the current user.
 */
analytics.internal.Settings.prototype.getUserId;


/**
 * @return {number} User sample rate (an int from 1 to 100).
 */
analytics.internal.Settings.prototype.getSampleRate;


/**
 * Cleanup all internal state before being destroyed.
 * This exists solely to tightly manage the lifecycle of the
 * ServiceSettings object when used in integration testing.
 * This is necessitated due to unpredictable object
 * cleanup in IE browsers.
 */
analytics.internal.Settings.prototype.dispose;


/** @typedef {string} */
analytics.internal.Settings.Property;


/**
 * Listenable properties used anywhere a string key is needed to identify.
 * @enum {!analytics.internal.Settings.Property}
 */
analytics.internal.Settings.Properties = {
  USER_ID: 'analytics.user-id',
  TRACKING_PERMITTED: 'analytics.tracking-permitted'
};

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
 * @fileoverview Interface for a simple key/value based tracker object providing
 * partially-stateful incremental building of hits.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.Tracker');

goog.require('analytics.HitType');
goog.require('analytics.Parameter');
goog.require('analytics.Value');



/**
 * @interface
 */
analytics.Tracker = function() {};


/**
 * Sets an individual value, replacing any previously set values.
 *
 * @param {!analytics.Parameter|string} param
 * @param {!analytics.Value} value
 */
analytics.Tracker.prototype.set;


/**
 * Sends the Event to Google Analytics.
 *
 * @param {!analytics.HitType} hitType
 * @param {!Object=} opt_extraParams An optional object containing
 *     {@code string} / {@code !analytics.Value} pairs
 *     to send with the hit. The values are NOT persisted in the tracker.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.send;


/**
 * Sends the AppView hit to Google Analytics. Also persists the value
 * for inclusion in all subsequent hits.
 *
 * @param {string} description A unique description of the "screen" (
 *     or "place, or "view") within your application. This is should more
 *     specific than your app name, but generally not include any runtime
 *     data. In most cases all "screens" should be known at the time
 *     the app is build. Examples: "MainScreen" or "SettingsView".
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendAppView;


/**
 * Sends the Event hit to Google Analytics.
 *
 * @param {string} category Specifies the event category.
 * @param {string} action Specifies the event action.
 * @param {string=} opt_label Specifies the event label.
 * @param {number=} opt_value Specifies the event value.
 *     Values must be non-negative.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendEvent;


/**
 * Sends the Social hit to Google Analytics.
 *
 * @param {string} network Specifies the social network, for example Facebook
 *     or Google Plus.
 * @param {string} action Specifies the social interaction action.
 *     For example on Google Plus when a user clicks the +1 button,
 *     the social action is 'plus'.
 * @param {string} target Specifies the target of a social interaction.
 *     This value is typically a URL but can be any text.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendSocial;


/**
 * Sends the Exception hit to Google Analytics.
 *
 * @param {string=} opt_description Specifies the description of an exception.
 * @param {boolean=} opt_fatal Was the exception fatal.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendException;

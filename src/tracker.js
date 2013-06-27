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
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.Tracker');

goog.require('analytics.HitType');
goog.require('analytics.Parameter');
goog.require('analytics.Value');



/**
 * Provides support for sending hits to Google Analytics using convenient
 * named methods like {@code sendAppView} and {@code sendEvent} or the
 * general purpose {@code send} method.
 *
 * <p>Clients can set session values using {@code set}. These values, once set,
 * are included in all subsequent hits.
 *
 * <p>For analytics hittypes that are not supported by a named method clients
 * can call {@code send} with param/value {@code Object} describing the hit.
 *
 * Obtain a instance using the {@code analytics.Service#getTracker}.
 *
 * @interface
 */
analytics.Tracker = function() {};


/**
 * Sets an individual value on the {@code Tracker}, replacing any previously
 * set values with the same param. The value is persistent for the life
 * of the {@code Tracker} instance, or until replaced with another call
 * to {@code set}.

 *
 * @param {!analytics.Parameter|string} param
 * @param {!analytics.Value} value
 */
analytics.Tracker.prototype.set;


/**
 * Sends a hit to Google Analytics. Caller is responsible for ensuring the
 * of the information sent with that hit. Values can be provided either
 * using {@code set} or using {@code opt_extraParams}.
 *
 * <p>Whenever possible use a named method like {@code sendAppView} or
 * {@code sendEvent}.

 *
 * @param {!analytics.HitType} hitType
 * @param {!Object=} opt_extraParams An optional object containing
 *     {@code string} / {@code !analytics.Value} pairs
 *     to send with the hit. The values are NOT persisted in the tracker.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.send;


/**
 * Sends an AppView hit to Google Analytics.

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
 * Sends an Event hit to Google Analytics.

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
 * Sends a Social hit to Google Analytics.

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
 * Sends an Exception hit to Google Analytics.

 *
 * @param {string=} opt_description Specifies the description of an exception.
 * @param {boolean=} opt_fatal Was the exception fatal.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendException;


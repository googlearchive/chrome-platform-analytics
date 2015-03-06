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

goog.provide('analytics.Config');



/**
 * Provides support for reading and manipulating the configuration of the
 * library.
 *
 * Obtain a instance using the {@code analytics.Service#getConfig}.
 *
 * @interface
 */
analytics.Config = function() {};


/**
 * As a user of this library you must permit users to opt-out of tracking.
 * This method provides support for persistently enabling or disabling tracking
 * for the current user on the current device.
 *
 * <p>When your code calls {@code setTrackingPermitted(false)} this library
 * will dynamically disable tracking. This means you are free to instrument
 * your application with analytics tracking code, then enable/disable
 * the sending of tracking information with this method. You do NOT need to
 * guard calls to tracking in your code.
 *
 * <p>For further information on how to support opt-out in your application see
 * https://github.com/GoogleChrome/chrome-platform-analytics/wiki/Respecting-User-Privacy
 *
 * @param {boolean} permitted True if tracking is permitted.
 */
analytics.Config.prototype.setTrackingPermitted;


/**
 * Returns true if tracking is enabled.
 *
 * @return {boolean} True if tracking is permitted.
 */
analytics.Config.prototype.isTrackingPermitted;


/**
 * Sets the user sample rate. This can be used if you need to reduce the
 * number of users reporting analytics information to Google Analytics.
 * Most clients will not need to set this. Value is NOT persisted
 * across sessions.
 *
 * @param {number} sampleRate User sample rate. An integer from 1 to 100.
 *     If not set defaults to 100.
 */
analytics.Config.prototype.setSampleRate;


/**
 * Resets the user id. This is useful for clients wishing to afford users
 * the opportunity to reset the auto-generated user id. Immediately generates
 * a new user ID. Client code can continue using existing tracker objects.
 *
 * @return {!goog.async.Deferred} Settles once the id has been reset.
 */
analytics.Config.prototype.resetUserId;

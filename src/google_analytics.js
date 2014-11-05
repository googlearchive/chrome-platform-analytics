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

goog.provide('analytics.GoogleAnalytics');



/**
 * Service object providing access to {@code analytics.Tracker} and
 * {@code analytics.Config} objects.
 *
 * <p>An instance of this can be obtained using {@code analytics.getService}.
 *
 * @interface
 */
analytics.GoogleAnalytics = function() {};


/**
 * Creates a new {@code analytics.Tracker} instance.
 * @param {string} trackingId Your Google Analytics tracking id. This id must
 *     be for an "app" style analytics property.
 * See {@link https://support.google.com/analytics/answer/2614741} for details.
 *
 * @return {!analytics.Tracker}
 */
analytics.GoogleAnalytics.prototype.getTracker;


/**
 * Provides read/write access to the runtime configuration information used
 * by the Google Analytics service classes.
 *
 * @return {!goog.async.Deferred.<!analytics.Config>} A deferred
 *     that fires when the object is ready to handle method calls.
 *     Deferred is necessary to allow for object initialization from
 *     asynchronous storage.
 */
analytics.GoogleAnalytics.prototype.getConfig;

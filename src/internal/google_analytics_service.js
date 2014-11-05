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
 * @fileoverview The primary implementation of the analytics.GoogleAnalytics
 * interface.
 *
 * @author kenobi@google.com (Ben Kwa)
 */

goog.provide('analytics.internal.GoogleAnalyticsService');

goog.require('analytics.GoogleAnalytics');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.ServiceTracker');

goog.require('goog.dom');



/**
 * Do not construct this directly, instead call {@code analytics.getService}.
 * @constructor
 * @implements {analytics.GoogleAnalytics}
 * @struct
 *
 * @param {string} libVersion The string that identifies this version of this
 *     library.
 * @param {string} appName The Chromium Platform App name.
 * @param {string} appVersion The version of the platform app.
 * @param {!analytics.internal.Settings} settings
 * @param {!analytics.internal.ChannelManager.Factory} channelFactory
 */
analytics.internal.GoogleAnalyticsService = function(
    libVersion,
    appName,
    appVersion,
    settings,
    channelFactory) {

  /** @private {string} */
  this.libVersion_ = libVersion;

  /** @private {string} */
  this.appName_ = appName;

  /** @private {string} */
  this.appVersion_ = appVersion;

  /** @private {!analytics.internal.Settings} */
  this.settings_ = settings;

  /** @private {!analytics.internal.ChannelManager.Factory} */
  this.channelFactory_ = channelFactory;
};


/** @override */
analytics.internal.GoogleAnalyticsService.prototype.getTracker =
    function(trackingId) {

  var tracker = new analytics.internal.ServiceTracker(
      this.settings_,
      this.channelFactory_.create());

  tracker.set(analytics.internal.Parameters.LIBRARY_VERSION, this.libVersion_);
  tracker.set(analytics.internal.Parameters.API_VERSION, 1);
  tracker.set(analytics.internal.Parameters.APP_NAME, this.appName_);
  tracker.set(analytics.internal.Parameters.APP_VERSION, this.appVersion_);
  tracker.set(analytics.internal.Parameters.TRACKING_ID, trackingId);

  analytics.internal.GoogleAnalyticsService.addEnvironmentalParams_(tracker);

  return tracker;
};


/** @override */
analytics.internal.GoogleAnalyticsService.prototype.getConfig = function() {
  return this.settings_.whenReady();
};


/**
 * Adds environmental details like screen size, color depth.
 * @param {!analytics.Tracker} tracker
 * @private
 */
analytics.internal.GoogleAnalyticsService.addEnvironmentalParams_ =
    function(tracker) {
  var value = navigator.language ||
      navigator.browserLanguage;
  if (value) {
    tracker.set(analytics.internal.Parameters.LANGUAGE, value);
  }

  // Note: We're using ['foo'] notation to avoid issues with missing
  // externs and the possibility of the closure compiler renaming fields.
  value = screen.colorDepth + '-bit';
  if (value) {
    tracker.set(analytics.internal.Parameters.SCREEN_COLORS, value);
  }

  value = [screen.width, screen.height].join('x');

  if (value) {
    tracker.set(analytics.internal.Parameters.SCREEN_RESOLUTION, value);
  }

  var size = goog.dom.getViewportSize();
  value = [size.width, size.height].join('x');

  if (value) {
    tracker.set(analytics.internal.Parameters.VIEWPORT_SIZE, value);
  }
};

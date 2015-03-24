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
 * @fileoverview Provides support for creating service objects.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.LIBRARY_VERSION');
goog.provide('analytics.getService');
goog.provide('analytics.resetForTesting');

goog.require('analytics.internal.ChromeStorage');
goog.require('analytics.internal.GoogleAnalyticsService');
goog.require('analytics.internal.ServiceChannelManager');
goog.require('analytics.internal.ServiceSettings');
goog.require('analytics.internal.SharedChannelFactory');
goog.require('goog.string');
goog.require('goog.structs.Map');


/**
 * The current version of this library. Should be increased whenever we make a
 * major change to the library.
 * @const {string}
 */
analytics.LIBRARY_VERSION = 'ca1.6.0';


/**
 * The URL of the GA server. This library only communicates over SSL.
 * @private {string}
 */
analytics.GA_SERVER_ = 'https://www.google-analytics.com/collect';


/**
 * The maximum number of characters that can be included in the POST payload.
 * @private {number}
 */
analytics.MAX_POST_LENGTH_ = 8192;


/**
 * @private {!goog.structs.Map.<string,
 *     analytics.internal.GoogleAnalyticsService>}
 */
analytics.serviceInstances_ = new goog.structs.Map();


/**
 * @private {!analytics.internal.Settings}
 */
analytics.settings_;


/**
 * @private {!analytics.internal.ChannelManager.Factory}
 */
analytics.channelFactory_;


/**
 * Resets the global runtime state for the purposes of testing.
 *
 * @suppress {checkTypes}
 */
analytics.resetForTesting = function() {
  if (!goog.isObject(analytics.settings_)) {
    throw new Error('Invalid analytics.settings_');
  }
  analytics.settings_.dispose();
  analytics.settings_ = undefined;
  analytics.channelFactory_ = undefined;
  analytics.serviceInstances_ = new goog.structs.Map();
};


/**
 * Returns a service instance for the named Chrome Platform App/Extension.
 * Generally you'll only ever want to call this with a single name that
 * identifies the host Chrome Platform App/Extension or extension using the
 * library. This name is used to scope hits to your app on Google Analytics.
 *
 * @param {string} appName The name of your Chrome Platform App/Extension.
 *     Though library could read the name of the app from the chrome manifest
 *     file as it does with the app version, the name may in fact be translated.
 * @param {string=} opt_appVersion An optional app version.  If provided, this
 *     overrides the default app version (which is read from the app manifest).
 *
 * @return {!analytics.GoogleAnalytics}
 */
analytics.getService = function(appName, opt_appVersion) {
  var service = analytics.serviceInstances_.get(appName, null);
  var appVersion = opt_appVersion || analytics.getAppVersion_();
  if (goog.isNull(service)) {
    service = analytics.createService_(appName, appVersion);
    analytics.serviceInstances_.set(appName, service);
  }
  return service;
};


/**
 * @return {!analytics.internal.Settings}
 * @private
 */
analytics.getSettings_ = function() {
  if (!analytics.settings_) {
    analytics.settings_ = new analytics.internal.ServiceSettings(
        new analytics.internal.ChromeStorage());
  }

  return analytics.settings_;
};


/**
 * @param {string} appName
 * @param {string} appVersion
 *
 * @return {!analytics.internal.GoogleAnalyticsService}
 * @private
 */
analytics.createService_ = function(appName, appVersion) {
  return new analytics.internal.GoogleAnalyticsService(
      analytics.LIBRARY_VERSION,
      appName,
      appVersion,
      analytics.getSettings_(),
      analytics.getChannelFactory_());
};


/**
 * @return {string} version number
 * @private
 */
analytics.getAppVersion_ = function() {
  var manifest = chrome.runtime.getManifest();
  return manifest.version;
};


/**
 * @return {!analytics.internal.ChannelManager.Factory}
 * @private
 */
analytics.getChannelFactory_ = function() {
  if (!analytics.channelFactory_) {
    var settings = analytics.getSettings_();
    analytics.channelFactory_ =
        new analytics.internal.ServiceChannelManager.Factory(
            settings,
            new analytics.internal.SharedChannelFactory(
                settings,
                analytics.GA_SERVER_,
                analytics.MAX_POST_LENGTH_));
  }
  return analytics.channelFactory_;
};


/**
 * The "protocol" portion of URLs in Chrome Apps.
 * @private {string}
 */
analytics.CHROME_APP_PROTOCOL_ = 'chrome-extension:';

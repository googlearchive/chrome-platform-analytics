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

goog.provide('analytics.GoogleAnalytics');
goog.provide('analytics.getService');
goog.provide('analytics.resetForTesting');

goog.require('analytics.Tracker');
goog.require('analytics.internal.Channel');
goog.require('analytics.internal.ChromeStorage');
goog.require('analytics.internal.GoogleAnalyticsService');
goog.require('analytics.internal.Html5Storage');
goog.require('analytics.internal.ServiceChannelManager.Factory');
goog.require('analytics.internal.ServiceSettings');
goog.require('analytics.internal.SharedChannelFactory');
goog.require('goog.string');
goog.require('goog.structs.Map');


/**
 * The current version of this library. Should be increased whenever we make a
 * major change to the library.
 * @const {string}
 */
analytics.LIBRARY_VERSION = 'ca1.5.2';


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
  analytics.serviceInstances_ = new goog.structs.Map();
  analytics.settings_ = undefined;
  analytics.channelFactory_ = undefined;
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
 *     For this reason the caller must supplied a name.
 * @param {string=} opt_appVersion For Chrome apps this will be automatically
 *     read from the manifest file, therefor it can be omitted. For all
 *     other environments this value must be specified.
 *
 * @return {!analytics.GoogleAnalytics}
 */
analytics.getService = function(appName, opt_appVersion) {
  var service = analytics.serviceInstances_.get(appName, null);
  if (goog.isNull(service)) {
    service = analytics.createService_(
        appName, analytics.getAppVersion_(opt_appVersion));
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
    /** @type {!analytics.internal.AsyncStorage} */
    var storage = analytics.isChromeApp_() ?
        new analytics.internal.ChromeStorage() :
        new analytics.internal.Html5Storage();

    analytics.settings_ = new analytics.internal.ServiceSettings(storage);
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
 * @param {string=} opt_version Value is ignored if the
 *     script is hosted in a chrome app, else the value
 *     must be non-empty.
 *
 * @return {string} version number
 * @private
 */
analytics.getAppVersion_ = function(opt_version) {
  if (analytics.isChromeApp_()) {
    var manifest = chrome.runtime.getManifest();
    return manifest.version;
  }

  if (!goog.isString(opt_version) || goog.string.isEmpty(opt_version)) {
    throw new Error('Invalid version. Must be non-empty string.');
  }
  return opt_version;
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


/**
 * @return {boolean} Whether this code is being executed from within a Chrome
 *     App.
 * @private
 */
analytics.isChromeApp_ = function() {
  return goog.global.location.protocol == analytics.CHROME_APP_PROTOCOL_;
};



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

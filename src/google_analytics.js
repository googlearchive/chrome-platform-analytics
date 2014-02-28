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
goog.require('analytics.internal.AsyncSettingsChannel');
goog.require('analytics.internal.Channel');
goog.require('analytics.internal.ChromeStorage');
goog.require('analytics.internal.DummyChannel');
goog.require('analytics.internal.GoogleAnalyticsService');
goog.require('analytics.internal.ParameterFilterChannel');
goog.require('analytics.internal.RateLimitingChannel');
goog.require('analytics.internal.ServiceChannel');
goog.require('analytics.internal.ServiceSettings');
goog.require('analytics.internal.Settings');
goog.require('analytics.internal.TokenBucket');
goog.require('analytics.internal.UserSamplingChannel');
goog.require('analytics.internal.XhrChannel');

goog.require('goog.events.OnlineHandler');
goog.require('goog.net.NetworkStatusMonitor');
goog.require('goog.structs.Map');


/**
 * The current version of this library. Should be increased whenever we make a
 * major change to the library.
 * @private {string}
 */
analytics.LIBRARY_VERSION_ = 'ca3';


/** @private {string} */
analytics.STORAGE_NAMESPACE_ = 'google-analytics';


/**
 * @private {!goog.structs.Map.<string,
 *     analytics.internal.GoogleAnalyticsService>}
 */
analytics.serviceInstances_ = new goog.structs.Map();


/**
 * Resets the global runtime state for the purposes of testing.
 */
analytics.resetForTesting = function() {
  analytics.serviceInstances_ = new goog.structs.Map();
  analytics.channelPipeline_ = undefined;
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
 *
 * @return {!analytics.GoogleAnalytics}
 */
analytics.getService = function(appName) {
  var service = analytics.serviceInstances_.get(appName, null);
  if (goog.isNull(service)) {
    service = analytics.createService_(appName);
    analytics.serviceInstances_.set(appName, service);
  }
  return service;
};


/**
 * @return {!analytics.internal.Settings}
 * @private
 */
analytics.createSettings_ = function() {
  /** @type {!analytics.internal.AsyncStorage} */
  var storage = new analytics.internal.ChromeStorage(
      chrome.storage.local,
      analytics.STORAGE_NAMESPACE_);

  return new analytics.internal.ServiceSettings(storage);
};


/**
 * @param {string} appName
 * @return {!analytics.internal.GoogleAnalyticsService}
 * @private
 */
analytics.createService_ = function(appName) {
  var appVersion = analytics.getAppVersion_();
  return new analytics.internal.GoogleAnalyticsService(
      analytics.LIBRARY_VERSION_,
      appName,
      appVersion,
      analytics.createSettings_());
};


/**
 * @return {string} version number of the host chrome app.
 * @private
 */
analytics.getAppVersion_ = function() {
  var manifest = chrome.runtime.getManifest();
  return manifest.version;
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
 * @param {string} trackingId Your Google Analytics tracking id. This id should
 *     be for an "app" style property.
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

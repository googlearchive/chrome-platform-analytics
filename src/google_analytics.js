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
 * The URL of the GA server. This library only communicates over SSL.
 * @private {string}
 */
analytics.GA_SERVER_ = 'https://www.google-analytics.com/collect';


/**
 * The current version of this library. Should be increased whenever we make a
 * major change to the library.
 * @private {string}
 */
analytics.LIBRARY_VERSION_ = 'ca1';


/** @private {string} */
analytics.STORAGE_NAMESPACE_ = 'google-analytics';


/**
 * The maximum number of characters that can be included in the POST payload.
 * @private {number}
 */
analytics.MAX_POST_LENGTH_ = 8192;


/** @private {!goog.structs.Map.<string, analytics.internal.ServiceChannel>} */
analytics.serviceInstances_ = new goog.structs.Map();


/**
 * The channel that handles hits sent from a tracker instance. All
 * tracker instances share this single, lazily initialized, channel instance.
 * @private {!analytics.internal.Channel|undefined}
 */
analytics.channelPipeline_;


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
 * library. This name is used to scoped hits to your app on Google Analytics.
 *
 * @param {string} appName The name of your Chrome Platform App/Extension.
 *     Though library could read the name of the app from the chrome manifest
 *     file as it does with the app version, the name may in fact be translated.
 *     For this reason the caller must supplied a name.
 *
 * @return {!analytics.GoogleAnalytics}
 */
analytics.getService = function(appName) {
  var service = /** @type {analytics.GoogleAnalytics} */ (
      analytics.serviceInstances_.get(appName, null));
  if (goog.isNull(service)) {
    service = analytics.createService_(appName);
    analytics.serviceInstances_.set(appName, service);
  }
  return /** @type {!analytics.GoogleAnalytics} */ (service);
};


/**
 * @return {!analytics.internal.Settings}
 * @private
 */
analytics.createSettings_ = function() {
  /** @type {analytics.internal.AsyncStorage} */
  var storage = new analytics.internal.ChromeStorage(
      chrome.storage.local,
      analytics.STORAGE_NAMESPACE_);

  // TODO(smckay): storage will be null if no persistent key/value
  // storage is available. In that case create a *DisabledUser* settings,
  // and use that bad boy.
  goog.asserts.assert(!goog.isNull(storage));

  return new analytics.internal.ServiceSettings(storage);
};


/**
 * @param {string} appName
 * @return {!analytics.internal.ServiceChannel}
 * @private
 */
analytics.createService_ = function(appName) {

  var appVersion = analytics.getAppVersion_();
  return new analytics.internal.ServiceChannel(
      appName,
      appVersion,
      analytics.createSettings_(),
      analytics.internal.ChannelPipelineFactory_,
      analytics.internal.DummyChannel.getInstance());
};


/**
 * Returns a factory that lazily creates the runtime Channel pipeline that
 * handles requests for users with tracking enabled. The use of a factory
 * enables delayed initialization of the pipeline. Deferred initialization is
 * necessitated by asynchronous loading of settings from local storage.
 * @param {!analytics.internal.Settings} settings A ready settings object.
 * @return {!analytics.internal.Channel} The channel.
 * @private
 */
analytics.internal.ChannelPipelineFactory_ = function(settings) {
  if (!analytics.channelPipeline_) {

    /** @type {!goog.net.NetworkStatusMonitor} */
    var networkStatus = new goog.events.OnlineHandler();

    /** @type {!analytics.internal.Channel} */
    var xhrChannel =
        new analytics.internal.XhrChannel(
            analytics.GA_SERVER_,
            analytics.MAX_POST_LENGTH_,
            networkStatus);

    /** @type {!analytics.internal.Channel} */
    var paramFilterChannel = new analytics.internal.ParameterFilterChannel(
        xhrChannel,
        analytics.LIBRARY_VERSION_);

    /** @type {!analytics.internal.TokenBucket} */
    var tokenBucket = new analytics.internal.TokenBucket(
        60, 500, analytics.internal.TokenBucket.FillRate.ONE_EVERY_TWO_SECONDS);

    /** @type {!analytics.internal.Channel} */
    var limitingChannel = new analytics.internal.RateLimitingChannel(
        tokenBucket, paramFilterChannel);

    /** @type {!analytics.internal.Channel} */
    var samplerChannel = new analytics.internal.UserSamplingChannel(
        settings,
        limitingChannel);

    /** @type {!analytics.internal.Channel} */
    var asyncSettingsChannel = new analytics.internal.AsyncSettingsChannel(
        settings, samplerChannel);

    analytics.channelPipeline_ = asyncSettingsChannel;
  }

  return analytics.channelPipeline_;
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
 * @return {!goog.async.Deferred} A deferred {@code !analytics.Config}
 *     that fires when the object is ready to handle method calls.
 *     Deferred is necessary to allow for object initialization from
 *     asynchronous storage.
 */
analytics.GoogleAnalytics.prototype.getConfig;

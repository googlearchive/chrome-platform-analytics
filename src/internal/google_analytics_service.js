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

goog.require('analytics.Parameter');
goog.require('analytics.internal.AsyncSettingsChannel');
goog.require('analytics.internal.Channel');
goog.require('analytics.internal.DummyChannel');
goog.require('analytics.internal.EventPublishingChannel');
goog.require('analytics.internal.ParameterFilterChannel');
goog.require('analytics.internal.RateLimitingChannel');
goog.require('analytics.internal.ServiceChannel');
goog.require('analytics.internal.ServiceTracker');
goog.require('analytics.internal.Settings');
goog.require('analytics.internal.TokenBucket');
goog.require('analytics.internal.UserSamplingChannel');
goog.require('analytics.internal.XhrChannel');

goog.require('goog.dom');
goog.require('goog.events.EventTarget');
goog.require('goog.events.OnlineHandler');



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
 */
analytics.internal.GoogleAnalyticsService = function(
    libVersion,
    appName,
    appVersion,
    settings) {

  /** @private {string} */
  this.libVersion_ = libVersion;

  /** @private {string} */
  this.appName_ = appName;

  /** @private {string} */
  this.appVersion_ = appVersion;

  /** @private {!analytics.internal.Settings} */
  this.settings_ = settings;
};


/**
 * The URL of the GA server. This library only communicates over SSL.
 * @private {string}
 */
analytics.internal.GoogleAnalyticsService.GA_SERVER_ =
    'https://www.google-analytics.com/collect';


/**
 * The maximum number of characters that can be included in the POST payload.
 * @private {number}
 */
analytics.internal.GoogleAnalyticsService.MAX_POST_LENGTH_ = 8192;


/**
 * The channel that handles hits sent from a tracker instance. All
 * tracker instances share this single, lazily initialized, channel instance.
 * @private {!analytics.internal.Channel|undefined}
 */
analytics.internal.GoogleAnalyticsService.channelPipeline_;


/** @override */
analytics.internal.GoogleAnalyticsService.prototype.getTracker =
    function(trackingId) {

  var eventTarget = new goog.events.EventTarget();
  var tracker = new analytics.internal.ServiceTracker(
      this.createServiceChannel_(eventTarget),
      eventTarget);

  tracker.set(analytics.internal.Parameters.LIBRARY_VERSION, this.libVersion_);
  tracker.set(analytics.internal.Parameters.API_VERSION, 1);
  tracker.set(analytics.internal.Parameters.APP_NAME, this.appName_);
  tracker.set(analytics.internal.Parameters.APP_VERSION, this.appVersion_);
  tracker.set(analytics.internal.Parameters.TRACKING_ID, trackingId);

  analytics.internal.GoogleAnalyticsService.addEnvironmentalParams_(tracker);

  return tracker;
};


/**
 * Creates a service channel suitable for use with a single tracker instance.
 * Each tracker instance is paired with a specific service channel providing
 * proper servicing of hits.
 *
 * @param {!goog.events.EventTarget} eventTarget This event target is
 *     shared by the event publishing channel and the tracker as a means
 *     of exposing support for monitoring of events by client code.
 *     This slightly funky arrangement allows us to only report events when
 *     analytics is enabled (by way of including event publishing at the
 *     head of the channel pipeline.)
 *
 * @return {!analytics.internal.Channel}
 * @private
 */
analytics.internal.GoogleAnalyticsService.prototype.createServiceChannel_ =
    function(eventTarget) {

  // Each tracker requires its own EventTarget & publishing so we provide
  // a custom channel factory that places our event publishing channel
  // at the head of the channel pipeline.
  var channelFactory = function(settings) {
    return new analytics.internal.EventPublishingChannel(
      eventTarget,
      analytics.internal.GoogleAnalyticsService.ChannelPipelineFactory(
          settings));
  };

  return new analytics.internal.ServiceChannel(
      this.settings_,
      channelFactory,
      analytics.internal.DummyChannel.getInstance());
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
  var value = window.navigator.language;
  tracker.set(analytics.internal.Parameters.LANGUAGE, value);

  // Note: We're using ['foo'] notation to avoid issues with missing
  // externs and the possibility of the closure compiler renaming fields.
  value = screen['colorDepth'] + '-bit';
  tracker.set(analytics.internal.Parameters.SCREEN_COLORS, value);

  value = [screen['width'], screen['height']].join('x');
  tracker.set(analytics.internal.Parameters.SCREEN_RESOLUTION, value);

  var size = goog.dom.getViewportSize();
  value = [size.width, size.height].join('x');
  tracker.set(analytics.internal.Parameters.VIEWPORT_SIZE, value);
};


/**
 * A factory that lazily creates the runtime Channel pipeline that handles
 * requests for users with tracking enabled. The use of a factory enables
 * delayed initialization of the pipeline. Deferred initialization is
 * necessitated by asynchronous loading of settings from local storage.
 * @param {!analytics.internal.Settings} settings A ready settings object.
 * @return {!analytics.internal.Channel} The channel.
 */
analytics.internal.GoogleAnalyticsService.ChannelPipelineFactory =
    function(settings) {
  if (!analytics.internal.GoogleAnalyticsService.channelPipeline_) {

    /** @type {!goog.net.NetworkStatusMonitor} */
    var networkStatus = new goog.events.OnlineHandler();

    /** @type {!analytics.internal.Channel} */
    var xhrChannel =
        new analytics.internal.XhrChannel(
            analytics.internal.GoogleAnalyticsService.GA_SERVER_,
            analytics.internal.GoogleAnalyticsService.MAX_POST_LENGTH_,
            networkStatus);

    /** @type {!analytics.internal.Channel} */
    var paramFilterChannel = new analytics.internal.ParameterFilterChannel(
        xhrChannel);

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

    analytics.internal.GoogleAnalyticsService.channelPipeline_ =
        asyncSettingsChannel;
  }

  return analytics.internal.GoogleAnalyticsService.channelPipeline_;
};

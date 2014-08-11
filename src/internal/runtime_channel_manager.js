// Copyright 2014 Google Inc. All Rights Reserved.
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
 * @fileoverview A {@code ChannelManager} that creates the runtime
 * channels used by a tracker. This is basically two separate
 * channel factories. 1) Creates (and caches) the channel
 * shared across all trackers. 2) Creates the tracker specific
 * service channel.
 *
 * @author smckay@google.com (Steve McKay)
 */
goog.provide('analytics.internal.RuntimeChannelManager');

goog.require('analytics.internal.AsyncSettingsChannel');
goog.require('analytics.internal.ChannelManager');
goog.require('analytics.internal.DummyChannel');
goog.require('analytics.internal.EventPublishingChannel');
goog.require('analytics.internal.ParameterFilterChannel');
goog.require('analytics.internal.RateLimitingChannel');
goog.require('analytics.internal.ServiceChannel');
goog.require('analytics.internal.TokenBucket');
goog.require('analytics.internal.UserSamplingChannel');
goog.require('analytics.internal.XhrChannel');

goog.require('goog.events.OnlineHandler');



/**
 * The {@code ChannelManager} responsible for creating the
 * concrete chain of channels that process hits, and
 * providing runtime manipulation of those channels.
 *
 * @constructor @struct
 * @implements {analytics.internal.ChannelManager}
 *
 * @param {!analytics.internal.SharedChannelFactory_} sharedChannelFactory
 *     Factory for creating the shared channel.
 *     Called once the settings object becomes ready.
 *     The resulting channel is shared between all {@code ServiceChannel}
 *     instances.
 */
analytics.internal.RuntimeChannelManager = function(sharedChannelFactory) {

  /**
   * Used to lazily create the shared channel.
   * @private {!analytics.internal.SharedChannelFactory_}
   */
  this.sharedChannelFactory_ = sharedChannelFactory;

  /** @private {!analytics.internal.Channel} */
  this.sharedChannel_;
};


/** @override */
analytics.internal.RuntimeChannelManager.prototype.createServiceChannel =
    function(settings, eventTarget) {

  return new analytics.internal.ServiceChannel(
      settings,
      goog.bind(
          /**
            * Returns the head of a chain of channels used for processing
            * hits when tracking is enabled. ServiceChannel will call
            * this once settings becomes *ready*.
            *
            * <p>This funky little arrangement allows us to handle
            * hits before we know if tracking is enabled. This affords
            * as a fully synchronous public tracking interface, including
            * construction. See {@code ServiceChannel} for details.
            *
            * @return {!analytics.internal.Channel}
            * @this {analytics.internal.RuntimeChannelManager}
            */
          function() {
            return new analytics.internal.EventPublishingChannel(
                eventTarget,
                this.sharedChannelFactory_.getChannel(settings));
          },
          this),
      analytics.internal.DummyChannel.getInstance());
};


/** @private {!analytics.internal.RuntimeChannelManager} */
analytics.internal.RuntimeChannelManager.instance_;


/**
 * Returns a reference to the {@code RuntimeChannelManager} instance.
 *
 * @param {string} serverAddress The URL of the GA server.
 * @param {number} maxPostLength The maximum number of characters
 *     that can be included in the POST payload.
 * @return {!analytics.internal.RuntimeChannelManager} An instance.
 */
analytics.internal.RuntimeChannelManager.get =
    function(serverAddress, maxPostLength) {
  if (!analytics.internal.RuntimeChannelManager.instance_) {
    analytics.internal.RuntimeChannelManager.instance_ =
        new analytics.internal.RuntimeChannelManager(
            new analytics.internal.SharedChannelFactory_(
                serverAddress,
                maxPostLength));
  }
  return analytics.internal.RuntimeChannelManager.instance_;
};



/**
 * A factory that lazily creates the runtime Channel pipeline that handles
 * requests for users with tracking enabled. The channel instance is
 * shared across all tracker instances.
 *
 * @constructor
 * @struct
 *
 * @param {string} serverAddress The URL of the GA server.
 * @param {number} maxPostLength The maximum number of characters
 *     that can be included in the POST payload.
 *
 * @private
 */
analytics.internal.SharedChannelFactory_ =
    function(serverAddress, maxPostLength) {

  /** @private {string} */
  this.serverAddress_ = serverAddress;

  /** @private {number} */
  this.maxPostLength_ = maxPostLength;

  /** @private {!analytics.internal.Channel} */
  this.channel_;
};


/**
 * @param {!analytics.internal.Settings} settings A *ready* settings object.
 *
 * @return {!analytics.internal.Channel}
 */
analytics.internal.SharedChannelFactory_.prototype.getChannel =
    function(settings) {
  if (!this.channel_) {
    this.channel_ = this.createChannel_(settings);
  }
  return this.channel_;
};


/**
 * A factory that lazily creates the runtime Channel pipeline that handles
 * requests for users with tracking enabled. The use of a factory enables
 * delayed initialization of the pipeline. Deferred initialization is
 * necessitated by asynchronous loading of settings from local storage.
 *
 * @param {!analytics.internal.Settings} settings A *ready* settings object.
 *
 * @return {!analytics.internal.Channel}
 * @private
 */
analytics.internal.SharedChannelFactory_.prototype.createChannel_ =
    function(settings) {

  var networkStatus = new goog.events.OnlineHandler();

  var xhrChannel = new analytics.internal.XhrChannel(
      this.serverAddress_,
      this.maxPostLength_,
      networkStatus);

  var paramFilterChannel = new analytics.internal.ParameterFilterChannel(
      xhrChannel);

  var tokenBucket = new analytics.internal.TokenBucket(
      60,  // initialTokens
      500,  // maxTokens
      analytics.internal.TokenBucket.FillRate.ONE_EVERY_TWO_SECONDS);

  var limitingChannel = new analytics.internal.RateLimitingChannel(
      tokenBucket,
      paramFilterChannel);

  var samplingChannel = new analytics.internal.UserSamplingChannel(
      settings,
      limitingChannel);

  return new analytics.internal.AsyncSettingsChannel(
      settings,
      samplingChannel);
};

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
 * @fileoverview A factory that lazily creates the *shared* segment of the
 * {@code Channel} pipeline.
 *
 * @author smckay@google.com (Steve McKay)
 */
goog.provide('analytics.internal.SharedChannelFactory');

goog.require('analytics.internal.AsyncSettingsChannel');
goog.require('analytics.internal.HasChannel');
goog.require('analytics.internal.ParameterFilterChannel');
goog.require('analytics.internal.RateLimitingChannel');
goog.require('analytics.internal.TokenBucket');
goog.require('analytics.internal.UserSamplingChannel');
goog.require('analytics.internal.XhrChannel');

goog.require('goog.events.OnlineHandler');



/**
 * A factory that lazily creates the *shared* segment of the
 * {@code Channel} pipeline. This segement handles requests
 * for users when tracking enabled, and is shared across
 * all tracker instances.
 *
 * @constructor
 * @implements {analytics.internal.HasChannel}
 * @struct
 *
 * @param {!analytics.internal.Settings} settings A settings object that
 *     may not yet be ready. The object will be ready before
 *     the {@code getChannel} method is called.
 * @param {string} serverAddress The URL of the GA server.
 * @param {number} maxPostLength The maximum number of characters
 *     that can be included in the POST payload.
 */
analytics.internal.SharedChannelFactory =
    function(settings, serverAddress, maxPostLength) {

  /** @private {!analytics.internal.Settings} */
  this.settings_ = settings;

  /** @private {string} */
  this.serverAddress_ = serverAddress;

  /** @private {number} */
  this.maxPostLength_ = maxPostLength;

  /** @private {!analytics.internal.Channel} */
  this.channel_;
};


/** @override */
analytics.internal.SharedChannelFactory.prototype.getChannel = function() {
  if (!this.channel_) {
    this.channel_ = this.createChannel_();
  }
  return this.channel_;
};


/**
 * A factory that lazily creates the runtime Channel pipeline that handles
 * requests for users with tracking enabled. The use of a factory enables
 * delayed initialization of the pipeline. Deferred initialization is
 * necessitated by asynchronous loading of settings from local storage.
 *
 * @return {!analytics.internal.Channel}
 * @private
 */
analytics.internal.SharedChannelFactory.prototype.createChannel_ =
    function() {

  if (!this.settings_.whenReady().hasFired()) {
    throw new Error(
        'Cannot construct shared channel prior to settings being ready.');
  }

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
      this.settings_,
      limitingChannel);

  return new analytics.internal.AsyncSettingsChannel(
      this.settings_,
      samplingChannel);
};

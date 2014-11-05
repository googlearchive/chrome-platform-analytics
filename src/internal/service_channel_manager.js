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
 * @fileoverview Provides {@code ServiceChannelManager} as well
 * as its factory. See class docs for details.
 *
 * @author smckay@google.com (Steve McKay)
 */
goog.provide('analytics.internal.ServiceChannelManager');
goog.provide('analytics.internal.ServiceChannelManager.Factory');

goog.require('analytics.internal.ChannelManager');
goog.require('analytics.internal.DummyChannel');
goog.require('analytics.internal.FilterChannel');
goog.require('analytics.internal.ServiceChannel');



/**
 * The {@code ChannelManager} instance providing access to the
 * {@code Channel} used for processing hits at runtime,
 * as well as support for runtime manipulation of request-
 * processing (specifically the ability to add filters).
 *
 * @constructor
 * @implements {analytics.internal.ChannelManager}
 * @struct
 *
 * @param {!analytics.internal.Settings} settings
 * @param {!analytics.internal.HasChannel} sharedChannelProvider
 *     Factory for creating the shared channel.
 *     Called once the settings object becomes ready.
 *     The resulting channel is shared between all {@code ServiceChannel}
 *     instances.
 */
analytics.internal.ServiceChannelManager =
    function(settings, sharedChannelProvider) {

  /**
   * This is initialized only when ServiceChannel asks for the
   * channel via the injected factory. This is deferred
   * until settings are loaded.
   *
   * @private {!analytics.internal.FilterChannel}
   */
  this.filterChannel_;

  /**
   * Buffer of any filters installed before the filter channel is
   * created.
   *
   * @private {Array.<!analytics.Tracker.Filter>}
   */
  this.bufferedFilters_ = [];

  var filterChannelFactory = goog.bind(
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
        * @this {analytics.internal.ServiceChannelManager}
        */
      function() {
        this.filterChannel_ = new analytics.internal.FilterChannel(
            sharedChannelProvider.getChannel());
        // drain the buffer of filters installed before
        // the filter channel was created.
        goog.array.forEach(
            this.bufferedFilters_,
            /**
             * @param {!analytics.Tracker.Filter} filter
             * @this {analytics.internal.ServiceChannelManager}
             */
            function(filter) {
              this.filterChannel_.addFilter(filter);
            },
            this);
        this.bufferedFilters_ = null;
        return this.filterChannel_;
      },
      this);

  /** @private {!analytics.internal.Channel} */
  this.channel_ = new analytics.internal.ServiceChannel(
      settings,
      filterChannelFactory,
      analytics.internal.DummyChannel.getInstance());
};


/** @override */
analytics.internal.ServiceChannelManager.prototype.getChannel = function() {
  return this.channel_;
};


/** @override */
analytics.internal.ServiceChannelManager.prototype.addFilter =
    function(filter) {
  if (this.filterChannel_) {
    this.filterChannel_.addFilter(filter);
  } else {
    this.bufferedFilters_.push(filter);
  }
};



/**
 * The {@code ChannelManager.Factory} responsible for creating the
 * concrete {@code ChannelManager} (and consequently the concrete channels).
 *
 * @constructor
 * @implements {analytics.internal.ChannelManager.Factory}
 * @struct
 *
 * @param {!analytics.internal.Settings} settings
 * @param {!analytics.internal.HasChannel} sharedChannelProvider
 *     Provider of the the shared channel.
 *     Called only once the shared settings object becomes ready.
 *     The resulting channel is shared between all {@code ServiceChannel}
 *     instances.
 */
analytics.internal.ServiceChannelManager.Factory =
    function(settings, sharedChannelProvider) {

  /** @private {!analytics.internal.Settings} */
  this.settings_ = settings;

  /**
   * Used to lazily create the shared channel.
   * @private {!analytics.internal.HasChannel}
   */
  this.sharedChannelProvider_ = sharedChannelProvider;
};


/** @override */
analytics.internal.ServiceChannelManager.Factory.prototype.create =
    function() {
  return new analytics.internal.ServiceChannelManager(
      this.settings_, this.sharedChannelProvider_);
};


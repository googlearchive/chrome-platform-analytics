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
 * @fileoverview A Channel that delegates hits to a selected delegate channel
 * based on user perferences and environmental information. This allows the GA
 * service to dynamically change the behavior by swapping the delegate channel
 * in response to changes in the environment such as device network
 * status change or user tracking opt-out.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.ServiceChannel');

goog.require('analytics.internal.Channel');
goog.require('analytics.internal.DivertingChannel');
goog.require('analytics.internal.Settings');

goog.require('goog.dom');
goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @implements {analytics.internal.Channel}
 * @struct
 *
 * @param {!analytics.internal.Settings} settings
 * @param {function(): !analytics.internal.Channel}
 *     enabledChannelFactory
 * @param {!analytics.internal.Channel} disabledChannel
 */
analytics.internal.ServiceChannel = function(
    settings,
    enabledChannelFactory,
    disabledChannel) {

  /** @private {!analytics.internal.Settings} */
  this.settings_ = settings;

  /**
   * Queue of hits received pre-settings (and channel) initialization.
   * This is drained and nulled out once the *real* runtime enabled
   * channel is constructed.
   * @private {?Array.<!analytics.internal.DivertingChannel.Capture>}
   */
  this.diverted_ = [];

  /**
   * All known delegate channels. When a user opts-in/out or is sampled in/out
   * we'll select the appropriate channel from this map.
   *
   * <p>DO NOT CALL THESE CHANNELS DIRECTLY. Call this.channel_.
   * @private {!analytics.internal.ServiceChannel.Channels_}
   */
  this.channels_ = {
    /*
     * Settings are loaded asynchronously, so we don't have the *real* enabled
     * channel initially. For that reason we divert hits sent prior to
     * initialization to a buffer. Once the *real* enabled channel is ready
     * we'll swap this out for the real channel and flush
     * the queue of diverted hits.
     */
    enabled: new analytics.internal.DivertingChannel(this.diverted_),
    disabled: disabledChannel
  };

  /**
   * The active delegate channel. This channel is updated when the user
   * opts in/out. We default to the enabled channel knowing that prior
   * to settings being ready it diverts hits to a queue.
   * @private {analytics.internal.Channel}
   */
  this.channel_ = this.channels_.enabled;

  this.settings_.whenReady().addCallbacks(
      goog.partial(this.onSettingsReady_, enabledChannelFactory),
      this.onSettingsLoadFailed_,
      this);
};


/**
 * @typedef {{
 *   enabled: !analytics.internal.Channel,
 *   disabled: !analytics.internal.Channel
 * }}
 * @private
 */
analytics.internal.ServiceChannel.Channels_;


/**
 * When settings becomes ready we complete channel initialization and
 * install property change listeners.
 * @param {function(): !analytics.internal.Channel} enabledChannelFactory
 * @private
 */
analytics.internal.ServiceChannel.prototype.onSettingsReady_ =
    function(enabledChannelFactory) {
  if (goog.isNull(this.diverted_)) {
    throw new Error('Channel setup already completed.');
  }

  // Get the "enabled" channel from the factory
  this.channels_.enabled = enabledChannelFactory();
  this.pickChannel_();

  // Drain all hits that were sent prior to now (those that were sent
  // before the settings were available).
  goog.array.forEach(
      this.diverted_,
      /** @param {!analytics.internal.DivertingChannel.Capture} capture */
      function(capture) {
        this.send(capture.hitType, capture.parameters);
      }, this);
  this.diverted_ = null;

  this.settings_.addChangeListener(goog.bind(this.onSettingsChanged_, this));
};


/**
 * If settings fail to load, switch to the disabled channel and replace the
 * temp-enabled channel we were using with the disabled channel.
 *
 * @private
 */
analytics.internal.ServiceChannel.prototype.onSettingsLoadFailed_ = function() {
  if (goog.isNull(this.diverted_)) {
    throw new Error('Channel setup already completed.');
  }

  this.channels_.enabled = this.channels_.disabled;
  this.channel_ = this.channels_.disabled;
  this.diverted_ = null;
};


/** @override */
analytics.internal.ServiceChannel.prototype.send =
    function(hitType, parameters) {
  return this.channel_.send(hitType, parameters);
};


/**
 * Updates the selected channel to reflect current settings.
 * @private
 */
analytics.internal.ServiceChannel.prototype.pickChannel_ = function() {
  this.channel_ = this.settings_.isTrackingPermitted() ?
      this.channels_.enabled :
      this.channels_.disabled;
};


/**
 * @param {!analytics.internal.Settings.Property} property
 * @private
 */
analytics.internal.ServiceChannel.prototype.onSettingsChanged_ =
    function(property) {
  switch (property) {
    case analytics.internal.Settings.Properties.TRACKING_PERMITTED:
      this.pickChannel_();
      break;
  }
};

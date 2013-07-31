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
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.ServiceTracker');
goog.require('analytics.internal.Settings');

goog.require('goog.dom');



/**
 * @constructor
 * @param {string} libVersion The string that identifies this version of this
 *     library.
 * @param {string} appName The Chromium Platform App name.
 * @param {string} appVersion The version of the platform app.
 * @param {!analytics.internal.Settings} settings
 * @param {function(!analytics.internal.Settings): !analytics.internal.Channel}
 *     enabledChannelFactory
 * @param {!analytics.internal.Channel} disabledChannel
 * @implements {analytics.GoogleAnalytics}
 * @implements {analytics.internal.Channel}
 */
analytics.internal.ServiceChannel = function(
    libVersion,
    appName,
    appVersion,
    settings,
    enabledChannelFactory,
    disabledChannel) {

  /** @private {string} */
  this.libVersion_ = libVersion;

  /** @private {string} */
  this.appName_ = appName;

  /** @private {string} */
  this.appVersion_ = appVersion;

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
     * initialization to an array. Once the *real* enabled channel is ready
     * we'll swap this out for the real channel and queue of diverted of hits.
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
goog.addSingletonGetter(analytics.internal.ServiceChannel);


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
 * @param {function(!analytics.internal.Settings): !analytics.internal.Channel}
 *     enabledChannelFactory
 * @param {!analytics.internal.Settings} settings
 * @private
 */
analytics.internal.ServiceChannel.prototype.onSettingsReady_ =
    function(enabledChannelFactory, settings) {
  goog.asserts.assert(!goog.isNull(this.diverted_),
      'Channel setup already completed.');
  goog.asserts.assert(settings == this.settings_);

  this.channels_.enabled = enabledChannelFactory(this.settings_);
  this.pickChannel_();

  goog.array.forEach(this.diverted_,
      /** @param {!analytics.internal.DivertingChannel.Capture} capture */
      function(capture) {
        this.send(capture.hitType, capture.parameters);
      }, this);
  this.diverted_ = null;

  this.settings_.addChangeListener(goog.bind(this.onSettingsChanged_, this));
};


/**
 * If settings fail to load, switch to a dummy channel.
 * @private
 */
analytics.internal.ServiceChannel.prototype.onSettingsLoadFailed_ = function() {
  goog.asserts.assert(!goog.isNull(this.diverted_),
      'Channel setup already completed.');
  this.channels_.enabled = analytics.internal.DummyChannel.getInstance();
  this.channel_ = this.channels_.disabled;
  this.diverted_ = null;
};


/** @override */
analytics.internal.ServiceChannel.prototype.send =
    function(hitType, parameters) {
  // TODO(smckay): Add fields to the hit that should *automatically*
  // added. E.g. system information, user id, ....
  return this.channel_.send(hitType, parameters);
};


/** @override */
analytics.internal.ServiceChannel.prototype.getTracker = function(trackingId) {
  var tracker = new analytics.internal.ServiceTracker(this);
  tracker.set(analytics.internal.Parameters.LIBRARY_VERSION, this.libVersion_);
  tracker.set(analytics.internal.Parameters.API_VERSION, 1);
  tracker.set(analytics.internal.Parameters.APP_NAME, this.appName_);
  tracker.set(analytics.internal.Parameters.APP_VERSION, this.appVersion_);
  tracker.set(analytics.internal.Parameters.TRACKING_ID, trackingId);
  this.addEnvironmentalParams_(tracker);
  return tracker;
};


/** @override */
analytics.internal.ServiceChannel.prototype.getConfig = function() {
  return this.settings_.whenReady();
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


/**
 * Adds environmental details like screen size, color depth.
 * @param {!analytics.Tracker} tracker
 * @private
 */
analytics.internal.ServiceChannel.prototype.addEnvironmentalParams_ =
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

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

goog.require('analytics.Tracker.HitEvent');
goog.require('analytics.internal.Channel');
goog.require('analytics.internal.DivertingChannel');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.Settings');

goog.require('goog.dom');
goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @param {!analytics.internal.Settings} settings
 * @param {function(!analytics.internal.Settings): !analytics.internal.Channel}
 *     enabledChannelFactory
 * @param {!analytics.internal.Channel} disabledChannel
 * @implements {analytics.internal.Channel}
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

  this.eventTarget_ = new goog.events.EventTarget();

  /**
   * Whether or not tracking is enabled.  The value of this comes from the
   * settings (when they get loaded).  The channel is enabled by default because
   * this causes hits to be buffered up (see above) until the settings are
   * loaded.
   * @private {boolean}
   */
  this.enabled_ = true;

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
  this.setEnabledState_();

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
  this.enabled_ = false;
  this.channels_.enabled = analytics.internal.DummyChannel.getInstance();
  this.diverted_ = null;
};


/** @override */
analytics.internal.ServiceChannel.prototype.send =
    function(hitType, parameters) {
  if (this.enabled_) {
    this.eventTarget_.dispatchEvent(
        new analytics.Tracker.HitEvent(hitType, parameters));
    return this.channels_.enabled.send(hitType, parameters);
  } else {
    return this.channels_.disabled.send(hitType, parameters);
  }
};


/**
 * Updates the selected channel to reflect current settings.
 * @private
 */
analytics.internal.ServiceChannel.prototype.setEnabledState_ = function() {
  this.enabled_ = this.settings_.isTrackingPermitted();
};


/**
 * @param {!analytics.internal.Settings.Property} property
 * @private
 */
analytics.internal.ServiceChannel.prototype.onSettingsChanged_ =
    function(property) {
  switch (property) {
    case analytics.internal.Settings.Properties.TRACKING_PERMITTED:
      this.setEnabledState_();
      break;
  }
};


/**
 * @return {!goog.events.EventTarget}
 */
analytics.internal.ServiceChannel.prototype.getEventTarget =
    function() {
  return this.eventTarget_;
};

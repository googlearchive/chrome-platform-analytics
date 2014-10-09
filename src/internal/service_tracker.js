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
 * @fileoverview Service tracker implementation.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.ServiceTracker');

goog.require('analytics.EventBuilder');
goog.require('analytics.HitType');
goog.require('analytics.HitTypes');
goog.require('analytics.Parameter');
goog.require('analytics.ParameterMap');
goog.require('analytics.Tracker');
goog.require('analytics.Value');
goog.require('analytics.internal.Channel');
goog.require('analytics.internal.parameters');
goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.object');
goog.require('goog.string.format');



/**
 * @constructor
 * @implements {analytics.Tracker}
 * @struct
 *
 * @param {!analytics.internal.Settings} settings
 * @param {!analytics.internal.ChannelManager} channelManager
 */
analytics.internal.ServiceTracker = function(settings, channelManager) {

  /** @private {!analytics.internal.ChannelManager} */
  this.channelManager_ = channelManager;

  /** @private {!analytics.internal.Channel} */
  this.channel_ = channelManager.getChannel();

  /** @private {!analytics.ParameterMap} */
  this.params_ = new analytics.ParameterMap();

  /** @private {boolean} */
  this.startSession_ = false;
};


/** @override */
analytics.internal.ServiceTracker.prototype.set = function(param, value) {
  if (!goog.isDefAndNotNull(value)) {
    throw new Error(
      'Value must be defined and not null. Parameter=' + param.id);
  }
  var parameter = analytics.internal.parameters.asParameter(param);
  this.params_.set(parameter, value);
};


/** @override */
analytics.internal.ServiceTracker.prototype.addFilter = function(filter) {
  this.channelManager_.addFilter(filter);
};


/** @override */
analytics.internal.ServiceTracker.prototype.send =
    function(hitType, opt_extraParams) {

  // If the first arg is an EventBuilder, delegate sending
  // to it. It'll eventually end up calling back
  // into this method with specific hittype and params.
  if (hitType instanceof analytics.EventBuilder) {
    return hitType.send(this);
  }

  var hit = this.params_.clone();
  if (opt_extraParams instanceof analytics.ParameterMap) {
    hit.addAll(opt_extraParams);
  } else if (goog.isObject(opt_extraParams)) {
    goog.object.forEach(
        opt_extraParams,
        function(value, key) {
          if (goog.isDefAndNotNull(value)) {
            hit.set(analytics.internal.parameters.asParameter(key), value);
          }
        }, this);
  }

  if (this.startSession_) {
    this.startSession_ = false;
    hit.set(analytics.Parameters.SESSION_CONTROL, 'start');
  }

  return this.channel_.send(hitType, hit);
};


/** @override */
analytics.internal.ServiceTracker.prototype.sendAppView =
    function(description) {

  /** @type {!analytics.AppViewHit} */
  var hit = {
    'description': description
  };
  this.set(analytics.Parameters.DESCRIPTION, description);
  return this.send(analytics.HitTypes.APPVIEW, hit);
};


/** @override */
analytics.internal.ServiceTracker.prototype.sendEvent =
    function(category, action, opt_label, opt_value) {
  if (goog.isNumber(opt_value))
    goog.asserts.assert(opt_value >= 0);

  /** @type {!analytics.EventHit} */
  var hit = {
    'eventCategory': category,
    'eventAction': action,
    'eventLabel': opt_label,
    'eventValue': opt_value
  };
  return this.send(analytics.HitTypes.EVENT, hit);
};


/** @override */
analytics.internal.ServiceTracker.prototype.sendSocial =
    function(network, action, target) {

  /** @type {!analytics.SocialHit} */
  var hit = {
    'socialNetwork': network,
    'socialAction': action,
    'socialTarget': target
  };
  return this.send(analytics.HitTypes.SOCIAL, hit);
};


/** @override */
analytics.internal.ServiceTracker.prototype.sendException =
    function(opt_description, opt_fatal) {

  /** @type {!analytics.ExceptionHit} */
  var hit = {
    'exDescription': opt_description,
    'exFatal': opt_fatal
  };
  return this.send(analytics.HitTypes.EXCEPTION, hit);
};


/** @override */
analytics.internal.ServiceTracker.prototype.sendTiming =
    function(category, variable, value, opt_label, opt_sampleRate) {
  return this.send(
      analytics.HitTypes.TIMING, {
        'timingCategory': category,
        'timingVar': variable,
        'timingLabel': opt_label,
        'timingValue': value,
        'sampleRateOverride': opt_sampleRate
      });

};


/** @override */
analytics.internal.ServiceTracker.prototype.forceSessionStart =
    function() {
  this.startSession_ = true;
};


/** @override */
analytics.internal.ServiceTracker.prototype.startTiming =
    function(category, variable, opt_label, opt_sampleRate) {
  return new analytics.internal.ServiceTracker.Timing(
      this, category, variable, opt_label, opt_sampleRate);
};



/**
 * Tracks timing information and send information to Google Analytics.
 *
 * @constructor
 * @implements {analytics.Tracker.Timing}
 *
 * @param {!analytics.Tracker} tracker
 * @param {string} category
 * @param {string} variable
 * @param {string=} opt_label
 * @param {number=} opt_sampleRate
 */
analytics.internal.ServiceTracker.Timing =
    function(tracker, category, variable, opt_label, opt_sampleRate) {

  /** @private {?analytics.Tracker} */
  this.tracker_ = tracker;

  /** @private {string} */
  this.category_ = category;

  /** @private {string} */
  this.variable_ = variable;

  /** @private {string|undefined} */
  this.label_ = opt_label;

  /** @private {number|undefined} */
  this.sampleRate_ = opt_sampleRate;

  /** @private {number} */
  this.startTime_ = goog.now();
};


/** @override */
analytics.internal.ServiceTracker.Timing.prototype.send = function() {
  var deferred = this.tracker_.sendTiming(
      this.category_,
      this.variable_,
      goog.now() - this.startTime_,
      this.label_,
      this.sampleRate_);

  // The timing instance can only be used once.
  this.tracker_ = null;
  return deferred;
};

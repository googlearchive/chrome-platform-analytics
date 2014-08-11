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
 * @fileoverview A Channel that samples out hits based on the sample rate
 * established in settings.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.UserSamplingChannel');

goog.require('analytics.HitType');
goog.require('analytics.HitTypes');
goog.require('analytics.Results');
goog.require('analytics.Value');
goog.require('analytics.internal.Channel');
goog.require('analytics.internal.Parameters');
goog.require('analytics.internal.Settings');

goog.require('goog.async.Deferred');



/**
 * @constructor
 * @param {!analytics.internal.Settings} settings
 * @param {!analytics.internal.Channel} delegate
 * @implements {analytics.internal.Channel}
 * @struct
 */
analytics.internal.UserSamplingChannel = function(settings, delegate) {

  /** @private {!analytics.internal.Settings} */
  this.settings_ = settings;

  /** @private {!analytics.internal.Channel} */
  this.delegate_ = delegate;
};


/** @private {number} */
analytics.internal.UserSamplingChannel.SAMPLE_RATE_SCALE_ = 655.36;


/** @override */
analytics.internal.UserSamplingChannel.prototype.send =
    function(hitType, parameters) {
  var clientId = parameters.get(analytics.internal.Parameters.CLIENT_ID);

  // Since all digits in the id are random, we just pull the four hex digits
  // from the second component in the id giving us a range of 0 - 65535. The
  // sample rate we test against is scaled up to be proportionate with this
  // range.
  var idPart = parseInt(clientId.split('-')[1], 16);
  var base16SampleRate = (this.getSampleRate_(hitType, parameters) *
      analytics.internal.UserSamplingChannel.SAMPLE_RATE_SCALE_);
  return idPart < base16SampleRate ?
      this.delegate_.send(hitType, parameters) :
      goog.async.Deferred.succeed(analytics.Results.SAMPLED_OUT);
};


/**
 * Return the sample rate for the channel. The default value is part of the
 * tracker's state, but may be overridden in the parameters map. If an override
 * is found in the parameters map, it is removed so that it won't be passed to
 * GA erroneously.
 *
 * Note that the override functionality is currently only supported for TIMING
 * hits. For other hit types, the default value from the tracker's settings is
 * returned.
 *
 * @param {!analytics.HitType} hitType The hit type.
 * @param {!analytics.ParameterMap} parameters The parameters to send.
 * @return {analytics.Value}
 * @private
 */
analytics.internal.UserSamplingChannel.prototype.getSampleRate_ =
    function(hitType, parameters) {
  if (hitType != analytics.HitTypes.TIMING) {
    return this.settings_.getSampleRate();
  }
  var sampleRateOverride =
      parameters.get(analytics.internal.Parameters.SAMPLE_RATE_OVERRIDE);
  if (sampleRateOverride) {
    parameters.remove(analytics.internal.Parameters.SAMPLE_RATE_OVERRIDE);
  }
  return sampleRateOverride || this.settings_.getSampleRate();
};

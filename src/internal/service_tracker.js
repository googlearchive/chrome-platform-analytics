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

goog.require('analytics.HitType');
goog.require('analytics.HitTypes');
goog.require('analytics.Parameter');
goog.require('analytics.Tracker');
goog.require('analytics.Value');
goog.require('analytics.internal.Channel');
goog.require('analytics.internal.ParameterMap');
goog.require('analytics.internal.Parameters');

goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.object');
goog.require('goog.string.format');



/**
 * @constructor
 * @implements {analytics.Tracker}
 * @param {!analytics.internal.Channel} channel
 */
analytics.internal.ServiceTracker = function(channel) {

  /** @private {!analytics.internal.Channel} */
  this.channel_ = channel;

  /** @private {!analytics.internal.ParameterMap} */
  this.params_ = new analytics.internal.ParameterMap();
};


/** @override */
analytics.internal.ServiceTracker.prototype.set = function(param, value) {
  var parameter = analytics.internal.Parameters.asParameter(param);
  this.params_.set(parameter, value);
};


/** @override */
analytics.internal.ServiceTracker.prototype.send =
    function(hitType, opt_extraParams) {
  var hit = this.params_.clone();

  if (opt_extraParams) {
    goog.object.forEach(opt_extraParams,
        function(value, key) {
          if (goog.isDefAndNotNull(value)) {
            hit.set(analytics.internal.Parameters.asParameter(key), value);
          }
        }, this);
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

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
 * @fileoverview Channel that sends hits to GA servers using XHR.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.XhrChannel');

goog.require('analytics.Parameter');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.Results');
goog.require('analytics.Status');
goog.require('analytics.internal.Channel');
goog.require('goog.Uri');
goog.require('goog.async.Deferred');
goog.require('goog.net.NetworkStatusMonitor');
goog.require('goog.net.XhrIo');
goog.require('goog.string.format');



/**
 * @constructor
 * @param {string} serverUrl
 * @param {number} maxPostLength The maximum lengh of the POST payload
 *     in characters.
 * @param {!goog.net.NetworkStatusMonitor} networkStatus
 * @implements {analytics.internal.Channel}
 * @struct
 */
analytics.internal.XhrChannel =
    function(serverUrl, maxPostLength, networkStatus) {

  /** @private {string} */
  this.serverUrl_ = serverUrl;

  /** @private {number} */
  this.maxPostLength_ = maxPostLength;

  /** @private {goog.net.NetworkStatusMonitor} */
  this.networkStatus_ = networkStatus;
};


/** @override */
analytics.internal.XhrChannel.prototype.send = function(hitType, parameters) {
  // Don't try to upload anything if the network is unavailable.
  if (!this.networkStatus_.isOnline()) {
    return goog.async.Deferred.fail(analytics.Results.DEVICE_OFFLINE);
  }

  var deferred = new goog.async.Deferred();

  var queryString = this.toQueryString_(hitType, parameters);
  if (queryString.length > this.maxPostLength_) {
    deferred.errback({
      status: analytics.Status.PAYLOAD_TOO_BIG,
      details: goog.string.format(
          'Encoded hit length == %s, but should be <= %s.',
          queryString.length, this.maxPostLength_)
    });
  } else {
    var callback = function() {
      deferred.callback(analytics.Results.SENT);
    };
    goog.net.XhrIo.send(this.serverUrl_, callback, 'POST', queryString);
  }
  return deferred;
};


/**
 * @param {!analytics.HitType} hitType
 * @param {!analytics.ParameterMap} parameters
 * @return {string} The parameters formatted as a URL query string.
 * @private
 */
analytics.internal.XhrChannel.prototype.toQueryString_ =
    function(hitType, parameters) {
  /** @type {goog.Uri.QueryData} */
  var queryData = new goog.Uri.QueryData();
  queryData.add(analytics.Parameters.HIT_TYPE.name, hitType);
  parameters.forEachEntry(
      /**
       * @param {!analytics.Parameter} key
       * @param {!analytics.Value} value
       */
      function(key, value) {
        queryData.add(key.name, value.toString());
      });
  return queryData.toString();
};

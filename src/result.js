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
 * @fileoverview Error objects describing failed operations.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.Result');
goog.provide('analytics.Results');
goog.provide('analytics.Status');


/**
 * All known status codes.
 * @enum {string}
 */
analytics.Status = {
  // The request was not sent due to the device being offline.
  DEVICE_OFFLINE: 'device-offline',
  // The encoded payload of a hit is TOOOOOOOO long (more than about 8k chars)
  PAYLOAD_TOO_BIG: 'payload-too-big',
  // The request was not sent due to rate limiting.
  RATE_LIMITED: 'rate-limited',
  // The request was not sent because the user is not in the sample set.
  SAMPLED_OUT: 'sampled-out',
  // The request was successfully processed by the library and sent to
  // Google Analytics for further processing.
  SENT: 'sent'
};


/**
 * @typedef {{
 *   status: analytics.Status,
 *   details: *
 * }}
 */
analytics.Result;


/**
 * Well known results objects. Results with dynamic content cannot be
 * declared here for obvious reasons.
 * @enum {!analytics.Result}
 */
analytics.Results = {
  DEVICE_OFFLINE: {
    status: analytics.Status.DEVICE_OFFLINE,
    details: undefined
  },
  PAYLOAD_TOO_BIG: {
    status: analytics.Status.PAYLOAD_TOO_BIG,
    details: undefined
  },
  RATE_LIMITED: {
    status: analytics.Status.RATE_LIMITED,
    details: undefined
  },
  SAMPLED_OUT: {
    status: analytics.Status.SAMPLED_OUT,
    details: undefined
  },
  SENT: {
    status: analytics.Status.SENT,
    details: undefined
  }
};

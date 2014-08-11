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
 * @fileoverview Interface for building and manipulating
 * the chain of {@code Channel} instances used
 * for runtime request processing.
 *
 * @author smckay@google.com (Steve McKay)
 */
goog.provide('analytics.internal.ChannelManager');



/**
 * A ChannelManager manages a pipeline of {@code Channels}.
 *
 * @interface
 */
analytics.internal.ChannelManager = function() {};


/**
 * Returns a service channel suitable for use with a single tracker instance.
 * Each tracker instance is paired with a specific service channel providing
 * runtime processing of hits.
 *
 * @param {!analytics.internal.Settings} settings A settings instance which
 *     need not yet be in a *ready* state.
 * @param {!goog.events.EventTarget} eventTarget This event target is
 *     shared by the event publishing channel and the tracker as a means
 *     of exposing support for monitoring of events by client code.
 *     This slightly funky arrangement allows us to only report events when
 *     analytics is enabled (by way of including event publishing at the
 *     head of the channel pipeline.)
 *
 * @return {!analytics.internal.Channel}
 */
analytics.internal.ChannelManager.prototype.createServiceChannel;

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
goog.provide('analytics.internal.ChannelManager.Factory');

goog.require('analytics.internal.HasChannel');



/**
 * A ChannelManager provides support for runtime manipulation
 * of the {@code Channel} that processes requests.
 *
 * @interface
 * @extends {analytics.internal.HasChannel}
 */
analytics.internal.ChannelManager = function() {};


/**
 * Installs the supplied filter.
 *
 * @param {!analytics.Tracker.Filter} filter
 */
analytics.internal.ChannelManager.prototype.addFilter;



/**
 * A ChannelManager.Factory provides for the creation
 * of {@code ChannelManager} instances.
 *
 * @interface
 */
analytics.internal.ChannelManager.Factory = function() {};


/**
 * Returns a service channel manager suitable for use with
 * a single tracker instance. Each tracker instance is paired
 * with a specific service channel providing
 * runtime processing of hits.
 *
 * @return {!analytics.internal.ChannelManager}
 */
analytics.internal.ChannelManager.Factory.prototype.create;

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
goog.provide('analytics.internal.HasChannel');



/**
 * An object that contains a {@code Channel}.
 *
 * @interface
 */
analytics.internal.HasChannel = function() {};


/**
 * @return {!analytics.internal.Channel} channel
 */
analytics.internal.HasChannel.prototype.getChannel;

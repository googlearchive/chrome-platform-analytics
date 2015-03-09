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

goog.require('analytics.EventBuilder');
goog.require('analytics.HitTypes');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');
goog.require('analytics.filters.EventLabelerBuilder');
goog.require('analytics.filters.FilterBuilder');
goog.require('analytics.getService');
goog.require('analytics.internal.FilterChannel');
goog.require('analytics.internal.GoogleAnalyticsService');
goog.require('analytics.internal.ServiceSettings');
goog.require('analytics.internal.ServiceTracker');
goog.require('goog.async.Deferred');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

goog.exportSymbol(
    'goog.async.Deferred',
    goog.async.Deferred);
goog.exportSymbol(
    'goog.async.Deferred.prototype.addCallback',
    goog.async.Deferred.prototype.addCallback);
goog.exportSymbol(
    'goog.async.Deferred.prototype.callback',
    goog.async.Deferred.prototype.callback);
goog.exportSymbol(
    'goog.async.Deferred.prototype.then',
    goog.async.Deferred.prototype.then);

goog.exportSymbol(
    'goog.events.EventTarget',
    goog.events.EventTarget);
goog.exportSymbol(
    'goog.events.EventTarget.prototype.listen',
    goog.events.EventTarget.prototype.listen);

goog.exportSymbol(
    'analytics.getService',
    analytics.getService);

// GoogleAnalyticsService...
goog.exportSymbol(
    'analytics.internal.GoogleAnalyticsService',
    analytics.internal.GoogleAnalyticsService);
goog.exportSymbol(
    'analytics.internal.GoogleAnalyticsService.prototype.getTracker',
    analytics.internal.GoogleAnalyticsService.prototype.getTracker);
goog.exportSymbol(
    'analytics.internal.GoogleAnalyticsService.prototype.getConfig',
    analytics.internal.GoogleAnalyticsService.prototype.getConfig);

// Only export the methods that come from analytics.Config -- other methods on
// analytics.internal.ServiceSettings are internal to the analytics library.

// ServiceSettings...
goog.exportSymbol(
    'analytics.internal.ServiceSettings',
    analytics.internal.ServiceSettings);
goog.exportSymbol(
    'analytics.internal.ServiceSettings.prototype.setTrackingPermitted',
    analytics.internal.ServiceSettings.prototype.setTrackingPermitted);
goog.exportSymbol(
    'analytics.internal.ServiceSettings.prototype.isTrackingPermitted',
    analytics.internal.ServiceSettings.prototype.isTrackingPermitted);
goog.exportSymbol(
    'analytics.internal.ServiceSettings.prototype.setSampleRate',
    analytics.internal.ServiceSettings.prototype.setSampleRate);
goog.exportSymbol(
    'analytics.internal.ServiceSettings.prototype.resetUserId',
    analytics.internal.ServiceSettings.prototype.resetUserId);

// ServiceTracker...
goog.exportSymbol(
    'analytics.internal.ServiceTracker',
    analytics.internal.ServiceTracker);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.send',
    analytics.internal.ServiceTracker.prototype.send);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.sendAppView',
    analytics.internal.ServiceTracker.prototype.sendAppView);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.sendEvent',
    analytics.internal.ServiceTracker.prototype.sendEvent);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.sendSocial',
    analytics.internal.ServiceTracker.prototype.sendSocial);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.sendException',
    analytics.internal.ServiceTracker.prototype.sendException);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.sendTiming',
    analytics.internal.ServiceTracker.prototype.sendTiming);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.startTiming',
    analytics.internal.ServiceTracker.prototype.startTiming);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.Timing',
    analytics.internal.ServiceTracker.Timing);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.Timing.prototype.send',
    analytics.internal.ServiceTracker.Timing.prototype.send);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.forceSessionStart',
    analytics.internal.ServiceTracker.prototype.forceSessionStart);
goog.exportSymbol(
    'analytics.internal.ServiceTracker.prototype.addFilter',
    analytics.internal.ServiceTracker.prototype.addFilter);

goog.exportSymbol(
    'analytics.internal.FilterChannel.Hit',
    analytics.internal.FilterChannel.Hit);
goog.exportSymbol(
    'analytics.internal.FilterChannel.Hit.prototype.getHitType',
    analytics.internal.FilterChannel.Hit.prototype.getHitType);
goog.exportSymbol(
    'analytics.internal.FilterChannel.Hit.prototype.getParameters',
    analytics.internal.FilterChannel.Hit.prototype.getParameters);
goog.exportSymbol(
    'analytics.internal.FilterChannel.Hit.prototype.cancel',
    analytics.internal.FilterChannel.Hit.prototype.cancel);


goog.exportSymbol(
    'analytics.ParameterMap',
    analytics.ParameterMap);
goog.exportSymbol(
    'analytics.ParameterMap.Entry',
    analytics.ParameterMap.Entry);
goog.exportSymbol(
    'analytics.ParameterMap.prototype.set',
    analytics.ParameterMap.prototype.set);
goog.exportSymbol(
    'analytics.ParameterMap.prototype.get',
    analytics.ParameterMap.prototype.get);
goog.exportSymbol(
    'analytics.ParameterMap.prototype.remove',
    analytics.ParameterMap.prototype.remove);
// intentionally omitting forEachEntry as it
// is only used by internal code...and we like it like that.
goog.exportSymbol(
    'analytics.ParameterMap.prototype.toObject',
    analytics.ParameterMap.prototype.toObject);


// HitTypes...
goog.exportSymbol(
    'analytics.HitTypes.APPVIEW',
    analytics.HitTypes.APPVIEW);
goog.exportSymbol(
    'analytics.HitTypes.EVENT',
    analytics.HitTypes.EVENT);
goog.exportSymbol(
    'analytics.HitTypes.SOCIAL',
    analytics.HitTypes.SOCIAL);
goog.exportSymbol(
    'analytics.HitTypes.TRANSACTION',
    analytics.HitTypes.TRANSACTION);
goog.exportSymbol(
    'analytics.HitTypes.ITEM',
    analytics.HitTypes.ITEM);
goog.exportSymbol(
    'analytics.HitTypes.TIMING',
    analytics.HitTypes.TIMING);
goog.exportSymbol(
    'analytics.HitTypes.EXCEPTION',
    analytics.HitTypes.EXCEPTION);


// Params...
goog.object.forEach(
    analytics.Parameters,
    function(value) {
      var name = value.id.replace(/[A-Z]/, '_$&').toUpperCase();
      goog.exportSymbol(
          'analytics.Parameters.' + name,
          value);
    });

// EXTRAS...

// Filters
goog.exportSymbol(
    'analytics.filters.EventLabelerBuilder',
    analytics.filters.EventLabelerBuilder);
goog.exportSymbol(
    'analytics.filters.EventLabelerBuilder.prototype.appendToExistingLabel',
    analytics.filters.EventLabelerBuilder.prototype.appendToExistingLabel);
goog.exportSymbol(
    'analytics.filters.EventLabelerBuilder.prototype.stripValue',
    analytics.filters.EventLabelerBuilder.prototype.stripValue);
goog.exportSymbol(
    'analytics.filters.EventLabelerBuilder.prototype.powersOfTwo',
    analytics.filters.EventLabelerBuilder.prototype.powersOfTwo);
goog.exportSymbol(
    'analytics.filters.EventLabelerBuilder.prototype.rangeBounds',
    analytics.filters.EventLabelerBuilder.prototype.rangeBounds);
goog.exportSymbol(
    'analytics.filters.EventLabelerBuilder.prototype.build',
    analytics.filters.EventLabelerBuilder.prototype.build);

goog.exportSymbol(
    'analytics.filters.FilterBuilder',
    analytics.filters.FilterBuilder);
goog.exportSymbol(
    'analytics.filters.FilterBuilder.builder',
    analytics.filters.FilterBuilder.builder);
goog.exportSymbol(
    'analytics.filters.FilterBuilder.prototype.when',
    analytics.filters.FilterBuilder.prototype.when);
goog.exportSymbol(
    'analytics.filters.FilterBuilder.prototype.whenHitType',
    analytics.filters.FilterBuilder.prototype.whenHitType);
goog.exportSymbol(
    'analytics.filters.FilterBuilder.prototype.whenValue',
    analytics.filters.FilterBuilder.prototype.whenValue);
goog.exportSymbol(
    'analytics.filters.FilterBuilder.prototype.applyFilter',
    analytics.filters.FilterBuilder.prototype.applyFilter);
goog.exportSymbol(
    'analytics.filters.FilterBuilder.prototype.build',
    analytics.filters.FilterBuilder.prototype.build);


// HitBuilders
goog.exportSymbol(
    'analytics.EventBuilder',
    analytics.EventBuilder);
goog.exportSymbol(
    'analytics.EventBuilder.builder',
    analytics.EventBuilder.builder);
goog.exportSymbol(
    'analytics.EventBuilder.prototype.category',
    analytics.EventBuilder.prototype.category);
goog.exportSymbol(
    'analytics.EventBuilder.prototype.action',
    analytics.EventBuilder.prototype.action);
goog.exportSymbol(
    'analytics.EventBuilder.prototype.label',
    analytics.EventBuilder.prototype.label);
goog.exportSymbol(
    'analytics.EventBuilder.prototype.value',
    analytics.EventBuilder.prototype.value);
goog.exportSymbol(
    'analytics.EventBuilder.prototype.dimension',
    analytics.EventBuilder.prototype.dimension);
goog.exportSymbol(
    'analytics.EventBuilder.prototype.metric',
    analytics.EventBuilder.prototype.metric);
goog.exportSymbol(
    'analytics.EventBuilder.prototype.send',
    analytics.EventBuilder.prototype.send);

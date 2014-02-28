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

goog.require('analytics.GoogleAnalytics');
goog.require('analytics.internal.GoogleAnalyticsService');
goog.require('analytics.internal.ServiceChannel');
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
    'analytics.internal.ServiceTracker.prototype.getEventTarget',
    analytics.internal.ServiceTracker.prototype.getEventTarget);

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

// HitEvent...
goog.exportSymbol(
    'analytics.Tracker.HitEvent',
    analytics.Tracker.HitEvent);
goog.exportSymbol(
    'analytics.Tracker.HitEvent.EVENT_TYPE',
    analytics.Tracker.HitEvent.EVENT_TYPE);
goog.exportSymbol(
    'analytics.Tracker.HitEvent.prototype.getHitType',
    analytics.Tracker.HitEvent.prototype.getHitType);
goog.exportSymbol(
    'analytics.Tracker.HitEvent.prototype.getHit',
    analytics.Tracker.HitEvent.prototype.getHit);

// Params...
goog.object.forEach(
    analytics.Parameters,
    function(value) {
      var name = value.id.replace(/[A-Z]/, '_$&').toUpperCase();
      goog.exportSymbol(
          'analytics.Parameters.' + name,
          value);
    });

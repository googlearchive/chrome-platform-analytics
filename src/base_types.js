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
 * @fileoverview Basic types used by GA Closure API.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics');
goog.provide('analytics.EventHit');
goog.provide('analytics.ExceptionHit');
goog.provide('analytics.HitType');
goog.provide('analytics.HitTypes');
goog.provide('analytics.ItemHit');
goog.provide('analytics.Parameter');
goog.provide('analytics.Parameters');
goog.provide('analytics.SocialHit');
goog.provide('analytics.TimingHit');
goog.provide('analytics.TransactionHit');
goog.provide('analytics.Value');
goog.provide('analytics.ValueType');
goog.provide('analytics.ValueTypes');

goog.require('goog.structs.Map');


/**
 * A type alias for all HitType values.
 * @typedef {string}
 */
analytics.HitType;


/**
 * The type of hit.
 * @enum {analytics.HitType}
 */
analytics.HitTypes = {
  APPVIEW: 'appview',
  EVENT: 'event',
  SOCIAL: 'social',
  TRANSACTION: 'transaction',
  ITEM: 'item',
  TIMING: 'timing',
  EXCEPTION: 'exception'
};


/**
 * A type alias for all ValueType values.
 * @typedef {string}
 */
analytics.ValueType;


/**
 * The type of value.
 * @enum {analytics.ValueType}
 */
analytics.ValueTypes = {
  TEXT: 'text',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  CURRENCY: 'currency',
  FLOAT: 'float'
};


/**
 * A value associated with a parameter.
 * @typedef {string|number|boolean}
 */
analytics.Value;


/**
 * Typedef for analytics.HitTypes.APPVIEW hit types.
 * @typedef {{
 *   description: string
 * }}
 */
analytics.AppViewHit;


/**
 * Typedef for analytics.HitTypes.EVENT hit types.
 * @typedef {{
 *   eventCategory: string,
 *   eventAction: string,
 *   eventLabel: (string|undefined),
 *   eventValue: (number|undefined)
 * }}
 */
analytics.EventHit;


/**
 * Typedef for analytics.HitTypes.SOCIAL hit types.
 * @typedef {{
 *   socialNetwork: string,
 *   socialAction: string,
 *   socialTarget: string
 * }}
 */
analytics.SocialHit;


/**
 * Typedef for analytics.HitTypes.TRANSACTION hit types.
 * @typedef {{
 *   transactionId: string,
 *   transactionAffiliation: (string|undefined),
 *   transactionRevenue: (number|undefined),
 *   transactionShipping: (number|undefined),
 *   transactionTax: (number|undefined),
 *   currencyCode: (string|undefined)
 * }}
 */
analytics.TransactionHit;


/**
 * Typedef for analytics.HitTypes.ITEM hit types.
 * @typedef {{
 *   transactionId: string,
 *   itemName: string,
 *   itemPrice: (number|undefined),
 *   itemQuantity: (number|undefined),
 *   itemCode: (string|undefined),
 *   itemCategory: (string|undefined),
 *   currencyCode: (string|undefined)
 * }}
 */
analytics.ItemHit;


/**
 * Typedef for analytics.HitTypes.EXCEPTION hit types.
 * @typedef {{
 *   exDescription: (string|undefined),
 *   exFatal: (boolean|undefined)
 * }}
 */
analytics.ExceptionHit;


/**
 * Typedef for analytics.HitTypes.TIMING hit types.
 * @typedef {{
 *   timingCategory: (string),
 *   timingVar: (string),
 *   timingValue: (number),
 *   timingLabel: (string|undefined)
 * }}
 */
analytics.TimingHit;


/**
 * A Parameter instance.
 * @typedef {{
 *   id: string,
 *   name: string,
 *   valueType: analytics.ValueType,
 *   maxLength: (number|undefined),
 *   defaultValue: (string|undefined)
 * }}
 */
analytics.Parameter;


/**
 * All supported public hit parameters excepting DIMENSION[0-199]
 * and METRIC[0-199] which must be created with a user supplied index.
 *
 * @see analytics.createDimensionParam
 * @see analytics.createMetricParam
 *
 * @enum {analytics.Parameter}
 */
analytics.Parameters = {
  /* Hit type */
  HIT_TYPE: {
    id: 'hitType',
    name: 't',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Anonymize IP */
  ANONYMIZE_IP: {
    id: 'anonymizeIp',
    name: 'aip',
    valueType: analytics.ValueTypes.BOOLEAN,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Queue Time */
  QUEUE_TIME: {
    id: 'queueTime',
    name: 'qt',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Cache Buster */
  CACHE_BUSTER: {
    id: 'cacheBuster',
    name: 'z',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Session Control */
  SESSION_CONTROL: {
    id: 'sessionControl',
    name: 'sc',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Session Group */
  SESSION_GROUP: {
    id: 'sessionGroup',
    name: 'sg',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* User ID */
  USER_ID: {
    id: 'userId',
    name: 'uid',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Non-Interaction Hit */
  NON_INTERACTION: {
    id: 'nonInteraction',
    name: 'ni',
    valueType: analytics.ValueTypes.BOOLEAN,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Content Description */
  DESCRIPTION: {
    id: 'description',
    name: 'cd',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 2048,
    defaultValue: undefined
  },
  /* Document Title */
  TITLE: {
    id: 'title',
    name: 'dt',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 1500,
    defaultValue: undefined
  },
  /* Application ID */
  APP_ID: {
    id: 'appId',
    name: 'aid',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 150,
    defaultValue: undefined
  },
  /* Application Installer ID */
  APP_INSTALLER_ID: {
    id: 'appInstallerId',
    name: 'aiid',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 150,
    defaultValue: undefined
  },
  /* Event Category */
  EVENT_CATEGORY: {
    id: 'eventCategory',
    name: 'ec',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 150,
    defaultValue: undefined
  },
  /* Event Action */
  EVENT_ACTION: {
    id: 'eventAction',
    name: 'ea',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Event Label */
  EVENT_LABEL: {
    id: 'eventLabel',
    name: 'el',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Event Value */
  EVENT_VALUE: {
    id: 'eventValue',
    name: 'ev',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Social Network */
  SOCIAL_NETWORK: {
    id: 'socialNetwork',
    name: 'sn',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 50,
    defaultValue: undefined
  },
  /* Social Action */
  SOCIAL_ACTION: {
    id: 'socialAction',
    name: 'sa',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 50,
    defaultValue: undefined
  },
  /* Social Action Target */
  SOCIAL_TARGET: {
    id: 'socialTarget',
    name: 'st',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 2048,
    defaultValue: undefined
  },
  /* Transaction ID */
  TRANSACTION_ID: {
    id: 'transactionId',
    name: 'ti',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Transaction Affiliation */
  TRANSACTION_AFFILIATION: {
    id: 'transactionAffiliation',
    name: 'ta',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Transaction Revenue */
  TRANSACTION_REVENUE: {
    id: 'transactionRevenue',
    name: 'tr',
    valueType: analytics.ValueTypes.CURRENCY,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Transaction Shipping */
  TRANSACTION_SHIPPING: {
    id: 'transactionShipping',
    name: 'ts',
    valueType: analytics.ValueTypes.CURRENCY,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Transaction Tax */
  TRANSACTION_TAX: {
    id: 'transactionTax',
    name: 'tt',
    valueType: analytics.ValueTypes.CURRENCY,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Currency Code */
  CURRENCY_CODE: {
    id: 'currencyCode',
    name: 'cu',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 10,
    defaultValue: undefined
  },
  /* Item Price */
  ITEM_PRICE: {
    id: 'itemPrice',
    name: 'ip',
    valueType: analytics.ValueTypes.CURRENCY,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Item Quantity */
  ITEM_QUANTITY: {
    id: 'itemQuantity',
    name: 'iq',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Item Code */
  ITEM_CODE: {
    id: 'itemCode',
    name: 'ic',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Item Name */
  ITEM_NAME: {
    id: 'itemName',
    name: 'in',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Item Category */
  ITEM_CATEGORY: {
    id: 'itemCategory',
    name: 'iv',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Campaign Source */
  CAMPAIGN_SOURCE: {
    id: 'campaignSource',
    name: 'cs',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 100,
    defaultValue: undefined
  },
  /* Campaign Medium */
  CAMPAIGN_MEDIUM: {
    id: 'campaignMedium',
    name: 'cm',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 50,
    defaultValue: undefined
  },
  /* Campaign Name */
  CAMPAIGN_NAME: {
    id: 'campaignName',
    name: 'cn',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 100,
    defaultValue: undefined
  },
  /* Campaign Keyword */
  CAMPAIGN_KEYWORD: {
    id: 'campaignKeyword',
    name: 'ck',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Campaign Content */
  CAMPAIGN_CONTENT: {
    id: 'campaignContent',
    name: 'cc',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Campaign ID */
  CAMPAIGN_ID: {
    id: 'campaignId',
    name: 'ci',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 100,
    defaultValue: undefined
  },
  /* Google AdWords ID */
  GCLID: {
    id: 'gclid',
    name: 'gclid',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Google Display Ads ID */
  DCLID: {
    id: 'dclid',
    name: 'dclid',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Page Load Time */
  PAGE_LOAD_TIME: {
    id: 'pageLoadTime',
    name: 'plt',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* DNS Time */
  DNS_TIME: {
    id: 'dnsTime',
    name: 'dns',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* TCP Connect Time */
  TCP_CONNECT_TIME: {
    id: 'tcpConnectTime',
    name: 'tcp',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Server Response Time */
  SERVER_RESPONSE_TIME: {
    id: 'serverResponseTime',
    name: 'srt',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Page Download Time */
  PAGE_DOWNLOAD_TIME: {
    id: 'pageDownloadTime',
    name: 'pdt',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Redirect Response Time */
  REDIRECT_RESPONSE_TIME: {
    id: 'redirectResponseTime',
    name: 'rrt',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* User timing category */
  TIMING_CATEGORY: {
    id: 'timingCategory',
    name: 'utc',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 150,
    defaultValue: undefined
  },
  /* User timing variable name */
  TIMING_VAR: {
    id: 'timingVar',
    name: 'utv',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* User timing time */
  TIMING_VALUE: {
    id: 'timingValue',
    name: 'utt',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* User timing label */
  TIMING_LABEL: {
    id: 'timingLabel',
    name: 'utl',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 500,
    defaultValue: undefined
  },
  /* Exception Description */
  EX_DESCRIPTION: {
    id: 'exDescription',
    name: 'exd',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 150,
    defaultValue: undefined
  },
  /* Is Exception Fatal? */
  EX_FATAL: {
    id: 'exFatal',
    name: 'exf',
    valueType: analytics.ValueTypes.BOOLEAN,
    maxLength: undefined,
    defaultValue: '1'
  }
};


/**
 * Returns a new DIMENSION param.
 *
 * @param {number} index Each dimension has an index configured in
 *    the Google Analytics admin console. This is that value.
 *    It must be between 1 and 200.
 * @return {!analytics.Parameter}
 */
analytics.createDimensionParam = function(index) {
  if (index < 1 || index > 200) {
    throw new Error(
        'Expected dimension index range 1-200, but was : ' + index);
  }
  return {
    id: 'dimension' + index,
    name: 'cd' + index,
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 150,
    defaultValue: undefined
  };
};


/**
 * Returns a new METRIC param.
 *
 * @param {number} index Each metric has an index configured in
 *    the Google Analytics admin console. This is that value.
 *    It must be between 1 and 200.
 * @return {!analytics.Parameter}
 */
analytics.createMetricParam = function(index) {
  if (index < 1 || index > 200) {
    throw new Error(
        'Expected metric index range 1-200, but was : ' + index);
  }
  return {
    id: 'metric' + index,
    name: 'cm' + index,
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  };
};

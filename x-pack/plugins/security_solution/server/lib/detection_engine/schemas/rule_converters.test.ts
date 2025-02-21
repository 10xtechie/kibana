/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { convertPatchAPIToInternalSchema, patchTypeSpecificSnakeToCamel } from './rule_converters';
import {
  getEqlRuleParams,
  getMlRuleParams,
  getQueryRuleParams,
  getSavedQueryRuleParams,
  getThreatRuleParams,
  getThresholdRuleParams,
} from './rule_schemas.mock';
import { getRuleMock } from '../routes/__mocks__/request_responses';

describe('rule_converters', () => {
  describe('patchTypeSpecificSnakeToCamel', () => {
    test('should accept EQL params when existing rule type is EQL', () => {
      const patchParams = {
        timestamp_field: 'event.created',
        event_category_override: 'event.not_category',
        tiebreaker_field: 'event.created',
      };
      const rule = getEqlRuleParams();
      const patchedParams = patchTypeSpecificSnakeToCamel(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          timestampField: 'event.created',
          eventCategoryOverride: 'event.not_category',
          tiebreakerField: 'event.created',
        })
      );
    });

    test('should reject invalid EQL params when existing rule type is EQL', () => {
      const patchParams = {
        timestamp_field: 1,
        event_category_override: 1,
        tiebreaker_field: 1,
      };
      const rule = getEqlRuleParams();
      expect(() => patchTypeSpecificSnakeToCamel(patchParams, rule)).toThrowError(
        'Invalid value "1" supplied to "timestamp_field",Invalid value "1" supplied to "event_category_override",Invalid value "1" supplied to "tiebreaker_field"'
      );
    });

    test('should accept threat match params when existing rule type is threat match', () => {
      const patchParams = {
        threat_indicator_path: 'my.indicator',
        threat_query: 'test-query',
      };
      const rule = getThreatRuleParams();
      const patchedParams = patchTypeSpecificSnakeToCamel(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          threatIndicatorPath: 'my.indicator',
          threatQuery: 'test-query',
        })
      );
    });

    test('should reject invalid threat match params when existing rule type is threat match', () => {
      const patchParams = {
        threat_indicator_path: 1,
        threat_query: 1,
      };
      const rule = getThreatRuleParams();
      expect(() => patchTypeSpecificSnakeToCamel(patchParams, rule)).toThrowError(
        'Invalid value "1" supplied to "threat_query",Invalid value "1" supplied to "threat_indicator_path"'
      );
    });

    test('should accept query params when existing rule type is query', () => {
      const patchParams = {
        index: ['new-test-index'],
        language: 'lucene',
      };
      const rule = getQueryRuleParams();
      const patchedParams = patchTypeSpecificSnakeToCamel(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          index: ['new-test-index'],
          language: 'lucene',
        })
      );
    });

    test('should reject invalid query params when existing rule type is query', () => {
      const patchParams = {
        index: [1],
        language: 'non-language',
      };
      const rule = getQueryRuleParams();
      expect(() => patchTypeSpecificSnakeToCamel(patchParams, rule)).toThrowError(
        'Invalid value "1" supplied to "index",Invalid value "non-language" supplied to "language"'
      );
    });

    test('should accept saved query params when existing rule type is saved query', () => {
      const patchParams = {
        index: ['new-test-index'],
        language: 'lucene',
      };
      const rule = getSavedQueryRuleParams();
      const patchedParams = patchTypeSpecificSnakeToCamel(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          index: ['new-test-index'],
          language: 'lucene',
        })
      );
    });

    test('should reject invalid saved query params when existing rule type is saved query', () => {
      const patchParams = {
        index: [1],
        language: 'non-language',
      };
      const rule = getSavedQueryRuleParams();
      expect(() => patchTypeSpecificSnakeToCamel(patchParams, rule)).toThrowError(
        'Invalid value "1" supplied to "index",Invalid value "non-language" supplied to "language"'
      );
    });

    test('should accept threshold params when existing rule type is threshold', () => {
      const patchParams = {
        threshold: {
          field: ['host.name'],
          value: 107,
        },
      };
      const rule = getThresholdRuleParams();
      const patchedParams = patchTypeSpecificSnakeToCamel(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          threshold: {
            field: ['host.name'],
            value: 107,
          },
        })
      );
    });

    test('should reject invalid threshold params when existing rule type is threshold', () => {
      const patchParams = {
        threshold: {
          field: ['host.name'],
          value: 'invalid',
        },
      };
      const rule = getThresholdRuleParams();
      expect(() => patchTypeSpecificSnakeToCamel(patchParams, rule)).toThrowError(
        'Invalid value "invalid" supplied to "threshold,value"'
      );
    });

    test('should accept machine learning params when existing rule type is machine learning', () => {
      const patchParams = {
        anomaly_threshold: 5,
      };
      const rule = getMlRuleParams();
      const patchedParams = patchTypeSpecificSnakeToCamel(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          anomalyThreshold: 5,
        })
      );
    });

    test('should reject invalid machine learning params when existing rule type is machine learning', () => {
      const patchParams = {
        anomaly_threshold: 'invalid',
      };
      const rule = getMlRuleParams();
      expect(() => patchTypeSpecificSnakeToCamel(patchParams, rule)).toThrowError(
        'Invalid value "invalid" supplied to "anomaly_threshold"'
      );
    });
  });

  describe('convertPatchAPIToInternalSchema', () => {
    test('should not update version for immutable rules', () => {
      const patchParams = {
        index: ['new-test-index'],
        language: 'lucene',
      };
      const rule = getRuleMock({ ...getQueryRuleParams(), immutable: true });
      const patchedParams = convertPatchAPIToInternalSchema(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          params: expect.objectContaining({ version: 1 }),
        })
      );
    });

    test('should update version for mutable rules', () => {
      const patchParams = {
        index: ['new-test-index'],
        language: 'lucene',
      };
      const rule = getRuleMock({ ...getQueryRuleParams() });
      const patchedParams = convertPatchAPIToInternalSchema(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          params: expect.objectContaining({ version: 2 }),
        })
      );
    });

    test('should not update version due to enabled, id, or rule_id, ', () => {
      const patchParams = {
        enabled: false,
        id: 'some-id',
        rule_id: 'some-rule-id',
      };
      const rule = getRuleMock(getQueryRuleParams());
      const patchedParams = convertPatchAPIToInternalSchema(patchParams, rule);
      expect(patchedParams).toEqual(
        expect.objectContaining({
          params: expect.objectContaining({ version: 1 }),
        })
      );
    });
  });
});

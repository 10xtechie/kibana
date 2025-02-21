/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { elasticsearchServiceMock, loggingSystemMock } from '@kbn/core/server/mocks';
import { getTotalCountAggregations, getTotalCountInUse } from './get_telemetry_from_kibana';

const elasticsearch = elasticsearchServiceMock.createStart();
const esClient = elasticsearch.client.asInternalUser;
const logger: ReturnType<typeof loggingSystemMock.createLogger> = loggingSystemMock.createLogger();

describe('kibana index telemetry', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getTotalCountAggregations', () => {
    test('should return rule counts by rule type id, stats about schedule and throttle intervals and number of actions', async () => {
      esClient.search.mockResponseOnce({
        took: 4,
        timed_out: false,
        _shards: {
          total: 1,
          successful: 1,
          skipped: 0,
          failed: 0,
        },
        hits: {
          total: {
            value: 4,
            relation: 'eq',
          },
          max_score: null,
          hits: [],
        },
        aggregations: {
          by_rule_type_id: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: '.index-threshold',
                doc_count: 2,
              },
              {
                key: 'logs.alert.document.count',
                doc_count: 1,
              },
              {
                key: 'document.test.',
                doc_count: 1,
              },
            ],
          },
          max_throttle_time: { value: 60 },
          min_throttle_time: { value: 0 },
          avg_throttle_time: { value: 30 },
          max_interval_time: { value: 10 },
          min_interval_time: { value: 1 },
          avg_interval_time: { value: 4.5 },
          max_actions_count: { value: 4 },
          min_actions_count: { value: 0 },
          avg_actions_count: { value: 2.5 },
        },
      });

      const telemetry = await getTotalCountAggregations({
        esClient,
        kibanaIndex: 'test',
        logger,
      });

      expect(esClient.search).toHaveBeenCalledTimes(1);

      expect(telemetry).toEqual({
        connectors_per_alert: {
          avg: 2.5,
          max: 4,
          min: 0,
        },
        count_by_type: {
          '__index-threshold': 2,
          document__test__: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          logs__alert__document__count: 1,
        },
        count_total: 4,
        schedule_time: {
          avg: '4.5s',
          max: '10s',
          min: '1s',
        },
        schedule_time_number_s: {
          avg: 4.5,
          max: 10,
          min: 1,
        },
        throttle_time: {
          avg: '30s',
          max: '60s',
          min: '0s',
        },
        throttle_time_number_s: {
          avg: 30,
          max: 60,
          min: 0,
        },
      });
    });

    test('should return empty results and log warning if query throws error', async () => {
      esClient.search.mockRejectedValueOnce(new Error('oh no'));

      const telemetry = await getTotalCountAggregations({
        esClient,
        kibanaIndex: 'test',
        logger,
      });

      expect(esClient.search).toHaveBeenCalledTimes(1);
      const loggerCall = logger.warn.mock.calls[0][0];
      const loggerMeta = logger.warn.mock.calls[0][1];
      expect(loggerCall as string).toMatchInlineSnapshot(
        `"Error executing alerting telemetry task: getTotalCountAggregations - {}"`
      );
      expect(loggerMeta?.tags).toEqual(['alerting', 'telemetry-failed']);
      expect(loggerMeta?.error?.stack_trace).toBeDefined();
      expect(telemetry).toEqual({
        connectors_per_alert: {
          avg: 0,
          max: 0,
          min: 0,
        },
        count_by_type: {},
        count_total: 0,
        schedule_time: {
          avg: '0s',
          max: '0s',
          min: '0s',
        },
        schedule_time_number_s: {
          avg: 0,
          max: 0,
          min: 0,
        },
        throttle_time: {
          avg: '0s',
          max: '0s',
          min: '0s',
        },
        throttle_time_number_s: {
          avg: 0,
          max: 0,
          min: 0,
        },
      });
    });
  });

  describe('getTotalCountInUse', () => {
    test('should return enabled rule counts by rule type id and number of namespaces', async () => {
      esClient.search.mockResponseOnce({
        took: 4,
        timed_out: false,
        _shards: {
          total: 1,
          successful: 1,
          skipped: 0,
          failed: 0,
        },
        hits: {
          total: {
            value: 4,
            relation: 'eq',
          },
          max_score: null,
          hits: [],
        },
        aggregations: {
          namespaces_count: { value: 1 },
          by_rule_type_id: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: '.index-threshold',
                doc_count: 2,
              },
              {
                key: 'logs.alert.document.count',
                doc_count: 1,
              },
              {
                key: 'document.test.',
                doc_count: 1,
              },
            ],
          },
        },
      });

      const telemetry = await getTotalCountInUse({
        esClient,
        kibanaIndex: 'test',
        logger,
      });

      expect(esClient.search).toHaveBeenCalledTimes(1);

      expect(telemetry).toStrictEqual({
        countByType: {
          '__index-threshold': 2,
          document__test__: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          logs__alert__document__count: 1,
        },
        countNamespaces: 1,
        countTotal: 4,
      });
    });

    test('should return empty results and log warning if query throws error', async () => {
      esClient.search.mockRejectedValueOnce(new Error('oh no'));

      const telemetry = await getTotalCountInUse({
        esClient,
        kibanaIndex: 'test',
        logger,
      });

      expect(esClient.search).toHaveBeenCalledTimes(1);
      const loggerCall = logger.warn.mock.calls[0][0];
      const loggerMeta = logger.warn.mock.calls[0][1];
      expect(loggerCall as string).toMatchInlineSnapshot(
        `"Error executing alerting telemetry task: getTotalCountInUse - {}"`
      );
      expect(loggerMeta?.tags).toEqual(['alerting', 'telemetry-failed']);
      expect(loggerMeta?.error?.stack_trace).toBeDefined();
      expect(telemetry).toStrictEqual({
        countByType: {},
        countNamespaces: 0,
        countTotal: 0,
      });
    });
  });
});

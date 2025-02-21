/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AlertSearchResponse } from '../../../../../detections/containers/detection_engine/alerts/types';
import type { AlertsTreeMapAggregation } from '../../types';

export const mockAlertSearchResponse: AlertSearchResponse<unknown, AlertsTreeMapAggregation> = {
  took: 1,
  timeout: false,
  _shards: {
    total: 1,
    successful: 1,
    skipped: 0,
    failed: 0,
  },
  hits: {
    total: {
      value: 75,
      relation: 'eq',
    },
    max_score: null,
    hits: [],
  },
  aggregations: {
    stackByField0: {
      buckets: [
        {
          key: 'Endpoint Security',
          doc_count: 50,
          maxRiskSubAggregation: {
            value: 47,
          },
          stackByField1: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: 'Host-p3afpacfut',
                doc_count: 30,
              },
              {
                key: 'Host-wgrua1nhzb',
                doc_count: 20,
              },
            ],
          },
        },
        {
          key: 'matches everything',
          doc_count: 23,
          maxRiskSubAggregation: {
            value: 21,
          },
          stackByField1: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: 'Host-p3afpacfut',
                doc_count: 15,
              },
              {
                key: 'Host-wgrua1nhzb',
                doc_count: 7,
              },
              {
                key: 'Host-bnrf4ss7ez',
                doc_count: 1,
              },
            ],
          },
        },
        {
          key: 'Threshold rule',
          doc_count: 1,
          maxRiskSubAggregation: {
            value: 99,
          },
          stackByField1: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: 'Host-p3afpacfut',
                doc_count: 1,
              },
            ],
          },
        },
        {
          key: 'mimikatz process started',
          doc_count: 1,
          maxRiskSubAggregation: {
            value: 99,
          },
          stackByField1: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: 'Host-wgrua1nhzb',
                doc_count: 1,
              },
            ],
          },
        },
      ],
    },
  },
};

export const mockNoDataAlertSearchResponse = {
  took: 1,
  timeout: false,
  _shards: {
    total: 1,
    successful: 1,
    skipped: 0,
    failed: 0,
  },
  hits: {
    total: {
      value: 80,
      relation: 'eq',
    },
    max_score: null,
    hits: [],
  },
  aggregations: {
    stackByField0: {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [], // <-- empty buckets
    },
  },
};

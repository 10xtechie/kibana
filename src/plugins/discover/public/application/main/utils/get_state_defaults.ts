/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { cloneDeep, isEqual } from 'lodash';
import { IUiSettingsClient } from '@kbn/core/public';
import { DataPublicPluginStart } from '@kbn/data-plugin/public';
import { Storage } from '@kbn/kibana-utils-plugin/public';
import {
  DEFAULT_COLUMNS_SETTING,
  DOC_HIDE_TIME_COLUMN_SETTING,
  SEARCH_FIELDS_FROM_SOURCE,
  SORT_DEFAULT_ORDER_SETTING,
} from '../../../../common';
import { SavedSearch } from '../../../services/saved_searches';

import { AppState } from '../services/discover_state';
import { getDefaultSort, getSortArray } from '../../../components/doc_table';
import { CHART_HIDDEN_KEY } from '../components/chart/discover_chart';

function getDefaultColumns(savedSearch: SavedSearch, config: IUiSettingsClient) {
  if (savedSearch.columns && savedSearch.columns.length > 0) {
    return [...savedSearch.columns];
  }
  if (config.get(SEARCH_FIELDS_FROM_SOURCE) && isEqual(config.get(DEFAULT_COLUMNS_SETTING), [])) {
    return ['_source'];
  }
  return [...config.get(DEFAULT_COLUMNS_SETTING)];
}

export function getStateDefaults({
  config,
  data,
  savedSearch,
  storage,
}: {
  config: IUiSettingsClient;
  data: DataPublicPluginStart;
  savedSearch: SavedSearch;
  storage: Storage;
}) {
  const { searchSource } = savedSearch;
  const indexPattern = searchSource.getField('index');

  const query = searchSource.getField('query') || data.query.queryString.getDefaultQuery();
  const sort = getSortArray(savedSearch.sort ?? [], indexPattern!);
  const columns = getDefaultColumns(savedSearch, config);
  const chartHidden = storage.get(CHART_HIDDEN_KEY);

  const defaultState: AppState = {
    query,
    sort: !sort.length
      ? getDefaultSort(
          indexPattern,
          config.get(SORT_DEFAULT_ORDER_SETTING, 'desc'),
          config.get(DOC_HIDE_TIME_COLUMN_SETTING, false)
        )
      : sort,
    columns,
    index: indexPattern?.id,
    interval: 'auto',
    filters: cloneDeep(searchSource.getOwnField('filter')) as AppState['filters'],
    hideChart: typeof chartHidden === 'boolean' ? chartHidden : undefined,
    viewMode: undefined,
    hideAggregatedPreview: undefined,
    savedQuery: undefined,
    rowHeight: undefined,
    rowsPerPage: undefined,
  };
  if (savedSearch.grid) {
    defaultState.grid = savedSearch.grid;
  }
  if (savedSearch.hideChart !== undefined) {
    defaultState.hideChart = savedSearch.hideChart;
  }
  if (savedSearch.rowHeight !== undefined) {
    defaultState.rowHeight = savedSearch.rowHeight;
  }
  if (savedSearch.viewMode) {
    defaultState.viewMode = savedSearch.viewMode;
  }
  if (savedSearch.hideAggregatedPreview) {
    defaultState.hideAggregatedPreview = savedSearch.hideAggregatedPreview;
  }
  if (savedSearch.rowsPerPage) {
    defaultState.rowsPerPage = savedSearch.rowsPerPage;
  }

  return defaultState;
}

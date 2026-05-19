/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import dayjs from "dayjs";

import { getRelativeTime } from "src/utils/datetimeUtils";

export const DAG_RUN_META_DATE_FORMAT = "MMM D, h:mm A";

const DAG_RUN_META_DATE_WITH_SECONDS_FORMAT = "MMM D, h:mm:ss A";

export const getDagRunListDateFormat = (datetime: string, showSeconds = false) => {
  if (dayjs(datetime).isSame(dayjs(), "day")) {
    return showSeconds ? "h:mm:ss A" : "h:mm A";
  }

  return showSeconds ? DAG_RUN_META_DATE_WITH_SECONDS_FORMAT : DAG_RUN_META_DATE_FORMAT;
};

const DAG_RUN_TYPES = new Set([
  "asset_materialization",
  "asset_triggered",
  "backfill",
  "manual",
  "operator_triggered",
  "scheduled",
]);

export const getTimestamp = (datetime?: string) => {
  const date = dayjs(datetime);

  return date.isValid() ? date.valueOf() : 0;
};

export const getDagRunOrderTimestamp = (dagRunId: string, fallbackRunAfter?: string) => {
  const [runType, runAfterWithSuffix] = dagRunId.split("__");

  if (runType === undefined || runAfterWithSuffix === undefined || !DAG_RUN_TYPES.has(runType)) {
    return getTimestamp(fallbackRunAfter);
  }

  const runAfter = dayjs(runAfterWithSuffix).isValid()
    ? runAfterWithSuffix
    : runAfterWithSuffix.replace(/_[^_]+$/u, "");

  return getTimestamp(dayjs(runAfter).isValid() ? runAfter : fallbackRunAfter);
};

export const getParsedDagRunMeta = (dagRunId: string, fallbackRunAfter?: string) => {
  const [runType, runAfterWithSuffix] = dagRunId.split("__");

  if (runType === undefined || runAfterWithSuffix === undefined || !DAG_RUN_TYPES.has(runType)) {
    return undefined;
  }

  const runAfter = dayjs(runAfterWithSuffix).isValid()
    ? runAfterWithSuffix
    : runAfterWithSuffix.replace(/_[^_]+$/u, "");

  return dayjs(runAfter).isValid()
    ? {
        runAfter,
        runType,
      }
    : {
        runAfter: fallbackRunAfter,
        runType,
      };
};

export const getDagRunListCollisionKey = (dagRunId: string, fallbackRunAfter?: string) => {
  const dagRunMeta = getParsedDagRunMeta(dagRunId, fallbackRunAfter);

  if (dagRunMeta?.runAfter === undefined) {
    return dagRunId;
  }

  return `${dagRunMeta.runType}:${dayjs(dagRunMeta.runAfter).format("YYYY-MM-DDTHH:mm")}`;
};

export const formatNotificationTime = (datetime?: string) => {
  if (datetime === undefined) {
    return undefined;
  }

  const date = dayjs(datetime);

  if (!date.isValid()) {
    return undefined;
  }

  return date.isSame(dayjs(), "day") ? date.format("h:mm A") : date.format("MMM DD");
};

export const formatNotificationDetailTime = (datetime?: string, showSeconds = false) => {
  if (datetime === undefined) {
    return undefined;
  }

  const date = dayjs(datetime);

  if (!date.isValid()) {
    return undefined;
  }

  const timeFormat = showSeconds ? "h:mm:ss A" : "h:mm A";
  const dateTimeFormat = showSeconds ? `ddd, MMM D, h:mm:ss A` : "ddd, MMM D, h:mm A";
  const timestamp = date.isSame(dayjs(), "day") ? date.format(timeFormat) : date.format(dateTimeFormat);
  const relative = getRelativeTime(datetime);

  return relative === "" ? timestamp : `${timestamp} (${relative})`;
};

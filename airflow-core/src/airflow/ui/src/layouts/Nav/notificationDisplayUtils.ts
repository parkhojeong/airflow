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
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(tz);

import { getRelativeTime } from "src/utils/datetimeUtils";

export const DAG_RUN_META_DATE_FORMAT = "MMM D, HH:mm";

const DAG_RUN_META_DATE_WITH_SECONDS_FORMAT = "MMM D, HH:mm:ss";

export const getDagRunListDateFormat = (datetime: string, showSeconds = false, timezone = "UTC") => {
  if (dayjs(datetime).tz(timezone).isSame(dayjs().tz(timezone), "day")) {
    return showSeconds ? "HH:mm:ss" : "HH:mm";
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

export const formatNotificationDetailTime = (datetime?: string, showSeconds = false) => {
  if (datetime === undefined) {
    return undefined;
  }

  const date = dayjs(datetime);

  if (!date.isValid()) {
    return undefined;
  }

  const timeFormat = showSeconds ? "HH:mm:ss" : "HH:mm";
  const dateTimeFormat = showSeconds ? "ddd, MMM D, HH:mm:ss" : "ddd, MMM D, HH:mm";
  const timestamp = date.isSame(dayjs(), "day") ? date.format(timeFormat) : date.format(dateTimeFormat);
  const relative = getRelativeTime(datetime);

  return relative === "" ? timestamp : `${timestamp} (${relative})`;
};

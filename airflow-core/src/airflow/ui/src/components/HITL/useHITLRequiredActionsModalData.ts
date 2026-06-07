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
import type { HITLDetailCollection } from "openapi/requests/types.gen";
import { ALL_ACTIONS_VALUE } from "src/components/RequiredActions/RequiredActionsFilter";
import type { RequiredActionsFilterMode } from "src/components/RequiredActions/types";

import { useHITLCompletedQuery } from "./useHITLCompletedQuery";

const getAllHitlData = ({
  completedHitlData,
  pendingHitlData,
}: {
  readonly completedHitlData: HITLDetailCollection;
  readonly pendingHitlData?: HITLDetailCollection;
}): HITLDetailCollection => ({
  hitl_details: [...(pendingHitlData?.hitl_details ?? []), ...completedHitlData.hitl_details],
  total_entries: (pendingHitlData?.total_entries ?? 0) + completedHitlData.total_entries,
});

export const useHITLRequiredActionsModalData = ({
  dagId,
  filterMode,
  open,
  pendingHitlData,
  runId,
}: {
  readonly dagId?: string;
  readonly filterMode: RequiredActionsFilterMode;
  readonly open: boolean;
  readonly pendingHitlData?: HITLDetailCollection;
  readonly runId?: string;
}) => {
  const showAllActions = filterMode === ALL_ACTIONS_VALUE;
  const {
    data: completedHitlData,
    isError,
    isLoading,
  } = useHITLCompletedQuery({
    dagId,
    enabled: showAllActions,
    open,
    runId,
  });

  return {
    hitlData:
      showAllActions && completedHitlData !== undefined
        ? getAllHitlData({ completedHitlData, pendingHitlData })
        : pendingHitlData,
    isError,
    isLoading,
  };
};

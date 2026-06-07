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
import { useQueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import type { HITLDetailCollection } from "openapi/requests/types.gen";

import { getRequiredActionsFilterMode, PENDING_ACTIONS_VALUE } from "../RequiredActionsFilter";
import type { RequiredActionsFilterMode } from "../types";
import { useHITLRequiredActionsQuery } from "./useHITLRequiredActionsQuery";
import { useRequiredActionSelection } from "./useRequiredActionSelection";
import type { SelectedHITLRequiredAction } from "./utils/requiredActionSelection";

type RequiredActionsFilterState = {
  readonly onChange: Dispatch<SetStateAction<RequiredActionsFilterMode>>;
  readonly value: RequiredActionsFilterMode;
};

type RequiredActionNavigationState = {
  readonly canNavigateRequiredActions: boolean;
  readonly hasNextRequiredAction: boolean;
  readonly hasPreviousRequiredAction: boolean;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
};

type HITLRequiredActionsListState = {
  readonly filterMode: RequiredActionsFilterMode;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
  readonly onSelect: (selection: SelectedHITLRequiredAction) => void;
  readonly selectedKey?: string;
};

type RequiredActionDetailState = {
  readonly isLoading: boolean;
  readonly onResponded: () => void;
  readonly selected?: SelectedHITLRequiredAction;
};

type HITLRequiredActionsModalState = {
  readonly detail: RequiredActionDetailState;
  readonly filter: RequiredActionsFilterState;
  readonly list: HITLRequiredActionsListState;
  readonly navigation: RequiredActionNavigationState;
};

type UseHITLRequiredActionsModalStateParams = {
  readonly dagId?: string;
  readonly open: boolean;
  readonly runId?: string;
};

export const useHITLRequiredActionsModalState = ({
  dagId,
  open,
  runId,
}: UseHITLRequiredActionsModalStateParams): HITLRequiredActionsModalState => {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<RequiredActionsFilterMode>(PENDING_ACTIONS_VALUE);
  const filterMode = getRequiredActionsFilterMode(selectedFilter);
  const {
    data: hitlData,
    isError: hitlIsError,
    isLoading: hitlIsLoading,
  } = useHITLRequiredActionsQuery({ dagId, filterMode, open, runId });

  const effectiveHitlIsLoading = open && hitlData === undefined && !hitlIsError;
  const isLoadingHitlRequiredActions = hitlIsLoading || effectiveHitlIsLoading;
  const {
    canNavigateRequiredActions,
    handleNextRequiredAction,
    handlePreviousRequiredAction,
    handleSelect,
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    selectedRequiredActionKey,
    selectNextRequiredActionAfterResponse,
    visibleSelectedHITLRequiredAction,
  } = useRequiredActionSelection({
    hitlData,
    isLoading: isLoadingHitlRequiredActions,
    open,
    queryClient,
  });

  return {
    detail: {
      isLoading: isLoadingHitlRequiredActions,
      onResponded: selectNextRequiredActionAfterResponse,
      selected: visibleSelectedHITLRequiredAction,
    },
    filter: {
      onChange: setSelectedFilter,
      value: filterMode,
    },
    list: {
      filterMode,
      hitlData,
      hitlIsError,
      hitlIsLoading: isLoadingHitlRequiredActions,
      onSelect: handleSelect,
      selectedKey: selectedRequiredActionKey,
    },
    navigation: {
      canNavigateRequiredActions,
      hasNextRequiredAction,
      hasPreviousRequiredAction,
      onNext: handleNextRequiredAction,
      onPrevious: handlePreviousRequiredAction,
    },
  };
};

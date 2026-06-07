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
import type { QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { HITLDetailCollection } from "openapi/requests/types.gen";

import { createRequiredActionNavigationHandlers } from "./utils/requiredActionNavigation";
import { prefetchHitlDetail } from "./utils/requiredActionPrefetch";
import {
  findSelectedHITLRequiredActionIndex,
  getHITLRequiredActionKey,
  getHITLRequiredActions,
  type SetSelectedHITLRequiredAction,
  type SelectedHITLRequiredAction,
} from "./utils/requiredActionSelection";
import { isSelectedHITLRequiredActionStillInFetchedData } from "./utils/requiredActionVisibility";

type RequiredActionSelectionState = {
  readonly hasNextRequiredAction: boolean;
  readonly hasPreviousRequiredAction: boolean;
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly selected?: SelectedHITLRequiredAction;
  readonly selectedRequiredActionIndex: number;
  readonly selectedRequiredActionKey?: string;
  readonly visibleSelectedHITLRequiredAction?: SelectedHITLRequiredAction;
};

const computeRequiredActionSelectionState = ({
  hitlData,
  isLoading,
  selected,
}: {
  readonly hitlData?: HITLDetailCollection;
  readonly isLoading: boolean;
  readonly selected?: SelectedHITLRequiredAction;
}): RequiredActionSelectionState => {
  const requiredActions = getHITLRequiredActions({ hitlData });
  const selectedRequiredActionKey = selected === undefined ? undefined : getHITLRequiredActionKey(selected);
  const selectedRequiredActionIndex = findSelectedHITLRequiredActionIndex({
    requiredActions,
    selectedRequiredActionKey,
  });
  const hasNextRequiredAction =
    selectedRequiredActionIndex === -1
      ? requiredActions.length > 0
      : selectedRequiredActionIndex < requiredActions.length - 1;
  const hasPreviousRequiredAction =
    selectedRequiredActionIndex === -1 ? requiredActions.length > 0 : selectedRequiredActionIndex > 0;
  const visibleSelectedHITLRequiredAction = isSelectedHITLRequiredActionStillInFetchedData({
    hitlData,
    hitlIsLoading: isLoading,
    selectedRequiredAction: selected,
  })
    ? selected
    : undefined;

  return {
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    requiredActions,
    selectedRequiredActionIndex,
    selectedRequiredActionKey,
    visibleSelectedHITLRequiredAction,
  };
};

const useClearMissingSelectedRequiredAction = ({
  hitlData,
  isLoading,
  selectedRequiredActionIndex,
  selectedRequiredActionKey,
  setSelected,
}: {
  readonly hitlData?: HITLDetailCollection;
  readonly isLoading: boolean;
  readonly selectedRequiredActionIndex: number;
  readonly selectedRequiredActionKey?: string;
  readonly setSelected: SetSelectedHITLRequiredAction;
}) => {
  useEffect(() => {
    if (
      selectedRequiredActionKey === undefined ||
      isLoading ||
      hitlData === undefined ||
      selectedRequiredActionIndex !== -1
    ) {
      return;
    }

    setSelected(undefined);
  }, [hitlData, isLoading, selectedRequiredActionIndex, selectedRequiredActionKey, setSelected]);
};

const useAutoSelectFirstRequiredAction = ({
  open,
  requiredActions,
  selected,
  setSelected,
}: {
  readonly open: boolean;
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly selected?: SelectedHITLRequiredAction;
  readonly setSelected: SetSelectedHITLRequiredAction;
}) => {
  useEffect(() => {
    if (!open || selected !== undefined) {
      return;
    }

    const [firstRequiredAction] = requiredActions;

    if (firstRequiredAction !== undefined) {
      setSelected(firstRequiredAction);
    }
  }, [open, requiredActions, selected, setSelected]);
};

const usePrefetchAdjacentRequiredActions = ({
  queryClient,
  requiredActions,
  selectedRequiredActionIndex,
}: {
  readonly queryClient: QueryClient;
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly selectedRequiredActionIndex: number;
}) => {
  useEffect(() => {
    if (selectedRequiredActionIndex === -1) {
      return;
    }

    const adjacentRequiredActions = [
      requiredActions[selectedRequiredActionIndex - 1],
      requiredActions[selectedRequiredActionIndex + 1],
    ];

    for (const requiredAction of adjacentRequiredActions) {
      if (requiredAction !== undefined) {
        prefetchHitlDetail(queryClient, requiredAction.item);
      }
    }
  }, [requiredActions, queryClient, selectedRequiredActionIndex]);
};

export const useRequiredActionSelection = ({
  hitlData,
  isLoading,
  open,
  queryClient,
}: {
  readonly hitlData?: HITLDetailCollection;
  readonly isLoading: boolean;
  readonly open: boolean;
  readonly queryClient: QueryClient;
}) => {
  const [selected, setSelected] = useState<SelectedHITLRequiredAction | undefined>(undefined);
  const selectionState = computeRequiredActionSelectionState({
    hitlData,
    isLoading,
    selected,
  });
  const {
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    requiredActions,
    selectedRequiredActionIndex,
    selectedRequiredActionKey,
    visibleSelectedHITLRequiredAction,
  } = selectionState;

  useClearMissingSelectedRequiredAction({
    hitlData,
    isLoading,
    selectedRequiredActionIndex,
    selectedRequiredActionKey,
    setSelected,
  });
  useAutoSelectFirstRequiredAction({
    open,
    requiredActions,
    selected,
    setSelected,
  });
  usePrefetchAdjacentRequiredActions({
    queryClient,
    requiredActions,
    selectedRequiredActionIndex,
  });

  const { handleNextRequiredAction, handlePreviousRequiredAction, selectNextRequiredActionAfterResponse } =
    createRequiredActionNavigationHandlers({
      requiredActions,
      selectedRequiredActionKey,
      setSelected,
    });

  const handleSelect = (next: SelectedHITLRequiredAction) => {
    setSelected((current) => {
      const nextIsSelected =
        current !== undefined && getHITLRequiredActionKey(current) === getHITLRequiredActionKey(next);

      return nextIsSelected ? undefined : next;
    });
  };

  return {
    canNavigateRequiredActions: requiredActions.length > 0,
    handleNextRequiredAction,
    handlePreviousRequiredAction,
    handleSelect,
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    selectedRequiredActionKey,
    selectNextRequiredActionAfterResponse,
    visibleSelectedHITLRequiredAction,
  };
};

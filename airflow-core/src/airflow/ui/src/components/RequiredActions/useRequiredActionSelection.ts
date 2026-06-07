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

import { buildRequiredActionNavigation } from "./utils/requiredActionNavigation";
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

type RequiredActionSelectionEffectsProps = {
  readonly hitlData?: HITLDetailCollection;
  readonly isLoading: boolean;
  readonly open: boolean;
  readonly queryClient: QueryClient;
  readonly setSelected: SetSelectedHITLRequiredAction;
} & RequiredActionSelectionState;

const useRequiredActionSelectionState = ({
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
    selected,
    selectedRequiredActionIndex,
    selectedRequiredActionKey,
    visibleSelectedHITLRequiredAction,
  };
};

const useRequiredActionSelectionEffects = ({
  hitlData,
  isLoading,
  open,
  queryClient,
  requiredActions,
  selected,
  selectedRequiredActionIndex,
  selectedRequiredActionKey,
  setSelected,
}: RequiredActionSelectionEffectsProps) => {
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

  useEffect(() => {
    if (!open || selected !== undefined) {
      return;
    }

    const [firstRequiredAction] = requiredActions;

    if (firstRequiredAction !== undefined) {
      setSelected(firstRequiredAction);
    }
  }, [open, requiredActions, selected, setSelected]);

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
  const selectionState = useRequiredActionSelectionState({
    hitlData,
    isLoading,
    selected,
  });
  const {
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    requiredActions,
    selectedRequiredActionKey,
    visibleSelectedHITLRequiredAction,
  } = selectionState;

  useRequiredActionSelectionEffects({
    ...selectionState,
    hitlData,
    isLoading,
    open,
    queryClient,
    setSelected,
  });

  const { handleNextRequiredAction, handlePreviousRequiredAction, selectNextRequiredAction } =
    buildRequiredActionNavigation({
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
    selectNextRequiredAction,
    visibleSelectedHITLRequiredAction,
  };
};

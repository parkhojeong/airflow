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

import { prefetchHitlDetail } from "./requiredActionPrefetchUtils";
import { getRequiredActionKey, type SelectedRequiredAction } from "./requiredActionSelection";

const isSelectedRequiredActionStillInFetchedData = ({
  hitlData,
  hitlIsLoading,
  selectedRequiredAction,
}: {
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsLoading: boolean;
  readonly selectedRequiredAction?: SelectedRequiredAction;
}) => {
  if (selectedRequiredAction === undefined) {
    return false;
  }

  const selectedRequiredActionKey = getRequiredActionKey(selectedRequiredAction);

  if (hitlIsLoading) {
    return true;
  }

  return (
    hitlData?.hitl_details.some(
      (hitlDetail) => getRequiredActionKey({ item: hitlDetail, type: "hitl" }) === selectedRequiredActionKey,
    ) === true
  );
};

const getRequiredActions = ({ hitlData }: { readonly hitlData?: HITLDetailCollection }) =>
  (hitlData?.hitl_details ?? []).map((item) => ({ item, type: "hitl" }) as const);

const getNextRequiredAction = ({
  requiredActions,
  selectedRequiredActionKey,
}: {
  readonly requiredActions: Array<SelectedRequiredAction>;
  readonly selectedRequiredActionKey?: string;
}) => {
  if (selectedRequiredActionKey === undefined) {
    return requiredActions[0];
  }

  const selectedRequiredActionIndex = requiredActions.findIndex(
    (requiredAction) => getRequiredActionKey(requiredAction) === selectedRequiredActionKey,
  );

  if (selectedRequiredActionIndex === -1) {
    return requiredActions[0];
  }

  return requiredActions[selectedRequiredActionIndex + 1];
};

const getPreviousRequiredAction = ({
  requiredActions,
  selectedRequiredActionKey,
}: {
  readonly requiredActions: Array<SelectedRequiredAction>;
  readonly selectedRequiredActionKey?: string;
}) => {
  if (selectedRequiredActionKey === undefined) {
    return requiredActions.at(-1);
  }

  const selectedRequiredActionIndex = requiredActions.findIndex(
    (requiredAction) => getRequiredActionKey(requiredAction) === selectedRequiredActionKey,
  );

  if (selectedRequiredActionIndex === -1) {
    return requiredActions.at(-1);
  }

  return requiredActions[selectedRequiredActionIndex - 1];
};

const getNextRequiredActionAfterResponse = ({
  requiredActions,
  selectedRequiredActionKey,
}: {
  readonly requiredActions: Array<SelectedRequiredAction>;
  readonly selectedRequiredActionKey?: string;
}) => {
  const selectedRequiredActionIndex = requiredActions.findIndex(
    (requiredAction) => getRequiredActionKey(requiredAction) === selectedRequiredActionKey,
  );
  const remainingRequiredActions = requiredActions.filter(
    (requiredAction) => getRequiredActionKey(requiredAction) !== selectedRequiredActionKey,
  );

  if (selectedRequiredActionIndex === -1) {
    return remainingRequiredActions[0];
  }

  return remainingRequiredActions[selectedRequiredActionIndex] ?? remainingRequiredActions[0];
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
  const [selected, setSelected] = useState<SelectedRequiredAction | undefined>(undefined);
  const requiredActions = getRequiredActions({ hitlData });
  const selectedRequiredActionKey = selected === undefined ? undefined : getRequiredActionKey(selected);
  const selectedRequiredActionIndex = requiredActions.findIndex(
    (requiredAction) => getRequiredActionKey(requiredAction) === selectedRequiredActionKey,
  );
  const hasNextRequiredAction =
    selectedRequiredActionIndex === -1
      ? requiredActions.length > 0
      : selectedRequiredActionIndex < requiredActions.length - 1;
  const hasPreviousRequiredAction =
    selectedRequiredActionIndex === -1 ? requiredActions.length > 0 : selectedRequiredActionIndex > 0;
  const visibleSelectedRequiredAction = isSelectedRequiredActionStillInFetchedData({
    hitlData,
    hitlIsLoading: isLoading,
    selectedRequiredAction: selected,
  })
    ? selected
    : undefined;

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
  }, [hitlData, isLoading, selectedRequiredActionIndex, selectedRequiredActionKey]);

  useEffect(() => {
    if (!open || selected !== undefined) {
      return;
    }

    const [firstRequiredAction] = getRequiredActions({ hitlData });

    if (firstRequiredAction !== undefined) {
      setSelected(firstRequiredAction);
    }
  }, [hitlData, open, selected]);

  useEffect(() => {
    if (selectedRequiredActionIndex === -1) {
      return;
    }

    const adjacentRequiredActions = [
      requiredActions[selectedRequiredActionIndex - 1],
      requiredActions[selectedRequiredActionIndex + 1],
    ];

    for (const requiredAction of adjacentRequiredActions) {
      if (requiredAction?.type === "hitl") {
        prefetchHitlDetail(queryClient, requiredAction.item);
      }
    }
  }, [requiredActions, queryClient, selectedRequiredActionIndex]);

  const selectNextRequiredAction = () => {
    setSelected(
      getNextRequiredActionAfterResponse({
        requiredActions,
        selectedRequiredActionKey,
      }),
    );
  };

  const handleNextRequiredAction = () => {
    setSelected(getNextRequiredAction({ requiredActions, selectedRequiredActionKey }));
  };

  const handlePreviousRequiredAction = () => {
    setSelected(getPreviousRequiredAction({ requiredActions, selectedRequiredActionKey }));
  };

  const handleSelect = (next: SelectedRequiredAction) => {
    setSelected((current) => {
      const nextIsSelected =
        current !== undefined && getRequiredActionKey(current) === getRequiredActionKey(next);

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
    visibleSelectedRequiredAction,
  };
};

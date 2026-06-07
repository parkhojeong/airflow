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
import { useEffect } from "react";

import type { HITLDetailCollection } from "openapi/requests/types.gen";

import {
  findSelectedHITLRequiredActionIndex,
  getHITLRequiredActionKey,
  getHITLRequiredActions,
  type SetSelectedHITLRequiredAction,
  type SelectedHITLRequiredAction,
} from "./utils/requiredActionSelection";

export type RequiredActionSelectionState = {
  readonly hasNextRequiredAction: boolean;
  readonly hasPreviousRequiredAction: boolean;
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly selectedRequiredActionIndex: number;
  readonly selectedRequiredActionKey?: string;
  readonly visibleSelectedHITLRequiredAction?: SelectedHITLRequiredAction;
};

export const getRequiredActionSelectionState = ({
  hitlData,
  selected,
}: {
  readonly hitlData?: HITLDetailCollection;
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
  const visibleSelectedHITLRequiredAction = selectedRequiredActionIndex === -1 ? undefined : selected;

  return {
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    requiredActions,
    selectedRequiredActionIndex,
    selectedRequiredActionKey,
    visibleSelectedHITLRequiredAction,
  };
};

export const useAutoSelectFirstRequiredAction = ({
  open,
  requiredActions,
  setSelected,
  visibleSelected,
}: {
  readonly open: boolean;
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly setSelected: SetSelectedHITLRequiredAction;
  readonly visibleSelected?: SelectedHITLRequiredAction;
}) => {
  useEffect(() => {
    if (!open || visibleSelected !== undefined) {
      return;
    }

    const [firstRequiredAction] = requiredActions;

    if (firstRequiredAction !== undefined) {
      setSelected(firstRequiredAction);
    }
  }, [open, requiredActions, setSelected, visibleSelected]);
};

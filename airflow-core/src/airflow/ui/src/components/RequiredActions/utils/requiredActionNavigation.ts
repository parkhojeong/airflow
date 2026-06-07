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
import {
  findSelectedHITLRequiredActionIndex,
  getHITLRequiredActionKey,
  type SelectedHITLRequiredAction,
  type SetSelectedHITLRequiredAction,
} from "./requiredActionSelection";

export const getNextRequiredAction = ({
  requiredActions,
  selectedRequiredActionKey,
}: {
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly selectedRequiredActionKey?: string;
}) => {
  const selectedRequiredActionIndex = findSelectedHITLRequiredActionIndex({
    requiredActions,
    selectedRequiredActionKey,
  });

  return selectedRequiredActionIndex === -1
    ? requiredActions[0]
    : requiredActions[selectedRequiredActionIndex + 1];
};

export const getPreviousRequiredAction = ({
  requiredActions,
  selectedRequiredActionKey,
}: {
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly selectedRequiredActionKey?: string;
}) => {
  const selectedRequiredActionIndex = findSelectedHITLRequiredActionIndex({
    requiredActions,
    selectedRequiredActionKey,
  });

  return selectedRequiredActionIndex === -1
    ? requiredActions.at(-1)
    : requiredActions[selectedRequiredActionIndex - 1];
};

export const getNextRequiredActionAfterResponse = ({
  requiredActions,
  selectedRequiredActionKey,
}: {
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly selectedRequiredActionKey?: string;
}) => {
  const selectedRequiredActionIndex = findSelectedHITLRequiredActionIndex({
    requiredActions,
    selectedRequiredActionKey,
  });
  const remainingRequiredActions = requiredActions.filter(
    (requiredAction) => getHITLRequiredActionKey(requiredAction) !== selectedRequiredActionKey,
  );

  if (selectedRequiredActionIndex === -1) {
    return remainingRequiredActions[0];
  }

  return remainingRequiredActions[selectedRequiredActionIndex] ?? remainingRequiredActions[0];
};

export const createRequiredActionNavigationHandlers = ({
  requiredActions,
  selectedRequiredActionKey,
  setSelected,
}: {
  readonly requiredActions: Array<SelectedHITLRequiredAction>;
  readonly selectedRequiredActionKey?: string;
  readonly setSelected: SetSelectedHITLRequiredAction;
}) => {
  const selectNextRequiredActionAfterResponse = () => {
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

  return {
    handleNextRequiredAction,
    handlePreviousRequiredAction,
    selectNextRequiredActionAfterResponse,
  };
};

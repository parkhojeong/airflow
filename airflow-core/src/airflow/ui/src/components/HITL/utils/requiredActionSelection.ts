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
import type { HITLDetail } from "openapi/requests/types.gen";

export const getHITLRequiredActionKey = (detail?: HITLDetail): string | undefined =>
  detail === undefined ? undefined : `hitl:${detail.task_instance.id}`;

export const getRequiredActionSelectionState = ({
  requiredActions,
  selectedRequiredActionKey,
}: {
  readonly requiredActions: Array<HITLDetail>;
  readonly selectedRequiredActionKey?: string;
}): {
  readonly hasNextRequiredAction: boolean;
  readonly hasPreviousRequiredAction: boolean;
  readonly selectedRequiredAction?: HITLDetail;
  readonly selectedRequiredActionIndex: number;
} => {
  const selectedRequiredActionIndex =
    selectedRequiredActionKey === undefined
      ? -1
      : requiredActions.findIndex(
          (requiredAction) => getHITLRequiredActionKey(requiredAction) === selectedRequiredActionKey,
        );

  if (selectedRequiredActionIndex === -1) {
    return {
      hasNextRequiredAction: requiredActions.length > 0,
      hasPreviousRequiredAction: requiredActions.length > 0,
      selectedRequiredAction: undefined,
      selectedRequiredActionIndex,
    };
  }

  return {
    hasNextRequiredAction: selectedRequiredActionIndex < requiredActions.length - 1,
    hasPreviousRequiredAction: selectedRequiredActionIndex > 0,
    selectedRequiredAction: requiredActions[selectedRequiredActionIndex],
    selectedRequiredActionIndex,
  };
};

export const getRequiredActionToSelect = ({
  direction,
  requiredActions,
  selectedRequiredActionIndex,
}: {
  readonly direction: "next" | "previous";
  readonly requiredActions: Array<HITLDetail>;
  readonly selectedRequiredActionIndex: number;
}): HITLDetail | undefined => {
  if (direction === "previous") {
    if (selectedRequiredActionIndex === -1) {
      return requiredActions.at(-1);
    }

    return requiredActions[selectedRequiredActionIndex - 1];
  }

  if (selectedRequiredActionIndex === -1) {
    return requiredActions[0];
  }

  return requiredActions[selectedRequiredActionIndex + 1];
};

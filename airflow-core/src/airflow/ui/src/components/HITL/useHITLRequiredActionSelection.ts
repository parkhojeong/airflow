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
import { useEffect, useState } from "react";

import type { HITLDetail } from "openapi/requests/types.gen";

import {
  getHITLRequiredActionKey,
  getRequiredActionSelectionState,
  getRequiredActionToSelect,
} from "./utils/requiredActionSelection";

export const useHITLRequiredActionSelection = ({
  open,
  requiredActions,
}: {
  readonly open: boolean;
  readonly requiredActions: Array<HITLDetail>;
}) => {
  const [selectedRequiredActionKey, setSelectedRequiredActionKey] = useState<string | undefined>(undefined);
  const {
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    selectedRequiredAction,
    selectedRequiredActionIndex,
  } = getRequiredActionSelectionState({
    requiredActions,
    selectedRequiredActionKey,
  });
  const [firstRequiredAction] = requiredActions;

  useEffect(() => {
    if (!open || selectedRequiredAction !== undefined || firstRequiredAction === undefined) {
      return;
    }

    setSelectedRequiredActionKey(getHITLRequiredActionKey(firstRequiredAction));
  }, [firstRequiredAction, open, selectedRequiredAction]);

  const handleSelect = (next: HITLDetail) => {
    const nextKey = getHITLRequiredActionKey(next);

    setSelectedRequiredActionKey((current) => (current === nextKey ? undefined : nextKey));
  };
  const handleNextRequiredAction = () => {
    const nextRequiredAction = getRequiredActionToSelect({
      direction: "next",
      requiredActions,
      selectedRequiredActionIndex,
    });

    setSelectedRequiredActionKey(getHITLRequiredActionKey(nextRequiredAction));
  };
  const handlePreviousRequiredAction = () => {
    const previousRequiredAction = getRequiredActionToSelect({
      direction: "previous",
      requiredActions,
      selectedRequiredActionIndex,
    });

    setSelectedRequiredActionKey(getHITLRequiredActionKey(previousRequiredAction));
  };
  const selectNextRequiredActionAfterResponse = () => {
    const nextRequiredAction = getRequiredActionToSelect({
      direction: "next",
      requiredActions,
      selectedRequiredActionIndex,
    });

    setSelectedRequiredActionKey(getHITLRequiredActionKey(nextRequiredAction));
  };

  return {
    handleNextRequiredAction,
    handlePreviousRequiredAction,
    handleSelect,
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    selectedRequiredAction,
    selectedRequiredActionKey,
    selectNextRequiredActionAfterResponse,
  };
};

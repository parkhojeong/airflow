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

import { getActionToSelect, getHITLActionKey, getSelectionState } from "./utils/actionSelection";

export const useHITLActionSelection = ({
  actions,
  open,
}: {
  readonly actions: Array<HITLDetail>;
  readonly open: boolean;
}) => {
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const selectionState = getSelectionState({
    actions,
    selectedKey,
  });
  const [firstAction] = actions;

  useEffect(() => {
    if (!open || selectionState.selected !== undefined || firstAction === undefined) {
      return;
    }

    setSelectedKey(getHITLActionKey(firstAction));
  }, [firstAction, open, selectionState.selected]);

  const onSelect = (next: HITLDetail) => {
    const nextKey = getHITLActionKey(next);

    setSelectedKey((current) => (current === nextKey ? undefined : nextKey));
  };
  const onNext = () => {
    const nextAction = getActionToSelect({
      actions,
      direction: "next",
      index: selectionState.index,
    });

    setSelectedKey(getHITLActionKey(nextAction));
  };
  const onPrevious = () => {
    const previousAction = getActionToSelect({
      actions,
      direction: "previous",
      index: selectionState.index,
    });

    setSelectedKey(getHITLActionKey(previousAction));
  };
  const onResponded = () => {
    const nextAction = getActionToSelect({
      actions,
      direction: "next",
      index: selectionState.index,
    });

    setSelectedKey(getHITLActionKey(nextAction));
  };

  return {
    onNext,
    onPrevious,
    onResponded,
    onSelect,
    selectedKey,
    selectionState,
  };
};

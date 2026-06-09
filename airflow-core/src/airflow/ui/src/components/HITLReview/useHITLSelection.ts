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

import type { HITLDetail } from "openapi/requests/types.gen.ts";

import { getHITLDetailKey } from "./utils/actionSelection.ts";

const getNavigationState = ({
  hitlDetails,
  selectedKey,
}: {
  readonly hitlDetails: Array<HITLDetail>;
  readonly selectedKey?: string;
}): {
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly index: number;
} => {
  const index = hitlDetails.findIndex((hitlDetail) => getHITLDetailKey(hitlDetail) === selectedKey);

  if (selectedKey === undefined || index === -1) {
    return {
      hasNext: false,
      hasPrevious: false,
      index: -1,
    };
  }

  return {
    hasNext: index < hitlDetails.length - 1,
    hasPrevious: index > 0,
    index,
  };
};

const getHitl = ({
  direction,
  hitlDetails,
  index,
}: {
  readonly direction: "next" | "previous";
  readonly hitlDetails: Array<HITLDetail>;
  readonly index: number;
}): HITLDetail | undefined => {
  if (direction === "previous" && index === 0) {
    return undefined;
  }
  if (direction === "next" && index === hitlDetails.length - 1) {
    return undefined;
  }

  return direction === "previous" ? hitlDetails[index - 1] : hitlDetails[index + 1];
};

export const useHITLSelection = ({
  hitlDetails,
  open,
}: {
  readonly hitlDetails: Array<HITLDetail>;
  readonly open: boolean;
}) => {
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const selectHitl = (hitl?: HITLDetail) => {
    if (hitl === undefined) {
      setSelectedKey(undefined);

      return;
    }

    setSelectedKey(getHITLDetailKey(hitl));
  };
  const selectionState = getNavigationState({
    hitlDetails,
    selectedKey,
  });
  const [firstHitl] = hitlDetails;

  useEffect(() => {
    if (!open || selectionState.index !== -1 || firstHitl === undefined) {
      return;
    }

    selectHitl(firstHitl);
  }, [firstHitl, open, selectionState.index]);

  const onNext = () => {
    const hitl = getHitl({
      direction: "next",
      hitlDetails,
      index: selectionState.index,
    });

    selectHitl(hitl);
  };
  const onPrevious = () => {
    const hitl = getHitl({
      direction: "previous",
      hitlDetails,
      index: selectionState.index,
    });

    selectHitl(hitl);
  };

  return {
    onNext,
    onPrevious,
    onResponded: onNext,
    onSelect: selectHitl,
    selectedKey,
    selectionState,
  };
};

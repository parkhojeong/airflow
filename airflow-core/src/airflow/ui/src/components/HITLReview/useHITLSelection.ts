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

    setSelectedKey(hitl.task_instance.id);
  };
  const index = hitlDetails.findIndex((hitlDetail) => hitlDetail.task_instance.id === selectedKey);
  const hasNext = index === -1 ? false : index < hitlDetails.length - 1;
  const hasPrevious = index === -1 ? false : index > 0;

  useEffect(() => {
    if (!open || index !== -1 || hitlDetails.length === 0) {
      return;
    }

    selectHitl(hitlDetails[0]);
  }, [hitlDetails, open, index]);

  const onNext = () => {
    if (hasNext) {
      selectHitl(hitlDetails[index + 1]);
    }
  };

  const onPrevious = () => {
    if (hasPrevious) {
      selectHitl(hitlDetails[index - 1]);
    }
  };

  return {
    hasNext,
    hasPrevious,
    onNext,
    onPrevious,
    onSelect: selectHitl,
    selectedIndex: index,
    selectedKey,
  };
};

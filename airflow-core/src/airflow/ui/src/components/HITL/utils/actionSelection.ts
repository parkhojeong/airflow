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

export const getHITLActionKey = (detail?: HITLDetail): string | undefined =>
  detail === undefined ? undefined : `hitl:${detail.task_instance.id}`;

export const getSelectionState = ({
  actions,
  selectedKey,
}: {
  readonly actions: Array<HITLDetail>;
  readonly selectedKey?: string;
}): {
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly index: number;
  readonly selected?: HITLDetail;
} => {
  const index =
    selectedKey === undefined ? -1 : actions.findIndex((action) => getHITLActionKey(action) === selectedKey);

  if (index === -1) {
    return {
      hasNext: actions.length > 0,
      hasPrevious: actions.length > 0,
      index,
      selected: undefined,
    };
  }

  return {
    hasNext: index < actions.length - 1,
    hasPrevious: index > 0,
    index,
    selected: actions[index],
  };
};

export const getActionToSelect = ({
  actions,
  direction,
  index,
}: {
  readonly actions: Array<HITLDetail>;
  readonly direction: "next" | "previous";
  readonly index: number;
}): HITLDetail | undefined => {
  if (direction === "previous") {
    if (index === -1) {
      return actions.at(-1);
    }

    return actions[index - 1];
  }

  if (index === -1) {
    return actions[0];
  }

  return actions[index + 1];
};

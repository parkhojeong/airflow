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
import type { HITLDetail, HITLDetailCollection } from "openapi/requests/types.gen";

export type SelectedRequiredAction = { readonly item: HITLDetail; readonly type: "hitl" };

export type SetSelectedRequiredAction = (selected?: SelectedRequiredAction) => void;

export const getRequiredActionKey = (selection: SelectedRequiredAction): string =>
  `hitl:${selection.item.task_instance.id}`;

export const getRequiredActions = ({ hitlData }: { readonly hitlData?: HITLDetailCollection }) =>
  (hitlData?.hitl_details ?? []).map((item) => ({ item, type: "hitl" }) as const);

export const findSelectedRequiredActionIndex = ({
  requiredActions,
  selectedRequiredActionKey,
}: {
  readonly requiredActions: Array<SelectedRequiredAction>;
  readonly selectedRequiredActionKey?: string;
}) => {
  if (selectedRequiredActionKey === undefined) {
    return -1;
  }

  return requiredActions.findIndex(
    (requiredAction) => getRequiredActionKey(requiredAction) === selectedRequiredActionKey,
  );
};

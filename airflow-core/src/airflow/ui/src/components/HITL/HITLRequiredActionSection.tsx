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
import {
  RequiredActionSection,
  RequiredActionTypeSection,
  StatusText,
} from "src/components/RequiredActions/RequiredActionsListComponents";

import { HITLRequiredActionsTable } from "./HITLRequiredActionsTable";
import type { SelectedHITLRequiredAction } from "./utils/requiredActionSelection";

const LOAD_HITL_ERROR_LABEL = "Unable to load HITL actions";
const LOADING_HITL_LABEL = "Loading HITL actions...";

export const HITLRequiredActionSection = ({
  details,
  emptyLabel,
  heading,
  isError = false,
  isLoading = false,
  onSelect,
  selectedKey,
}: {
  readonly details?: Array<HITLDetail>;
  readonly emptyLabel: string;
  readonly heading: string;
  readonly isError?: boolean;
  readonly isLoading?: boolean;
  readonly onSelect: (selection: SelectedHITLRequiredAction) => void;
  readonly selectedKey?: string;
}) => (
  <RequiredActionTypeSection heading={heading}>
    <RequiredActionSection>
      {isLoading ? (
        <StatusText>{LOADING_HITL_LABEL}</StatusText>
      ) : isError ? (
        <StatusText tone="error">{LOAD_HITL_ERROR_LABEL}</StatusText>
      ) : (
        <HITLRequiredActionsTable
          details={details ?? []}
          emptyLabel={emptyLabel}
          onSelect={onSelect}
          selectedKey={selectedKey}
        />
      )}
    </RequiredActionSection>
  </RequiredActionTypeSection>
);

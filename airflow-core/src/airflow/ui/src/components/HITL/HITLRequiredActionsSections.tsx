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

import { HITLRequiredActionSection } from "./HITLRequiredActionSection";
import type { SelectedHITLRequiredAction } from "./utils/requiredActionSelection";

const NO_REQUIRED_ACTIONS_LABEL = "No required actions";
const NO_HITL_ACTIONS_LABEL = "No HITL actions";
const NO_COMPLETED_HITL_ACTIONS_LABEL = "No completed HITL actions";
const PENDING_HITL_LABEL = "Pending HITL";
const COMPLETED_HITL_LABEL = "Completed HITL";

type HITLRequiredActionsSectionProps = {
  readonly details: Array<HITLDetail>;
  readonly onSelect: (selection: SelectedHITLRequiredAction) => void;
  readonly selectedKey?: string;
};

type CompletedHITLRequiredActionsSectionProps = {
  readonly hasHITLDetails: boolean;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
} & HITLRequiredActionsSectionProps;

const getSectionLabel = (label: string, count?: number) =>
  count === undefined ? label : `${label} (${count})`;

export const PendingHITLRequiredActionsSection = ({
  details,
  onSelect,
  selectedKey,
}: HITLRequiredActionsSectionProps) => (
  <HITLRequiredActionSection
    details={details}
    emptyLabel={NO_REQUIRED_ACTIONS_LABEL}
    heading={getSectionLabel(PENDING_HITL_LABEL, details.length)}
    onSelect={onSelect}
    selectedKey={selectedKey}
  />
);

export const CompletedHITLRequiredActionsSection = ({
  details,
  hasHITLDetails,
  hitlIsError,
  hitlIsLoading,
  onSelect,
  selectedKey,
}: CompletedHITLRequiredActionsSectionProps) => (
  <HITLRequiredActionSection
    details={details}
    emptyLabel={hasHITLDetails ? NO_COMPLETED_HITL_ACTIONS_LABEL : NO_HITL_ACTIONS_LABEL}
    heading={getSectionLabel(COMPLETED_HITL_LABEL, details.length)}
    isError={hitlIsError}
    isLoading={hitlIsLoading}
    onSelect={onSelect}
    selectedKey={selectedKey}
  />
);
